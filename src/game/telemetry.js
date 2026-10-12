// Stats publiques (page /stats) : le jeu envoie un signal « je joue encore » par
// minute à /api/ping, tant que l'onglet est visible. Identifiant de joueur
// anonyme gardé dans le navigateur ; seul le prénom saisi en jeu est public.
// Rien n'est envoyé en dev (Vite ne sert pas les fonctions de api/).

const PLAYER_KEY = 'clean-ceo-player-id';
const EVERY_MS = 60_000;

let started = false;
let stopped = false;
let state = null;
let sendNow = null;

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

/** Identifiant du joueur s'il a déjà joué sur ce navigateur (sans en créer). */
export function knownPlayerId() {
  try {
    return localStorage.getItem(PLAYER_KEY);
  } catch {
    return null;
  }
}

/** Branche le suivi sur la partie en cours (appel répété sans effet, sauf l'état suivi). */
export function startTelemetry(gameState) {
  state = gameState;
  if (started || import.meta.env.DEV) return;
  started = true;

  const pid = playerId();
  const sid = newId();
  const send = (final = false) => {
    if (stopped || !state || (!final && document.visibilityState !== 'visible')) return;
    const body = JSON.stringify({ pid, sid, name: state.playerName, xp: state.xp, final });
    fetch('/api/ping', { method: 'POST', body, keepalive: true }).catch(() => {});
  };
  sendNow = send;

  setTimeout(send, 5_000);
  setInterval(send, EVERY_MS);
}

/** Fin de partie (démo terminée) : un dernier signal pour l'XP finale, puis
 * plus rien (le temps passé sur l'écran de fin ne compte pas comme du jeu). */
export function stopTelemetry() {
  sendNow?.(true);
  stopped = true;
}
