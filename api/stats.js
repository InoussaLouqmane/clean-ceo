// GET /api/stats : chiffres publics. Mis en cache 60 s par le CDN de Vercel,
// pour ne pas solliciter Redis à chaque visite.
//   /api/stats         → résumé + top 5 (menu du jeu, haut de la page /stats)
//   /api/stats?all=1   → résumé + top 5 + TOUS les joueurs (tableau de /stats)
import { hasRedis, pipeline, PREFIX, cotonouDate } from './_redis.js';
import { levelInfo } from '../src/game/economy.js';

const TOP = 5;
const MAX_ALL = 2000; // garde-fou de taille de réponse
const ANON = 'Joueur anonyme';
const k = (s) => PREFIX + s;

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

export async function GET(request) {
  if (!hasRedis()) return json({ ready: false }, false);
  const all = new URL(request.url).searchParams.has('all');
  try {
    const [players, today, xpFlat, longFlat] = await pipeline([
      ['PFCOUNT', k('players')],
      ['PFCOUNT', k(`players:${cotonouDate()}`)],
      ['ZREVRANGE', k('xp'), 0, (all ? MAX_ALL : TOP) - 1, 'WITHSCORES'],
      ['ZREVRANGE', k('longest'), 0, TOP - 1, 'WITHSCORES'],
    ]);
    const xpRows = pairs(xpFlat);
    const sessionRows = pairs(longFlat);
    const ids = [...new Set([...xpRows, ...sessionRows].map(([id]) => id))];

    let names = [];
    let best = [];
    let seen = [];
    if (ids.length) {
      const cmds = [['HMGET', k('names'), ...ids]];
      if (all) cmds.push(['ZMSCORE', k('longest'), ...ids], ['HMGET', k('seen'), ...ids]);
      [names, best = [], seen = []] = await pipeline(cmds);
    }
    const info = Object.fromEntries(ids.map((id, i) => [id, {
      name: names[i] || ANON,
      seconds: Number(best[i]) || 0,
      seen: Number(seen[i]) || 0,
    }]));
    const player = ([id, xp]) => ({ name: info[id].name, xp, level: levelInfo(xp).level });

    return json({
      ready: true,
      players,
      today,
      topXp: xpRows.slice(0, TOP).map(player),
      longest: sessionRows.map(([id, seconds]) => ({ name: info[id].name, seconds })),
      ...(all && {
        everyone: xpRows.map(([id, xp]) => ({ ...player([id, xp]), seconds: info[id].seconds, seen: info[id].seen })),
      }),
      updatedAt: new Date().toISOString(),
    }, true);
  } catch (error) {
    console.error('Stats indisponibles', error);
    return json({ ready: false }, false);
  }
}
