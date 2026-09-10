(() => {
  'use strict';

  const SIMPLE_BRIEFS = [
    'Build a room about the start of actuarial work.',
    'Show how probability helped people understand risk.',
    'Show the people and ideas linked to Britain and America.',
    'Choose the best final message for the museum.'
  ];
  const SIMPLE_CATEGORIES = {
    'Curatorial strategy': 'Museum choice',
    'Historical evidence': 'History',
    'Storytelling language': 'English',
    'Actuarial connection': 'Why it matters'
  };

  function playerCount() {
    const pressed = document.querySelector('.player-choice[aria-pressed="true"]');
    if (pressed && pressed.dataset.players) return Number(pressed.dataset.players);
    const cards = document.querySelectorAll('#rolePreview .role-card');
    return cards.length === 3 || cards.length === 4 ? cards.length : 0;
  }

  function currentRoom() {
    const el = document.querySelector('.gallery-number');
    const m = el && el.textContent.match(/(\d+)/);
    return m ? Math.max(1, Math.min(4, Number(m[1]))) : 1;
  }

  function studentForRoom(room, count) {
    if (count === 4) return `Student ${room}`;
    if (count === 3) return room === 1 ? 'Student 1' : room === 4 ? 'Student 3' : 'Student 2';
    return 'Your team';
  }

  function simplifySetup() {
    const root = document.getElementById('setupView');
    if (!root) return;
    const card = root.querySelector('.setup-card');
    if (!card) return;

    const kicker = card.querySelector('.museum-kicker');
    const title = card.querySelector('h2');
    const lead = card.querySelector('.setup-lead');
    if (kicker) kicker.textContent = 'STEP 1';
    if (title) title.textContent = '3 or 4 students?';
    if (lead) lead.innerHTML = '<strong>Use one computer.</strong> Choose your team.';

    card.querySelectorAll('[data-players]').forEach((btn) => {
      const n = btn.dataset.players;
      const strong = btn.querySelector('strong');
      const span = btn.querySelector('span');
      if (strong) strong.textContent = `${n} students`;
      if (span) span.textContent = `${n} speakers at the end.`;
    });

    const previewCopy = card.querySelector('.setup-preview-copy');
    if (previewCopy) {
      const pk = previewCopy.querySelector('.museum-kicker');
      const ph = previewCopy.querySelector('h3');
      const pp = previewCopy.querySelector('p:not(.museum-kicker)');
      if (pk) pk.textContent = 'THE GAME';
      if (ph) ph.textContent = 'Visit 4 rooms';
      if (pp) pp.textContent = 'Choose answers. The game gives you a short note. Keep it.';
      const map = previewCopy.querySelector('.setup-pitch-map');
      if (map) map.innerHTML = '<span>1️⃣ Room 1</span><span>2️⃣ Room 2</span><span>3️⃣ Room 3</span><span>4️⃣ Room 4</span>';
    }

    const setupCards = card.querySelectorAll('.setup-preview-card');
    const names = ['The profession begins','Probability & risk','People & America','Final exhibition'];
    setupCards.forEach((c, i) => {
      const span = c.querySelector('span');
      const strong = c.querySelector('strong');
      const p = c.querySelector('p');
      if (span) span.textContent = `Room ${i+1}`;
      if (strong) strong.textContent = names[i] || `Room ${i+1}`;
      if (p) p.remove();
    });

    const count = playerCount();
    const rolePreview = document.getElementById('rolePreview');
    if (rolePreview && count) {
      const rk = rolePreview.querySelector('.museum-kicker');
      if (rk) rk.textContent = 'WHO SPEAKS AT THE END?';
      const tasks = count === 4
        ? ['Room 1','Room 2','Room 3','Room 4 + end']
        : ['Room 1','Rooms 2 + 3','Room 4 + end'];
      rolePreview.querySelectorAll('.role-card').forEach((role, i) => {
        const strong = role.querySelector('strong');
        const span = role.querySelector('span');
        if (strong) strong.textContent = `Student ${i+1}`;
        if (span) span.textContent = tasks[i] || '';
      });
    }

    const warning = card.querySelector('.setup-warning');
    if (warning) warning.innerHTML = '🎤 <strong>At the end:</strong> one team pitch · <strong>max 2 minutes</strong> · everyone speaks.';
    const btn = card.querySelector('#confirmSetupBtn');
    if (btn) btn.textContent = 'Start Room 1 →';
  }

  function simplifyGallery() {
    const root = document.getElementById('galleryView');
    if (!root || root.hidden) return;
    const room = currentRoom();
    const count = playerCount();

    const number = root.querySelector('.gallery-number');
    if (number) number.textContent = `Room ${room} / 4`;
    const kicker = root.querySelector('.gallery-header .museum-kicker');
    if (kicker) kicker.textContent = 'ROOM MISSION';
    const brief = root.querySelector('.gallery-brief');
    if (brief) brief.textContent = SIMPLE_BRIEFS[room - 1];
    const hear = root.querySelector('#hearBriefBtn');
    if (hear) hear.textContent = '🔊 Listen';

    const strip = root.querySelector('.gallery-task-strip');
    if (strip) {
      strip.innerHTML = '<strong>Do this:</strong><span>1️⃣ Choose 4 answers.</span><span>2️⃣ Keep the short note.</span><span>3️⃣ Click <em>Save &amp; Next</em>.</span>';
      strip.setAttribute('aria-label','Three simple steps');
    }

    root.querySelectorAll('.question-category').forEach((el) => {
      const t = el.textContent.trim();
      if (SIMPLE_CATEGORIES[t]) el.textContent = SIMPLE_CATEGORIES[t];
    });

    const builder = root.querySelector('.pitch-builder-card');
    if (builder) {
      const bk = builder.querySelector('.museum-kicker');
      const bh = builder.querySelector('h3');
      const speaker = builder.querySelector('.pitch-speaker-line');
      const directP = [...builder.children].find((el) => el.tagName === 'P' && !el.classList.contains('museum-kicker') && !el.classList.contains('pitch-speaker-line'));
      if (bk) bk.textContent = 'YOUR SHORT NOTE';
      if (bh) bh.textContent = `Room ${room} note`;
      if (speaker) speaker.innerHTML = `<strong>At the end:</strong> ${studentForRoom(room,count)} says this part.`;
      if (directP) directP.textContent = 'After 4 answers, the game writes a note for you. You can keep it.';

      const textarea = builder.querySelector('#galleryPitchNote');
      if (textarea) textarea.placeholder = 'Choose the 4 answers first.';
      const countEl = builder.querySelector('#galleryPitchCount');
      if (countEl) {
        const m = countEl.textContent.match(/\d+/);
        countEl.textContent = m ? `${m[0]} words · keep 30–40` : 'Keep 30–40 words';
      }
      const suggest = builder.querySelector('#suggestPitchBtn');
      if (suggest) suggest.textContent = 'Use the game note';
      const checklist = builder.querySelector('.pitch-checklist');
      if (checklist) checklist.innerHTML = '<strong>Easy option:</strong><span>Keep the game note. Change it only if you want.</span>';
    }

    const back = root.querySelector('#backGalleryBtn');
    if (back) back.textContent = '← Back';
    const save = root.querySelector('#saveGalleryBtn');
    if (save) save.textContent = room === 4 ? 'Save & finish →' : 'Save & Next →';
  }

  function simplifyNotebook() {
    const head = document.querySelector('.notebook-head');
    if (head) {
      const k = head.querySelector('.museum-kicker');
      const h = head.querySelector('h2');
      const p = head.querySelector('p:not(.museum-kicker)');
      if (k) k.textContent = 'YOUR NOTES';
      if (h) h.textContent = '4 notes for the final pitch';
      if (p) p.textContent = 'The game saves one note after each room.';
    }
    const count = playerCount();
    document.querySelectorAll('.pitch-entry').forEach((entry, i) => {
      const strong = entry.querySelector('strong');
      const owner = entry.querySelector('.pitch-owner');
      const p = entry.querySelector('p');
      if (strong) strong.textContent = `Room ${i+1}`;
      if (owner) owner.textContent = studentForRoom(i+1,count);
      if (p && /will appear here/i.test(p.textContent)) p.textContent = 'No note yet.';
    });
    const hint = document.getElementById('pitchHint');
    if (hint) {
      if (/long|trim/i.test(hint.textContent)) hint.textContent = 'Too long. Make the notes shorter.';
      else hint.textContent = 'Use these notes at the end.';
    }
    document.querySelectorAll('.pitch-meter span').forEach((el) => {
      if (/current pitch words/i.test(el.textContent)) el.textContent = 'Words';
      if (/estimated time/i.test(el.textContent)) el.textContent = 'Time';
    });
  }

  function simplifyFinal() {
    const root = document.getElementById('finalView');
    if (!root || root.hidden) return;
    const title = root.querySelector('.final-title');
    const subtitle = root.querySelector('.final-subtitle');
    if (title) title.textContent = 'Ready for the final pitch!';
    if (subtitle) subtitle.innerHTML = 'Use your <strong>4 notes</strong>. Speak as a team.';

    const k = root.querySelector('.final-pitch-section > .museum-kicker');
    const h = root.querySelector('.final-pitch-section > h2');
    if (k) k.textContent = 'FINAL TASK';
    if (h) h.textContent = 'Team pitch · max 2 minutes';

    const box = root.querySelector('.final-deliverable');
    if (box) box.innerHTML = '<strong>Do this:</strong><ol><li>Use the 4 notes.</li><li>Each student speaks.</li><li>Stop before <strong>2:00</strong>.</li></ol>';

    const count = playerCount();
    const tasks = count === 4
      ? ['Room 1','Room 2','Room 3','Room 4 + end']
      : ['Room 1','Rooms 2 + 3','Room 4 + end'];
    root.querySelectorAll('.speaker-row').forEach((row, i) => {
      const strong = row.querySelector('strong');
      const p = row.querySelector('p');
      if (strong) strong.textContent = `Student ${i+1}`;
      if (p) p.textContent = tasks[i] || '';
    });

    const script = root.querySelector('#finalScript');
    if (script) script.setAttribute('aria-label','Team pitch');
    const reset = root.querySelector('#resetScriptBtn');
    if (reset) reset.textContent = 'Use my 4 notes';
    const copy = root.querySelector('#copyScriptBtn');
    if (copy) copy.textContent = 'Copy';
    const pitchTools = root.querySelector('.final-pitch-section .pitch-tools');
    if (pitchTools) pitchTools.style.display = 'none';
    const timer = root.querySelector('.timer-box > strong');
    if (timer) timer.textContent = '2-minute timer';
    const review = root.querySelector('#reviewBtn');
    if (review) review.textContent = '← Back to Room 4';
  }

  function simplifyStatus() {
    const el = document.getElementById('museumStatus');
    if (!el || !el.textContent) return;
    const t = el.textContent.trim();
    if (/Gallery \d+ saved/i.test(t)) el.textContent = '✅ Saved. Next room.';
    else if (/Choose one answer for each decision/i.test(t)) el.textContent = 'Choose 4 answers first.';
    else if (/between 30 and 40 words/i.test(t)) el.textContent = 'Keep the note between 30 and 40 words.';
    else if (/Pitch rebuilt/i.test(t)) el.textContent = '✅ Your 4 notes are ready.';
    else if (/Pitch copied/i.test(t)) el.textContent = '✅ Copied.';
  }

  function simplifyAll() {
    simplifySetup();
    simplifyGallery();
    simplifyNotebook();
    simplifyFinal();
    simplifyStatus();
  }

  // Replace the long curator briefing audio with the same short A2-B1 instruction shown on screen.
  document.addEventListener('click', (event) => {
    const btn = event.target.closest && event.target.closest('#hearBriefBtn');
    if (!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const room = currentRoom();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Room ${room}. ${SIMPLE_BRIEFS[room-1]}`);
      u.lang = 'en-GB';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  }, true);

  simplifyAll();
  const app = document.getElementById('museumApp');
  if (app && 'MutationObserver' in window) {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      simplifyAll();
      observer.observe(app, { childList:true, subtree:true, characterData:true });
    });
    observer.observe(app, { childList:true, subtree:true, characterData:true });
  }
})();
