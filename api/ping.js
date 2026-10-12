// POST /api/ping : signal « je joue encore » envoyé par le jeu une fois par minute
// (src/game/telemetry.js). Un seul appel Redis (script Lua) par signal.
// La durée de session est calculée ICI, à partir de l'heure des signaux : le jeu
// ne l'annonce pas, on ne peut donc pas la gonfler. L'XP annoncée est plafonnée
// (+150 au plus par signal) pour limiter la triche.
import { hasRedis, command, PREFIX, cotonouDate } from './_redis.js';

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless|monitor|curl|wget/i;
const ID = /^[a-z0-9-]{8,40}$/;
const empty = () => new Response(null, { status: 204 });

const SCRIPT = `
local now = tonumber(ARGV[1])
local s = redis.call('HMGET', KEYS[1], 'last', 'active', 'pid')
local last = tonumber(s[1] or '0')
local active = tonumber(s[2] or '0')
if s[3] and s[3] ~= ARGV[2] then return 0 end
if last > 0 and now - last < 40 then
  if ARGV[5] ~= '1' then return 0 end
  local p = tonumber(redis.call('ZSCORE', KEYS[4], ARGV[2]) or '0')
  redis.call('ZADD', KEYS[4], 'GT', math.min(tonumber(ARGV[4]), p + 150), ARGV[2])
  redis.call('HSET', KEYS[7], ARGV[2], now)
  return 2
end
if last > 0 and now - last <= 100 then active = active + (now - last) end
redis.call('HSET', KEYS[1], 'last', now, 'active', active, 'pid', ARGV[2])
redis.call('EXPIRE', KEYS[1], 86400)
redis.call('PFADD', KEYS[2], ARGV[2])
redis.call('PFADD', KEYS[3], ARGV[2])
redis.call('EXPIRE', KEYS[3], 3456000)
local prev = tonumber(redis.call('ZSCORE', KEYS[4], ARGV[2]) or '0')
local xp = math.min(tonumber(ARGV[4]), prev + 150)
redis.call('ZADD', KEYS[4], 'GT', xp, ARGV[2])
redis.call('HSET', KEYS[6], ARGV[2], ARGV[3])
if active > 0 then redis.call('ZADD', KEYS[5], 'GT', active, ARGV[2]) end
redis.call('HSET', KEYS[7], ARGV[2], now)
return 1
`;

export async function POST(request) {
  if (!hasRedis()) return empty();
  const ua = request.headers.get('user-agent') ?? '';
  if (!ua || BOT.test(ua)) return empty();
  let body;
  try { body = JSON.parse(await request.text()); } catch { return empty(); }

  const pid = String(body.pid ?? '');
  const sid = String(body.sid ?? '');
  if (!ID.test(pid) || !ID.test(sid)) return empty();
  const name = String(body.name ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 20);
  const xp = Math.max(0, Math.min(1e7, Math.floor(Number(body.xp) || 0)));

  const keys = [`s:${sid}`, 'players', `players:${cotonouDate()}`, 'xp', 'longest', 'names', 'seen'].map((k) => PREFIX + k);
  await command(['EVAL', SCRIPT, keys.length, ...keys, Math.floor(Date.now() / 1000), pid, name, xp, body.final ? 1 : 0])
    .catch((error) => console.error('Signal non compté', error));
  return empty();
}
