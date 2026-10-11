// Stats publiques (page /stats) : le jeu envoie un signal « je joue encore » par
// minute à /api/ping, tant que l'onglet est visible. Identifiant de joueur
// anonyme gardé dans le navigateur ; seul le prénom saisi en jeu est public.
// Rien n'est envoyé en dev (Vite ne sert pas les fonctions de api/).

const PLAYER_KEY = 'clean-ceo-player-id';
const EVERY_MS = 60_000;

let started = false;
let state = null;

const newId = () => (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`).toLowerCase();

function playerId() {
  try {
    let id = localStorage.getItem(PLAYER_KEY);
    if (!id) localStorage.setItem(PLAYER_KEY, (id = newId()));
    return id;
  } catch {
    return newId(); // stockage bloqué : joueur compté à chaque visite
  }
}

/** Branche le suivi sur la partie en cours (appel répété sans effet, sauf l'état suivi). */
export function startTelemetry(gameState) {
  state = gameState;
  if (started || import.meta.env.DEV) return;
  started = true;

  const pid = playerId();
  const sid = newId();
  const send = () => {
    if (document.visibilityState !== 'visible' || !state) return;
    const body = JSON.stringify({ pid, sid, name: state.playerName, xp: state.xp });
    fetch('/api/ping', { method: 'POST', body, keepalive: true }).catch(() => {});
  };

  setTimeout(send, 5_000);
  setInterval(send, EVERY_MS);
}
