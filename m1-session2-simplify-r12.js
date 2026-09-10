(() => {
  'use strict';

  function simplifySetup(root) {
    if (!root) return;
    const card = root.querySelector('.setup-card');
    if (!card || card.dataset.simpleR12 === '1') return;

    const kicker = card.querySelector('.museum-kicker');
    const title = card.querySelector('h2');
    const lead = card.querySelector('.setup-lead');
    if (kicker) kicker.textContent = 'STEP 1 · CHOOSE YOUR TEAM';
    if (title) title.textContent = 'How many students are playing?';
    if (lead) lead.innerHTML = 'Use <strong>one device per team</strong>. Choose 3 or 4 students.';

    const playerButtons = card.querySelectorAll('[data-players]');
    playerButtons.forEach((btn) => {
      const n = btn.dataset.players;
      const span = btn.querySelector('span');
      if (span) span.textContent = n === '3' ? 'The game gives you 3 speaking roles.' : 'The game gives you 4 speaking roles.';
    });

    const previewCopy = card.querySelector('.setup-preview-copy');
    if (previewCopy) {
      const pk = previewCopy.querySelector('.museum-kicker');
      const ph = previewCopy.querySelector('h3');
      const pp = previewCopy.querySelector('p:not(.museum-kicker)');
      if (pk) pk.textContent = 'FINAL TASK';
      if (ph) ph.textContent = 'Build your pitch as you play';
      if (pp) pp.textContent = 'Save one short note in each gallery. Your four notes become the final team pitch.';
    }

    const warning = card.querySelector('.setup-warning');
    if (warning) warning.innerHTML = '<strong>At the end:</strong> ONE team pitch · <strong>2:00 maximum in total</strong> · everyone speaks.';

    card.dataset.simpleR12 = '1';
  }

  function simplifyGallery(root) {
    if (!root) return;
    const strip = root.querySelector('.gallery-task-strip');
    if (strip && strip.dataset.simpleR12 !== '1') {
      strip.innerHTML = '<strong>What to do</strong><span>1. Answer the 4 decisions.</span><span>2. Check or edit the suggested 30–40 word note.</span><span>3. Say what you chose and why it matters.</span><span>4. Click <em>Save gallery</em>.</span>';
      strip.dataset.simpleR12 = '1';
    }

    const checklist = root.querySelector('.pitch-checklist');
    if (checklist && checklist.dataset.simpleR12 !== '1') {
      checklist.innerHTML = '<strong>Your note should:</strong><span>① name your choice</span><span>② give one reason or fact</span><span>③ explain why it matters</span>';
      checklist.dataset.simpleR12 = '1';
    }
  }

  function simplifyNotebook() {
    const head = document.querySelector('.notebook-head');
    if (head && head.dataset.simpleR12 !== '1') {
      const kicker = head.querySelector('.museum-kicker');
      const title = head.querySelector('h2');
      const p = head.querySelector('p:not(.museum-kicker)');
      if (kicker) kicker.textContent = 'PITCH NOTES';
      if (title) title.textContent = 'Your 2-minute team pitch';
      if (p) p.textContent = 'Save one short note after each gallery. Use the four notes at the end.';
      head.dataset.simpleR12 = '1';
    }
    const hint = document.getElementById('pitchHint');
    if (hint) {
      const t = hint.textContent || '';
      let simple = 'Keep the whole team pitch under 2 minutes.';
      if (/getting long|Trim/i.test(t)) simple = 'Too long: shorten your notes.';
      else if (/room for clearer links|still have room/i.test(t)) simple = 'You can add a little more detail.';
      else if (/Build one 30|Four notes/i.test(t)) simple = 'Save one 30–40 word note per gallery.';
      if (hint.textContent !== simple) hint.textContent = simple;
    }
  }

  function simplifyFinal(root) {
    if (!root) return;
    const box = root.querySelector('.final-deliverable');
    if (box && box.dataset.simpleR12 !== '1') {
      box.innerHTML = '<strong>Final task</strong><ol><li>Use the script built from your four gallery notes.</li><li>Everyone speaks.</li><li>Keep the whole team pitch under <strong>2:00</strong>.</li><li>Include one clear past sequence (Past Perfect + Past Simple).</li><li>Rehearse once with the timer.</li></ol>';
      box.dataset.simpleR12 = '1';
    }
    const rows = [...root.querySelectorAll('.speaker-row')];
    if (rows.length && !root.dataset.simpleSpeakersR12) {
      const tasks = rows.length === 4
        ? ['Introduction + Gallery I','Gallery II','Gallery III','Gallery IV + conclusion']
        : ['Introduction + Gallery I','Galleries II + III','Gallery IV + conclusion'];
      rows.forEach((row, i) => { const p = row.querySelector('p'); if (p && tasks[i]) p.textContent = tasks[i]; });
      root.dataset.simpleSpeakersR12 = '1';
    }
  }

  function simplify() {
    simplifySetup(document.getElementById('setupView'));
    simplifyGallery(document.getElementById('galleryView'));
    simplifyFinal(document.getElementById('finalView'));
    simplifyNotebook();
  }

  simplify();
  const app = document.getElementById('museumApp');
  if (app && 'MutationObserver' in window) {
    const observer = new MutationObserver(() => simplify());
    observer.observe(app, { childList: true, subtree: true });
  }
})();
