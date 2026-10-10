<p align="center">
  <a href="https://three.ws"><img src="https://three.ws/three-ws-mcp-icon.svg" alt="three.ws" width="88" height="88"></a>
</p>

<h1 align="center">@three-ws/activity-mcp</h1>

<p align="center"><strong>What's hot on three.ws right now — trending agents and coins, the $THREE holder leaderboard with tiers, and the site-wide activity ticker, from any AI agent.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@three-ws/activity-mcp"><img alt="npm" src="https://img.shields.io/npm/v/@three-ws/activity-mcp?logo=npm&color=cb3837"></a>
  <img alt="license" src="https://img.shields.io/npm/l/@three-ws/activity-mcp?color=3b82f6">
  <img alt="node" src="https://img.shields.io/node/v/@three-ws/activity-mcp?color=339933&logo=node.js">
  <a href="https://registry.modelcontextprotocol.io/?q=io.github.nirholas"><img alt="MCP Registry" src="https://img.shields.io/badge/MCP%20Registry-io.github.nirholas-0ea5e9"></a>
  <a href="https://three.ws"><img alt="three.ws" src="https://img.shields.io/badge/built%20by-three.ws-000"></a>
</p>

---

> A [Model Context Protocol](https://modelcontextprotocol.io) server that gives any AI assistant the three.ws **live discovery** surface over stdio. See which agents are trending by real chat activity, which coins the Oracle has the highest conviction in, where a wallet sits on the $THREE holder leaderboard, what each holder tier means, and what's happening across the platform right now — all live, read-only, no key required.

Every ranking, tier, and event comes straight from the public three.ws API. No API key, no signer, no payment — point `THREE_WS_BASE` at a deployment and go.

## Install

```bash
npm install @three-ws/activity-mcp
```

Or run with `npx` (no install):

```bash
npx @three-ws/activity-mcp
```

## Quick start

**Claude Code**, one line:

```bash
claude mcp add activity -- npx -y @three-ws/activity-mcp
```

**Claude Desktop / Cursor** (`claude_desktop_config.json` or `mcp.json`):

```json
{
	"mcpServers": {
		"activity": {
			"command": "npx",
			"args": ["-y", "@three-ws/activity-mcp"]
		}
	}
}
```

Inspect the surface with the MCP Inspector:

```bash
npx -y @modelcontextprotocol/inspector npx @three-ws/activity-mcp
```

## Tools

| Tool                     | Type      | What it does                                                                                                  |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------ |
| `get_trending_agents`    | read-only | Agents ranked by real chat activity over a 24h / 7d / all window — optionally blending wallet-trust reputation. |
| `get_trending_coins`     | read-only | Coins ranked by the Oracle's 0–100 conviction score, with momentum/pedigree/structure/narrative sub-scores.     |
| `get_holder_leaderboard` | read-only | The $THREE holder board ranked by on-chain balance, with tiers, the live market strip, and a "you are #N" lookup. |
| `get_tier_info`          | read-only | The $THREE holder tier ladder — each band's label, minimum balance, and badge accent.                           |
| `get_feed_events`        | read-only | The site-wide activity ticker — coin buys, agent deploys, level-ups, payments, and more, newest-first.          |

All five tools read live data: rankings, the holder board, and the feed all move between calls, so none are idempotent.

### Input parameters

**`get_trending_agents`** — `window` (`24h` | `7d` | `all`, default `24h`), `sort` (`activity` | `trust`, default `activity`), `limit` (1–20, default 10).

**`get_trending_coins`** — `limit` (1–20, default 10).

**`get_holder_leaderboard`** — `limit` (1–100, default 50), `offset` (default 0), `wallet` (optional base58 — adds the wallet's own `you` standing).

**`get_tier_info`** — no parameters.

**`get_feed_events`** — `limit` (1–100, default 30).

## Example

```jsonc
// get_trending_agents
> { "window": "7d", "limit": 2 }
{
  "ok": true,
  "window": "7d",
  "sort": "activity",
  "generated_at": "2026-06-24T12:00:00.000Z",
  "count": 2,
  "agents": [
    {
      "rank": 1,
      "id": "…",
      "name": "Luna",
      "description": "A 3D companion agent",
      "avatar_thumbnail_url": "https://…",
      "chat_count": 18420,
      "window_chats": 2310,
      "is_onchain": true,
      "agent_url": "https://three.ws/agent/…",
      "reputation": { "score": 82, "tier": "trusted", "tierLabel": "Trusted", "isNew": false }
    }
  ]
}
```

```jsonc
// get_holder_leaderboard
> { "limit": 1, "wallet": "FeMbDoX7R1Psc4GEcvJdsbNbZA3bfztcyDCatJVJpump" }
{
  "ok": true,
  "mint": "FeMbDoX7R1Psc4GEcvJdsbNbZA3bfztcyDCatJVJpump",
  "total": 4821,
  "supply": 1000000000,
  "decimals": 6,
  "holders": [
    { "rank": 1, "wallet": "…", "wallet_short": "AbCd…wXyZ", "amount": 42000000, "pct_of_supply": 0.042, "tier": "genesis" }
  ],
  "tiers": [ { "id": "genesis", "label": "Genesis", "min": 10000000, "accent": "#f5d0a9" } ],
  "market": { "price_usd": 0.0031, "market_cap": 3100000, "holders": 4821 },
  "you": { "rank": 137, "amount": 25400, "pct_of_supply": 0.0000254, "tier": "gold" }
}
```

The $THREE holder leaderboard is for **$THREE** — the only coin three.ws ranks holders for (CA `FeMbDoX7R1Psc4GEcvJdsbNbZA3bfztcyDCatJVJpump`). The trending-coins list is the platform's runtime launch-directory discovery data: a ranking of what the Oracle scored, never a recommendation of any coin.

## Requirements

- **Node.js >= 20.**
- Network access to `https://three.ws` (or your own `THREE_WS_BASE`).

### Environment variables

| Variable              | Required | Default            |
| --------------------- | -------- | ------------------ |
| `THREE_WS_BASE`       | no       | `https://three.ws` |
| `THREE_WS_TIMEOUT_MS` | no       | `20000`            |

## Links

- Homepage: https://three.ws
- Changelog: https://three.ws/changelog
- Issues: https://github.com/nirholas/three.ws/issues
- License: Apache-2.0, see [LICENSE](./LICENSE)

---

<p align="center">
  <sub>
    Part of the <a href="https://three.ws">three.ws</a> SDK suite — 3D AI agents, on-chain identity, and agent payments.<br/>
    <a href="https://three.ws">Website</a> · <a href="https://three.ws/changelog">Changelog</a> · <a href="https://github.com/nirholas/three.ws">GitHub</a>
  </sub>
</p>

<!-- three.ws:growth -->
## Support the project

If activity-mcp saves you time, **[star it on GitHub](https://github.com/nirholas/activity-mcp)**. Stars are how other developers and AI agents find the repositories worth trusting, and they cost you one click.

Know someone who would use it? [Post on X](https://twitter.com/intent/tweet?text=activity-mcp%3A%20three.ws%20live%20discovery%20surface%20from%20any%20AI%20agent%3A%20trending%20agents%20and%20coins%2C%20the%20%24THREE%20holder&url=https%3A%2F%2Fgithub.com%2Fnirholas%2Factivity-mcp) · [Share on Bluesky](https://bsky.app/intent/compose?text=activity-mcp%3A%20three.ws%20live%20discovery%20surface%20from%20any%20AI%20agent%3A%20trending%20agents%20and%20coins%2C%20the%20%24THREE%20holder%20https%3A%2F%2Fgithub.com%2Fnirholas%2Factivity-mcp) · [Share on LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fgithub.com%2Fnirholas%2Factivity-mcp) · [Submit to Hacker News](https://news.ycombinator.com/submitlink?u=https%3A%2F%2Fgithub.com%2Fnirholas%2Factivity-mcp&t=activity-mcp%3A%20three.ws%20live%20discovery%20surface%20from%20any%20AI%20agent%3A%20trending%20agents%20and%20coins%2C%20the%20%24THREE%20holder) · [Share on Reddit](https://www.reddit.com/submit?url=https%3A%2F%2Fgithub.com%2Fnirholas%2Factivity-mcp&title=activity-mcp%3A%20three.ws%20live%20discovery%20surface%20from%20any%20AI%20agent%3A%20trending%20agents%20and%20coins%2C%20the%20%24THREE%20holder)

## Built for AI agents too

Coding agents and LLM tooling can read this repo directly: [AGENTS.md](./AGENTS.md), [llms.txt](./llms.txt), [llms-full.txt](./llms-full.txt). Point an agent at `https://github.com/nirholas/activity-mcp` and it has the context it needs.

## More from the same author

- [All repositories by nirholas](https://github.com/nirholas/nirholas#readme): the full catalog, grouped by topic
- [three.ws](https://three.ws): the platform for 3D AI agents with Solana wallets, a skill marketplace and x402 payments
- Questions or ideas: [open an issue](https://github.com/nirholas/activity-mcp/issues) or [start a discussion](https://github.com/nirholas/activity-mcp/discussions)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=nirholas/activity-mcp)](https://github.com/nirholas/activity-mcp/graphs/contributors)

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=nirholas/activity-mcp&type=Date)](https://www.star-history.com/#nirholas/activity-mcp&Date)

<!-- /three.ws:growth -->

<!-- three.ws:ecosystem -->
## Part of three.ws

[three.ws](https://three.ws) is a platform for 3D AI agents with Solana wallets: avatars, a skill marketplace, x402 payments and more than seventy MCP servers. `@three-ws/activity-mcp` is one package from it.

- Documentation site: https://nirholas.github.io/activity-mcp/
- npm: https://www.npmjs.com/package/@three-ws/activity-mcp
- Canonical source: https://github.com/nirholas/three.ws (this repository is a generated mirror of `packages/activity-mcp`)
- Agent-readable summary: [llms.txt](./llms.txt) and [AGENTS.md](./AGENTS.md)
- Issues and ideas: https://github.com/nirholas/activity-mcp/issues
<!-- /three.ws:ecosystem -->
