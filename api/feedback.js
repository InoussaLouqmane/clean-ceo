// POST /api/feedback : retour facultatif du joueur à la fin de la démo
// (src/game/ui/DemoEnd.js). Stocké dans la liste Redis `cc:feedback` (2 000
// derniers), un envoi par joueur toutes les 30 s au plus. Lecture : en local,
// avec les variables de .env.local (voir STATUS.md).
import { hasRedis, command, PREFIX } from './_redis.js';

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless|monitor|curl|wget/i;
const ID = /^[a-z0-9-]{8,40}$/;
const reply = (status) => new Response(null, { status });

const SCRIPT = `
if redis.call('SET', KEYS[2], '1', 'NX', 'EX', 30) == false then return 0 end
redis.call('LPUSH', KEYS[1], ARGV[1])
redis.call('LTRIM', KEYS[1], 0, 1999)
return 1
`;

export async function POST(request) {
  if (!hasRedis()) return reply(503);
  const ua = request.headers.get('user-agent') ?? '';
  if (!ua || BOT.test(ua)) return reply(204);
  let body;
  try { body = JSON.parse(await request.text()); } catch { return reply(400); }

  const text = String(body.text ?? '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, 1000);
  if (!text) return reply(400);
  const pid = ID.test(String(body.pid ?? '')) ? String(body.pid) : 'inconnu';
  const entry = JSON.stringify({
    at: new Date().toISOString(),
    name: String(body.name ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 20),
    xp: Math.max(0, Math.floor(Number(body.xp) || 0)),
    country: request.headers.get('x-vercel-ip-country') || '',
    pid,
    text,
  });
  try {
    const ok = await command(['EVAL', SCRIPT, 2, PREFIX + 'feedback', `${PREFIX}fb-wait:${pid}`, entry]);
    return reply(ok ? 204 : 429);
  } catch (error) {
    console.error('Retour non enregistré', error);
    return reply(500);
  }
}
