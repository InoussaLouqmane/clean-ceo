// GET /api/stats : chiffres publics de la page /stats. Mis en cache 60 s par le
// CDN de Vercel, pour ne pas solliciter Redis à chaque visite de la page.
import { hasRedis, pipeline, PREFIX, cotonouDate } from './_redis.js';
import { levelInfo } from '../src/game/economy.js';

const TOP = 5;
const json = (data, cache) => new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cache ? 'public, s-maxage=60, stale-while-revalidate=120' : 'no-store',
  },
});

// ZREVRANGE … WITHSCORES renvoie [membre, score, membre, score…]
const pairs = (flat) => {
  const out = [];
  for (let i = 0; i < (flat?.length ?? 0); i += 2) out.push([flat[i], Number(flat[i + 1])]);
  return out;
};

export async function GET() {
  if (!hasRedis()) return json({ ready: false }, false);
  try {
    const k = (s) => PREFIX + s;
    const [players, today, topXp, longest] = await pipeline([
      ['PFCOUNT', k('players')],
      ['PFCOUNT', k(`players:${cotonouDate()}`)],
      ['ZREVRANGE', k('xp'), 0, TOP - 1, 'WITHSCORES'],
      ['ZREVRANGE', k('longest'), 0, TOP - 1, 'WITHSCORES'],
    ]);
    const xpRows = pairs(topXp);
    const sessionRows = pairs(longest);
    const ids = [...new Set([...xpRows, ...sessionRows].map(([id]) => id))];
    const [names] = ids.length ? await pipeline([['HMGET', k('names'), ...ids]]) : [[]];
    const nameOf = Object.fromEntries(ids.map((id, i) => [id, names[i] || 'Joueur anonyme']));

    return json({
      ready: true,
      players,
      today,
      topXp: xpRows.map(([id, xp]) => ({ name: nameOf[id], xp, level: levelInfo(xp).level })),
      longest: sessionRows.map(([id, seconds]) => ({ name: nameOf[id], seconds })),
      updatedAt: new Date().toISOString(),
    }, true);
  } catch (error) {
    console.error('Stats indisponibles', error);
    return json({ ready: false }, false);
  }
}
