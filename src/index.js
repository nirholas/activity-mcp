#!/usr/bin/env node
// @three-ws/activity-mcp — MCP server entry point.
//
// Gives any AI assistant the three.ws live discovery surface over stdio:
//   • get_trending_agents   — agents ranked by real chat activity (24h/7d/all)
//   • get_trending_coins     — coins ranked by Oracle conviction
//   • get_holder_leaderboard — the $THREE holder board, ranked by on-chain balance
//   • get_tier_info          — the $THREE holder tier ladder (thresholds + badges)
//   • get_feed_events        — the site-wide activity ticker, newest-first
//
// A thin wrapper over the PUBLIC three.ws API. No keys, no signer, no payment —
// point THREE_WS_BASE at a deployment and go.
//
// Run standalone:
//   node packages/activity-mcp/src/index.js
//
// Or wire into Claude Code / Cursor — see README.md.

import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { def as getTrendingAgents } from './tools/get-trending-agents.js';
import { def as getTrendingCoins } from './tools/get-trending-coins.js';
import { def as getHolderLeaderboard } from './tools/get-holder-leaderboard.js';
import { def as getTierInfo } from './tools/get-tier-info.js';
import { def as getFeedEvents } from './tools/get-feed-events.js';

// Single source of truth for the advertised server version — package.json.
const require = createRequire(import.meta.url);
const { version: PKG_VERSION } = require('../package.json');

export const TOOLS = [
	getTrendingAgents,
	getTrendingCoins,
	getHolderLeaderboard,
	getTierInfo,
	getFeedEvents,
];

/**
 * Construct a fully-registered McpServer without connecting a transport.
 * Registration is env-free, so this is safe to import from tests.
 * @returns {McpServer}
 */
export function buildServer() {
	const server = new McpServer(
		{ name: 'activity-mcp', title: 'three.ws Activity', version: PKG_VERSION },
		{
			capabilities: { tools: {} },
			instructions:
				'three.ws Activity MCP — the "what\'s hot right now" surface. get_trending_agents ranks ' +
				'agents by real chat activity over a 24h/7d/all window (optionally blending wallet-trust ' +
				'reputation). get_trending_coins ranks coins by the Oracle\'s conviction score — runtime ' +
				'launch-directory discovery data, not financial advice. get_holder_leaderboard returns the ' +
				'$THREE holder board ranked by on-chain balance, with each holder\'s tier and an optional ' +
				'"you are #N" lookup for a given wallet. get_tier_info returns the $THREE holder tier ladder ' +
				'(thresholds + badge accents). get_feed_events returns the site-wide activity ticker — coin ' +
				'buys, agent deploys, level-ups, payments, and more, newest-first. $THREE is the only coin ' +
				'three.ws ranks holders for. All data comes live from the public three.ws API — no API key, ' +
				'signer, or payment required. Every tool is read-only.',
		},
	);

	for (const tool of TOOLS) {
		server.registerTool(
			tool.name,
			{
				title: tool.title,
				description: tool.description,
				inputSchema: tool.inputSchema,
				annotations: tool.annotations,
			},
			async (args, extra) => {
				try {
					const result = await tool.handler(args, extra);
					const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
					return { content: [{ type: 'text', text }] };
				} catch (err) {
					const payload = {
						ok: false,
						error: err?.code || 'unhandled',
						message: err?.message || String(err),
						...(err?.status ? { status: err.status } : {}),
					};
					return {
						content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
						isError: true,
					};
				}
			},
		);
	}

	return server;
}

async function main() {
	const server = buildServer();
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error(`[activity-mcp@${PKG_VERSION}] connected over stdio with ${TOOLS.length} tools`);
}

// Connect stdio ONLY when this file is the process entry point. Importing the
// module (tests, embedding) must not grab the transport. realpath both sides:
// npm bin shims are symlinks, so argv[1] may differ from import.meta.url.
function isProcessEntryPoint() {
	if (!process.argv[1]) return false;
	try {
		return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
	} catch {
		return false;
	}
}

if (isProcessEntryPoint()) {
	main().catch((err) => {
		console.error('[activity-mcp] fatal:', err);
		process.exit(1);
	});
}
