import '../menu/tokens.css';
import './stats.css';

// Page publique /stats : lit /api/stats (mis en cache 60 s côté Vercel) et se
// rafraîchit toute seule chaque minute.

const REFRESH_MS = 60_000;
const $ = (sel) => document.querySelector(sel);
const field = (name) => $(`[data-field="${name}"]`);
const fmt = (n) => Number(n).toLocaleString('fr-FR');

function duration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h} h ${String(m).padStart(2, '0')}`;
  if (m) return `${m} min`;
  return `${seconds} s`;
}

function escapeHtml(text) {
  const el = document.createElement('span');
  el.textContent = text;
  return el.innerHTML;
}

function fillList(name, rows, right) {
  const list = $(`[data-list="${name}"]`);
  list.innerHTML = rows.length
    ? rows.map((r) => `<li><span class="who">${escapeHtml(r.name)}</span><span class="what">${right(r)}</span></li>`).join('')
    : '<li class="empty">Personne pour l\'instant</li>';
}

function render(data) {
  if (!data.ready) {
    field('players').textContent = '—';
    field('today').textContent = 'Stats indisponibles pour le moment';
    return;
  }
  field('players').textContent = fmt(data.players);
  field('today').textContent = `dont ${fmt(data.today)} aujourd'hui`;

  const best = data.topXp[0];
  field('best-name').textContent = best ? best.name : '—';
  field('best-detail').textContent = best ? `Niveau ${best.level} · ${fmt(best.xp)} XP` : 'Personne pour l\'instant';

  const long = data.longest[0];
  field('long-time').textContent = long ? duration(long.seconds) : '—';
  field('long-name').textContent = long ? long.name : 'Personne pour l\'instant';

  fillList('xp', data.topXp, (r) => `Niv. ${r.level} · ${fmt(r.xp)} XP`);
  fillList('longest', data.longest, (r) => duration(r.seconds));

  const at = new Date(data.updatedAt);
  field('updated').textContent = `Mis à jour à ${at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · actualisé chaque minute`;
}

async function load() {
  try {
    const res = await fetch('/api/stats');
    render(res.ok ? await res.json() : { ready: false });
  } catch {
    render({ ready: false });
  }
}

load();
setInterval(load, REFRESH_MS);
