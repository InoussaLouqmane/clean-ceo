// GET /api/rank?pid=… : rang d'un joueur au classement XP (ligne « Toi » du
// classement du menu). L'identifiant est celui, anonyme, du navigateur.
import { hasRedis, pipeline, PREFIX } from './_redis.js';
import { levelInfo } from '../src/game/economy.js';

const ID = /^[a-z0-9-]{8,40}$/;
const json = (data) => new Response(JSON.stringify(data), {
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, max-age=30' },
});

export async function GET(request) {
  const pid = new URL(request.url).searchParams.get('pid') ?? '';
  if (!hasRedis() || !ID.test(pid)) return json({ ready: false });
  try {
    const [rank, xp, total] = await pipeline([
      ['ZREVRANK', PREFIX + 'xp', pid],
      ['ZSCORE', PREFIX + 'xp', pid],
      ['ZCARD', PREFIX + 'xp'],
    ]);
    if (rank === null) return json({ ready: true, ranked: false, total });
    const score = Number(xp);
    return json({ ready: true, ranked: true, rank: rank + 1, total, xp: score, level: levelInfo(score).level });
  } catch (error) {
    console.error('Rang indisponible', error);
    return json({ ready: false });
  }
}
