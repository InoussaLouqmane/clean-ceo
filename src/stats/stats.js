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

// « il y a 5 min », « il y a 3 h », « hier », « le 02/10 »
function ago(unixSeconds) {
  if (!unixSeconds) return '—';
  const s = Math.max(0, Date.now() / 1000 - unixSeconds);
  if (s < 120) return 'à l’instant';
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 172800) return 'hier';
  return `le ${new Date(unixSeconds * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
}

let everyone = [];

function renderEveryone() {
  const q = $('[data-search]').value.trim().toLowerCase();
  const rows = everyone
    .map((p, i) => ({ ...p, rank: i + 1 }))
    .filter((p) => !q || p.name.toLowerCase().includes(q));
  $('[data-list="everyone"]').innerHTML = rows.length
    ? rows.map((p) => `<tr>
        <td class="rank">${p.rank}</td>
        <td class="who">${escapeHtml(p.name)}</td>
        <td>${p.level}</td>
        <td>${fmt(p.xp)}</td>
        <td>${p.seconds ? duration(p.seconds) : '—'}</td>
        <td class="col-seen">${ago(p.seen)}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="empty">${q ? 'Aucun joueur à ce nom' : 'Personne pour l’instant'}</td></tr>`;
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
  everyone = data.everyone ?? [];
  field('count').textContent = `(${fmt(everyone.length)})`;
  renderEveryone();
  fillList('longest', data.longest, (r) => duration(r.seconds));

  const at = new Date(data.updatedAt);
  field('updated').textContent = `Mis à jour à ${at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · actualisé chaque minute`;
}

async function load() {
  try {
    const res = await fetch('/api/stats?all=1');
    render(res.ok ? await res.json() : { ready: false });
  } catch {
    render({ ready: false });
  }
}

$('[data-search]').addEventListener('input', renderEveryone);
load();
setInterval(load, REFRESH_MS);
