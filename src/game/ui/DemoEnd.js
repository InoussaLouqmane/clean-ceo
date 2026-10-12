import { icon } from '../../menu/icons.js';
import { ECONOMY, formatMoney } from '../economy.js';
import { knownPlayerId } from '../telemetry.js';
import { sfx } from '../sfx.js';

/**
 * Fin de la démo (ECONOMY.demo.lastLevel terminé) : bilan, retour facultatif du
 * joueur envoyé à /api/feedback, puis retour au menu. Pas de bouton
 * « Continuer » : la partie reste bloquée jusqu'à la prochaine mise à jour.
 */
export function showDemoEnd(root, state) {
  sfx.levelUp();
  const last = ECONOMY.demo.lastLevel;
  const el = document.createElement('div');
  el.className = 'level-complete demo-end';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-labelledby', 'demo-title');
  el.innerHTML = `
    <div class="level-complete__panel">
      <p class="level-complete__badge">${icon('star')} Démo terminée ${icon('star')}</p>
      <h2 id="demo-title">Bravo ${escapeHtml(state.playerName)} !</h2>
      <p class="demo-end__lead">Tu as terminé les ${last} niveaux de la démo de CLEAN CEO.
        Des améliorations sont en cours : le jeu complet arrive bientôt.</p>
      <p class="demo-end__recap">${icon('coin')} ${formatMoney(state.money)} · ${icon('star')} ${state.xp} XP · ${icon('worker')} ${state.units.length} unité${state.units.length > 1 ? 's' : ''}</p>
      <form class="demo-end__form">
        <label for="demo-feedback">Qu'aimerais-tu voir ou améliorer ? <small>(facultatif)</small></label>
        <textarea id="demo-feedback" rows="3" maxlength="1000" placeholder="Une idée, un bug, ce qui t'a plu…"></textarea>
        <p class="demo-end__status" aria-live="polite"></p>
        <div class="level-complete__actions">
          <button type="submit" class="game-btn game-btn--primary" data-demo="send">
            <span class="game-btn__label">Envoyer</span>
          </button>
          <button type="button" class="game-btn game-btn--secondary" data-demo="menu">
            <span class="game-btn__label">Menu principal</span>
          </button>
        </div>
      </form>
    </div>`;
  root.appendChild(el);

  const form = el.querySelector('form');
  const text = el.querySelector('textarea');
  const status = el.querySelector('.demo-end__status');
  const sendBtn = el.querySelector('[data-demo="send"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = text.value.trim();
    if (!message) {
      status.textContent = 'Écris quelques mots avant d’envoyer.';
      text.focus();
      return;
    }
    sfx.click();
    sendBtn.disabled = true;
    status.textContent = 'Envoi…';
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ pid: knownPlayerId(), name: state.playerName, text: message, xp: state.xp }),
      });
      if (!res.ok) throw new Error(String(res.status));
      text.value = '';
      text.disabled = true;
      sendBtn.hidden = true;
      status.textContent = 'Merci, c’est bien reçu !';
    } catch {
      sendBtn.disabled = false;
      status.textContent = 'Envoi impossible pour le moment, réessaie plus tard.';
    }
  });

  el.querySelector('[data-demo="menu"]').addEventListener('click', () => {
    sfx.click();
    window.location.reload();
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
