// Upstash Redis (Marketplace Vercel) par son API REST, sans dépendance.
// Variables injectées par l'intégration : KV_REST_API_URL et KV_REST_API_TOKEN.
// Toutes les clés de Clean CEO commencent par PREFIX (la base a servi à aihou-site).

const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const PREFIX = process.env.CC_STATS_PREFIX || 'cc:';
export const hasRedis = () => Boolean(url() && token());

async function call(path, body) {
  const res = await fetch(`${url()}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  return res.json();
}

/** Une commande : ['ZADD', clé, …]. */
export const command = async (cmd) => (await call('', cmd)).result;

/** Plusieurs commandes en un seul aller-retour ; renvoie le résultat de chacune. */
export const pipeline = async (cmds) => (await call('/pipeline', cmds)).map((r) => r.result);

/** Date du jour à Cotonou (UTC+1), AAAA-MM-JJ. */
export const cotonouDate = (ms = Date.now()) => new Date(ms + 3600000).toISOString().slice(0, 10);
