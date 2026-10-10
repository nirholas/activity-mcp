// Centralized env + HTTP base for the activity MCP.
//
// This server is a thin, read-only wrapper over the PUBLIC three.ws discovery
// API (/api/trending, /api/leaderboard, /api/feed). It signs nothing and holds
// no secret — the only knobs are which deployment to talk to and how long to
// wait. Every ranking, tier, and event comes from the live endpoints; nothing
// is computed or cached here.

export function env(key, fallback) {
	const v = process.env[key];
	return v !== undefined && String(v).trim() !== '' ? String(v).trim() : fallback;
}

// Base URL of the three.ws API. Override only when self-hosting or pointing at a
// preview deployment.
export const THREE_WS_BASE = env('THREE_WS_BASE', 'https://three.ws').replace(/\/+$/, '');

// Per-request timeout (ms). These are live reads (trending joins over usage
// events, a Helius holder scan on a cold cache) — generous enough to ride out a
// cold edge, fast in practice.
export const HTTP_TIMEOUT_MS = (() => {
	const raw = env('THREE_WS_TIMEOUT_MS');
	if (raw === undefined) return 20000;
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0) {
		throw Object.assign(new Error(`THREE_WS_TIMEOUT_MS must be a positive number (got "${raw}")`), {
			code: 'bad_config',
		});
	}
	return n;
})();

// Identifies this client to the API in request logs.
export const USER_AGENT = '@three-ws/activity-mcp';
