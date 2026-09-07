(() => {
  'use strict';
  // M1 Session 2 museum engine · R4 zero-bug stability audit

  const STORAGE_KEY = 'being-an-actuary-m1-session2-museum-r4';
  const LEGACY_KEYS = ['being-an-actuary-m1-session2-museum-r3','being-an-actuary-m1-session2-museum-r2','being-an-actuary-m1-session2-museum-r1'];
  const MAX_SCORE = 32;
  const galleryThumbs = [
    'assets/session2-museum/gallery1-birth.svg',
    'assets/session2-museum/gallery2-probability.svg',
    'assets/session2-museum/gallery3-radicals.svg',
    'assets/session2-museum/gallery4-final.svg'
  ];

  const roles = {
    3: [
      ['Head Curator', 'Keeps the exhibition coherent and leads the final decisions.'],
      ['Historical Evidence Officer', 'Checks that the team can support each choice with evidence from the lesson.'],
      ['Actuarial Story Officer', 'Connects each exhibit to actuarial science and makes the story clear for visitors.']
    ],
    4: [
      ['Head Curator', 'Keeps the exhibition coherent and leads the final decisions.'],
      ['Historical Evidence Officer', 'Checks that the team can support each choice with evidence from the lesson.'],
      ['Actuarial Relevance Officer', 'Explains why each exhibit matters to the emergence of actuarial science.'],
      ['Visitor Experience Designer', 'Makes sure a non-specialist visitor can follow the story.']
    ]
  };

  const galleries = [
    {
      short: 'Birth of the profession',
      title: 'The Birth of a Profession',
      brief: 'Your first room must answer a deceptively simple question: when does actuarial science begin? Choose objects and labels that show how insurance institutions, a professional title and a formal role came together.',
      visual: galleryThumbs[0],
      objects: [
        ['assets/session2-museum/ethical-society.svg', 'Early insurance society'],
        ['assets/session2-museum/mores-title.svg', 'The title “actuary”'],
        ['assets/session2-museum/morgan-ledger.svg', 'Professional actuarial work']
      ],
      featuredQuestion: 0,
      pitchPrompt: 'In 30–45 words, explain where your exhibition begins and why this first exhibit matters.',
      questions: [
        {
          category: 'Curatorial strategy',
          prompt: 'Which object should be the centrepiece of Gallery I?',
          options: [
            {text:'An early Ethical Society insurance document — it gives visitors a concrete starting point for the history of insurance.', score:2, object:'The Ethical Society insurance document', bit:'We begin with an early insurance society document because it gives visitors a concrete starting point for the story.'},
            {text:'A modern calculator — it immediately looks mathematical.', score:0, object:'A modern calculator', bit:'We chose a modern calculator as a visual shortcut to mathematics.'},
            {text:'A blank eighteenth-century map — it provides period atmosphere.', score:1, object:'An eighteenth-century map', bit:'We begin with a map to establish the historical setting before discussing the profession.'},
            {text:'A generic portrait with no label — visitors can decide what it means.', score:0, object:'An unidentified portrait', bit:'We begin with an unidentified portrait and leave visitors to interpret it.'}
          ]
        },
        {
          category: 'Historical evidence',
          prompt: 'Which museum caption best explains the link between Edward Rowe Mores and William Morgan?',
          options: [
            {text:'Mores invented insurance; Morgan discovered probability.', score:0, bit:'Our label says Mores invented insurance and Morgan discovered probability.'},
            {text:'Mores created the title “actuary”; Morgan later helped formalise the profession and its responsibilities.', score:2, bit:'Mores created the title “actuary”, and Morgan later helped formalise the profession and its responsibilities.'},
            {text:'Morgan created the title “actuary” before Mores entered the profession.', score:0, bit:'Our label places Morgan before Mores in the naming of the profession.'},
            {text:'Both men were mainly political campaigners rather than figures in actuarial history.', score:0, bit:'Our label presents both men mainly as political figures.'}
          ]
        },
        {
          category: 'Storytelling language',
          prompt: 'Choose the strongest timeline sentence for your visitors.',
          options: [
            {text:'Before Morgan had formalised the role, Mores created the title “actuary”.', score:1, bit:'Before Morgan had formalised the role, Mores created the title “actuary”.'},
            {text:'Before Morgan formalised the role, Mores created the title “actuary”.', score:1, bit:'Before Morgan formalised the role, Mores created the title “actuary”.'},
            {text:'Before Morgan formalised the role, Mores had created the title “actuary”.', score:2, bit:'Before Morgan formalised the role, Mores had created the title “actuary”.'},
            {text:'Before Morgan formalises the role, Mores had create the title “actuary”.', score:0, bit:'Before Morgan formalises the role, Mores had create the title “actuary”.'}
          ]
        },
        {
          category: 'Actuarial connection',
          prompt: 'What should visitors understand before they leave this gallery?',
          options: [
            {text:'Actuarial science appeared fully formed as a branch of university mathematics.', score:0, bit:'We present actuarial science as a ready-made branch of mathematics.'},
            {text:'The word “actuary” is the only important part of the story.', score:0, bit:'We focus almost entirely on the origin of the word “actuary”.'},
            {text:'Insurance history matters, but it is separate from the development of the profession.', score:1, bit:'We treat insurance history as background to the profession.'},
            {text:'The profession grew from insurance institutions, new roles and changing ways of managing risk — not from mathematics alone.', score:2, bit:'This gallery shows that the profession grew from insurance institutions, new roles and changing ways of managing risk — not from mathematics alone.'}
          ]
        }
      ]
    },
    {
      short: 'Probability & uncertainty',
      title: 'Probability, Population & Uncertainty',
      brief: 'The museum director worries that visitors will switch off as soon as they see mathematics. Your job is to keep the intellectual substance while making the actuarial connection understandable.',
      visual: galleryThumbs[1],
      objects: [
        ['assets/session2-museum/bayes-price.svg', 'Bayes & Price manuscript'],
        ['assets/session2-museum/mortality-table.svg', 'Population table'],
        ['assets/session2-museum/premium-ledger.svg', 'Premium ledger']
      ],
      featuredQuestion: 0,
      pitchPrompt: 'In 30–45 words, explain how probability or population thinking changed the way risk could be understood.',
      questions: [
        {
          category: 'Historical evidence',
          prompt: 'Which object best represents the probability story highlighted in the lesson?',
          options: [
            {text:'A manuscript representing Bayes’s work and its later publication by Richard Price.', score:2, object:'The Bayes–Price probability manuscript', bit:'We chose a manuscript representing Bayes’s work and its later publication by Richard Price.'},
            {text:'An Enlightenment salon invitation with no mathematical content.', score:1, object:'An Enlightenment salon invitation', bit:'We use a salon invitation to represent the intellectual setting.'},
            {text:'A bottle of carbonated water associated with Priestley.', score:0, object:'A carbonated-water bottle', bit:'We use Priestley’s carbonated water as the centrepiece of the probability gallery.'},
            {text:'A political pamphlet about American independence.', score:0, object:'A political pamphlet', bit:'We use a political pamphlet as our main probability exhibit.'}
          ]
        },
        {
          category: 'Curatorial strategy',
          prompt: 'The director says: “Visitors hate maths. Remove probability from the exhibition.” What do you do?',
          options: [
            {text:'Agree. Replace it with celebrity portraits.', score:0, bit:'We remove probability and replace it with personalities.'},
            {text:'Keep probability, but explain it through uncertainty, population and insurance risk.', score:2, bit:'We keep probability but explain it through uncertainty, population and insurance risk.'},
            {text:'Keep the equations but remove every explanation.', score:0, bit:'We keep the mathematics without explaining why it matters.'},
            {text:'Move probability to a footnote at the very end.', score:1, bit:'We keep probability only as background information.'}
          ]
        },
        {
          category: 'Storytelling language',
          prompt: 'Which sentence best uses the historical sequence from the worksheet?',
          options: [
            {text:'Price had published Bayes’s work before it remained unknown.', score:0, bit:'Price had published Bayes’s work before it remained unknown.'},
            {text:'Price published Bayes’s work which remained unknown before then.', score:1, bit:'Price published Bayes’s work which remained unknown before then.'},
            {text:'Price published Bayes’s work, which had remained unknown until then.', score:2, bit:'Price published Bayes’s work, which had remained unknown until then.'},
            {text:'Price publishes Bayes’s work after it had remains unknown.', score:0, bit:'Price publishes Bayes’s work after it had remains unknown.'}
          ]
        },
        {
          category: 'Actuarial connection',
          prompt: 'Which label makes the clearest actuarial connection?',
          options: [
            {text:'Probability is interesting because eighteenth-century scientists liked numbers.', score:0, bit:'We explain probability mainly as a scientific fashion.'},
            {text:'Demography is simply a synonym for insurance.', score:0, bit:'We present demography as another word for insurance.'},
            {text:'Premiums matter because every historic payment was identical.', score:0, bit:'We focus on premiums without connecting them to risk.'},
            {text:'Probability, demography and premiums show how uncertainty could increasingly be measured and used in insurance decisions.', score:2, bit:'Probability, demography and premiums show how uncertainty could increasingly be measured and used in insurance decisions.'}
          ]
        }
      ]
    },
    {
      short: 'Radical networks',
      title: 'Radicals, Dissenters & America',
      brief: 'This is the room visitors do not expect. Politics, religion, philosophy, science and Atlantic networks enter the story. The board wants to make the exhibition “less controversial”. Decide what stays.',
      visual: galleryThumbs[2],
      objects: [
        ['assets/session2-museum/price-pamphlet.svg', 'Price’s political writing'],
        ['assets/session2-museum/letters-network.svg', 'Atlantic correspondence'],
        ['assets/session2-museum/priestley-science.svg', 'Science & dissent']
      ],
      featuredQuestion: 1,
      pitchPrompt: 'In 30–45 words, explain why politics, religion or Enlightenment networks belong in an exhibition about actuarial history.',
      questions: [
        {
          category: 'Curatorial strategy',
          prompt: 'The board says: “This is an actuarial exhibition. Remove politics and religion.” What is your response?',
          options: [
            {text:'Keep the material and explicitly explain how politics, philosophy and religion formed part of the intellectual context in which actuarial science emerged.', score:2, bit:'We keep the political and religious context because it helps explain the intellectual world in which actuarial science emerged.'},
            {text:'Remove every reference to politics and religion.', score:0, bit:'We remove politics and religion from the exhibition.'},
            {text:'Keep the material but do not explain why it is there.', score:1, bit:'We keep the context but leave visitors to work out the connection.'},
            {text:'Replace the whole gallery with modern spreadsheet screenshots.', score:0, bit:'We replace the historical context with modern spreadsheets.'}
          ]
        },
        {
          category: 'Historical evidence',
          prompt: 'Which piece of evidence best explains why Richard Price belongs in the American part of this gallery?',
          options: [
            {text:'He personally built the first American insurance company.', score:0, object:'A claim about the first US insurer', bit:'We claim Price built the first American insurance company.'},
            {text:'He supported American independence through political pamphlets and financial advice.', score:2, object:'Price’s political pamphlet', bit:'Price belongs here because he supported American independence through political pamphlets and financial advice.'},
            {text:'He invented carbonated water for American soldiers.', score:0, object:'A carbonated-water bottle', bit:'We connect Price to America through carbonated water.'},
            {text:'He designed a new tax system in Virginia.', score:0, object:'A Virginia tax plan', bit:'We connect Price to America through a Virginia tax system.'}
          ]
        },
        {
          category: 'Historical evidence',
          prompt: 'How should the museum define “Dissenters” for visitors?',
          options: [
            {text:'People who disagreed with every scientific discovery.', score:0, bit:'We define Dissenters as people opposed to science.'},
            {text:'Political officials who collected insurance premiums.', score:0, bit:'We define Dissenters as insurance officials.'},
            {text:'Individuals excluded from institutions because of their religious beliefs.', score:2, bit:'We explain that Dissenters were excluded from institutions because of their religious beliefs.'},
            {text:'American actuaries who rejected British statistics.', score:0, bit:'We define Dissenters as American actuaries.'}
          ]
        },
        {
          category: 'Actuarial connection',
          prompt: 'Why is Joseph Priestley useful in this gallery even though the room is about actuarial history?',
          options: [
            {text:'Because every early actuary was also a chemist.', score:0, bit:'We imply that early actuaries were chemists.'},
            {text:'Because carbonated water directly created insurance premiums.', score:0, bit:'We connect carbonated water directly to premiums.'},
            {text:'Because his scientific work proves that politics had no place in eighteenth-century intellectual life.', score:0, bit:'We use Priestley to separate science from politics.'},
            {text:'Because he helps visitors see the wider Enlightenment world of science, dissent and intellectual networks surrounding this history.', score:2, bit:'Priestley helps visitors see the wider Enlightenment world of science, dissent and intellectual networks surrounding this history.'}
          ]
        }
      ]
    },
    {
      short: 'Final exhibition',
      title: 'Build the Final Exhibition',
      brief: 'The doors open soon. Your final room must connect the previous galleries into one coherent message. Choose the concept, title, timeline language and conclusion that make the whole exhibition work.',
      visual: galleryThumbs[3],
      objects: [
        ['assets/session2-museum/concept-wheel.svg', 'Ideas connected'],
        ['assets/session2-museum/gallery4-final.svg', 'Four-frame wall'],
        ['assets/session2-museum/museum-hero.svg', 'Opening night']
      ],
      featuredQuestion: 0,
      pitchPrompt: 'In 30–45 words, give your exhibition its final message. What should visitors remember about the origins of actuarial science?',
      questions: [
        {
          category: 'Actuarial connection',
          prompt: 'Which concept best connects Mores’s title and Morgan’s later formalisation of the role?',
          options: [
            {text:'Professionalisation', score:2, object:'Professionalisation', bit:'Our final concept is professionalisation: a title and a role gradually became a recognisable profession.'},
            {text:'Soft-drink production', score:0, object:'Soft-drink production', bit:'Our final concept is soft-drink production.'},
            {text:'Astronomy', score:0, object:'Astronomy', bit:'Our final concept is astronomy.'},
            {text:'Modern machine learning', score:0, object:'Machine learning', bit:'Our final concept is modern machine learning.'}
          ]
        },
        {
          category: 'Curatorial strategy',
          prompt: 'Choose the strongest title for the exhibition you have built.',
          options: [
            {text:'A List of Old Mathematicians', score:0, bit:'We call the exhibition “A List of Old Mathematicians”.'},
            {text:'Rebels, Scientists and Risk: How Actuarial Science Emerged', score:2, bit:'We title the exhibition “Rebels, Scientists and Risk: How Actuarial Science Emerged”.'},
            {text:'Insurance: Nothing but Numbers', score:0, bit:'We title the exhibition “Insurance: Nothing but Numbers”.'},
            {text:'Famous People of the Eighteenth Century', score:1, bit:'We title the exhibition around famous eighteenth-century figures.'}
          ]
        },
        {
          category: 'Storytelling language',
          prompt: 'Which sentence gives the clearest Past Perfect / Past Simple relationship?',
          options: [
            {text:'By the time Morgan had formalised the role, Mores created the title “actuary”.', score:1, bit:'By the time Morgan had formalised the role, Mores created the title “actuary”.'},
            {text:'By the time Morgan formalises the role, Mores had created the title “actuary”.', score:0, bit:'By the time Morgan formalises the role, Mores had created the title “actuary”.'},
            {text:'By the time Morgan formalised the role, Mores had already created the title “actuary”.', score:2, bit:'By the time Morgan formalised the role, Mores had already created the title “actuary”.'},
            {text:'By the time Morgan formalised the role, Mores has already create the title “actuary”.', score:0, bit:'By the time Morgan formalised the role, Mores has already create the title “actuary”.'}
          ]
        },
        {
          category: 'Storytelling language',
          prompt: 'Which closing message best matches the story developed in the lesson?',
          options: [
            {text:'Actuarial science began as pure mathematics and remained separate from society.', score:0, bit:'Our conclusion presents actuarial science as pure mathematics separate from society.'},
            {text:'The history matters mainly because old vocabulary is useful to memorise.', score:0, bit:'Our conclusion focuses on memorising old vocabulary.'},
            {text:'The most important lesson is that one single person invented actuarial science.', score:0, bit:'Our conclusion credits one single inventor.'},
            {text:'Actuarial science emerged through insurance, probability, professional roles and a wider world of political, philosophical and religious ideas.', score:2, bit:'Our conclusion is that actuarial science emerged through insurance, probability, professional roles and a wider world of political, philosophical and religious ideas.'}
          ]
        }
      ]
    }
  ];

  const categoryOrder = ['Historical evidence', 'Actuarial connection', 'Curatorial strategy', 'Storytelling language'];

  const defaultState = () => ({
    playerCount: null,
    started: false,
    currentGallery: 0,
    answers: galleries.map(() => Array(4).fill(null)),
    completed: galleries.map(() => false),
    pitchNotes: galleries.map(() => ''),
    pitchEdited: galleries.map(() => false),
    sound: true,
    finalReached: false,
    finalScript: '',
    setupConfirmed: false,
    reviewFromFinal: false,
    savedSignatures: galleries.map(() => '')
  });

  const storageAvailable = (() => {
    try {
      const k = '__actuarial_museum_storage_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch { return false; }
  })();

  let storageWritable = storageAvailable;
  let state = loadState();
  let navLocked = false;
  let storageWarningShown = false;
  let timerInterval = null;
  let timerRemaining = 120;
  let timerDeadline = null;
  let statusTimer = null;

  const $ = (id) => document.getElementById(id);
  const stage = $('gameStage');
  const setupView = $('setupView');
  const galleryView = $('galleryView');
  const finalView = $('finalView');

  function safeParse(raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }

  function safeStorageGet(key) {
    try { return window.localStorage ? window.localStorage.getItem(key) : null; } catch { return null; }
  }

  function safeStorageSet(key, value) {
    try {
      if (!window.localStorage) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch { return false; }
  }

  function signatureFrom(answers, pitch) {
    return JSON.stringify({answers, pitch: String(pitch || '').trim()});
  }

  function gallerySignature(gi) {
    return signatureFrom(state.answers[gi], state.pitchNotes[gi]);
  }

  function validState(candidate) {
    if (!candidate || typeof candidate !== 'object') return false;
    if (![null,3,4].includes(candidate.playerCount)) return false;
    if (!Array.isArray(candidate.answers) || candidate.answers.length !== galleries.length) return false;
    if (!Array.isArray(candidate.completed) || candidate.completed.length !== galleries.length) return false;
    if (!Array.isArray(candidate.pitchNotes) || candidate.pitchNotes.length !== galleries.length) return false;
    const answerShape = candidate.answers.every((row) => Array.isArray(row) && row.length === 4 && row.every((x) => x === null || (Number.isInteger(x) && x >= 0 && x <= 3)));
    if (!answerShape) return false;
    if (!candidate.completed.every((x) => typeof x === 'boolean')) return false;
    if (!candidate.pitchNotes.every((x) => typeof x === 'string')) return false;
    return true;
  }

  function loadState() {
    let parsed = safeParse(safeStorageGet(STORAGE_KEY));
    if (!parsed) {
      for (const key of LEGACY_KEYS) {
        parsed = safeParse(safeStorageGet(key));
        if (parsed) break;
      }
    }
    if (!validState(parsed)) return defaultState();
    const fresh = defaultState();
    const merged = {...fresh, ...parsed};
    merged.currentGallery = Math.max(0, Math.min(galleries.length - 1, Number(merged.currentGallery) || 0));
    const hadFinalIntent = Boolean(merged.finalReached);
    merged.finalReached = Boolean(hadFinalIntent && merged.completed.every(Boolean));
    merged.started = Boolean(merged.started && [3,4].includes(merged.playerCount));
    merged.setupConfirmed = Boolean(merged.setupConfirmed && merged.started);
    merged.sound = merged.sound !== false;
    merged.finalScript = typeof merged.finalScript === 'string' ? merged.finalScript : '';
    merged.pitchEdited = Array.isArray(merged.pitchEdited) && merged.pitchEdited.length === galleries.length ? merged.pitchEdited.map(Boolean) : galleries.map(() => false);
    // Rebuild trustworthy saved signatures first. Legacy R1/R2 saves did not always
    // contain them, so completed legacy galleries receive a signature from their saved content.
    merged.savedSignatures = Array.isArray(parsed.savedSignatures) && parsed.savedSignatures.length === galleries.length
      ? parsed.savedSignatures.map((x, gi) => (typeof x === 'string' && x) ? x : (merged.completed[gi] ? signatureFrom(merged.answers[gi], merged.pitchNotes[gi]) : ''))
      : galleries.map((_, gi) => merged.completed[gi] ? signatureFrom(merged.answers[gi], merged.pitchNotes[gi]) : '');
    // A gallery is complete only when all four answers exist AND the current answers/pitch
    // still match the last explicitly saved version. This repairs stale R2 states where a
    // student edited a pitch note after saving without being asked to revalidate the gallery.
    merged.completed = merged.completed.map((done, gi) => Boolean(
      done &&
      merged.answers[gi].every((x) => x !== null) &&
      countWords(merged.pitchNotes[gi]) >= 30 &&
      countWords(merged.pitchNotes[gi]) <= 45 &&
      merged.savedSignatures[gi] &&
      merged.savedSignatures[gi] === signatureFrom(merged.answers[gi], merged.pitchNotes[gi])
    ));
    merged.finalReached = Boolean(hadFinalIntent && merged.completed.every(Boolean));
    const firstIncomplete = merged.completed.findIndex((x) => !x);
    if (merged.started && !merged.finalReached && firstIncomplete !== -1 && merged.currentGallery > firstIncomplete) {
      merged.currentGallery = firstIncomplete;
    }
    // If an old save thought it was already at the Final but R3 found a changed/unsaved
    // gallery, remember that intent so the team returns to Opening Night after revalidation.
    merged.reviewFromFinal = Boolean((merged.reviewFromFinal || (hadFinalIntent && !merged.finalReached)) && merged.started && !merged.finalReached);
    return merged;
  }

  function updateSaveBadge() {
    const badge = document.getElementById('saveBadge');
    if (!badge) return;
    badge.textContent = storageWritable ? '💾 Local auto-save' : '⚠️ Auto-save unavailable';
    badge.title = storageWritable ? 'Progress is saved only in this browser.' : 'This browser cannot currently save progress locally. Keep this tab open until you finish.';
  }

  function saveState() {
    const ok = storageAvailable && safeStorageSet(STORAGE_KEY, JSON.stringify(state));
    storageWritable = Boolean(ok);
    updateSaveBadge();
    if (!ok && !storageWarningShown) {
      storageWarningShown = true;
      window.setTimeout(() => showStatus('Auto-save is unavailable in this browser. Keep this tab open until you finish.'), 0);
    }
    return ok;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function showStatus(message) {
    const el = $('museumStatus');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => el.classList.remove('show'), 1700);
  }

  function setSound(on) {
    state.sound = Boolean(on);
    if (!state.sound && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    saveState();
    updateSoundButtons();
    if (state.sound) playTone('select');
  }

  function updateSoundButtons() {
    const text = state.sound ? '🔊 Sound on' : '🔇 Sound off';
    for (const id of ['soundToggle','soundToggleHero']) {
      const b = $(id);
      if (!b) continue;
      b.textContent = text;
      b.setAttribute('aria-pressed', String(state.sound));
    }
  }

  function audioContext() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      if (!audioContext.ctx) audioContext.ctx = new Ctx();
      return audioContext.ctx;
    } catch { return null; }
  }

  function playTone(kind='select') {
    if (!state.sound) return;
    const ctx = audioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    const patterns = {
      select: [[440,0,.06,.035]],
      save: [[392,0,.08,.04],[523,.09,.09,.045]],
      complete: [[392,0,.08,.04],[523,.10,.08,.04],[659,.20,.13,.05]],
      timer: [[330,0,.12,.05],[330,.18,.12,.05],[262,.38,.28,.06]]
    };
    try {
      (patterns[kind] || patterns.select).forEach(([freq, offset, duration, gain]) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, now + offset);
        g.gain.exponentialRampToValueAtTime(gain, now + offset + .01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);
        osc.connect(g).connect(ctx.destination);
        osc.start(now + offset); osc.stop(now + offset + duration + .02);
      });
    } catch { /* sound must never interrupt the game */ }
  }

  function speak(text) {
    if (!state.sound || !('speechSynthesis' in window)) {
      if (!state.sound) showStatus('Sound is off.');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      if (typeof window.SpeechSynthesisUtterance !== 'function') { showStatus('Voice playback is not available in this browser.'); return; }
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-GB';
      utter.rate = .96;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => /^en-GB/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang));
      if (voice) utter.voice = voice;
      window.speechSynthesis.speak(utter);
    } catch { showStatus('Voice playback is not available in this browser.'); }
  }

  function withNavLock(fn, ms=520) {
    if (navLocked) return;
    navLocked = true;
    try { fn(); } finally { setTimeout(() => { navLocked = false; }, ms); }
  }

  function currentScore() {
    let total = 0;
    state.answers.forEach((row, gi) => row.forEach((answer, qi) => {
      if (answer !== null) total += galleries[gi].questions[qi].options[answer].score;
    }));
    return total;
  }

  function savedScore() {
    let total = 0;
    state.answers.forEach((row, gi) => {
      if (!state.completed[gi]) return;
      row.forEach((answer, qi) => {
        if (answer !== null) total += galleries[gi].questions[qi].options[answer].score;
      });
    });
    return total;
  }

  function categoryScores() {
    const out = Object.fromEntries(categoryOrder.map((c) => [c, 0]));
    state.answers.forEach((row, gi) => row.forEach((answer, qi) => {
      if (answer === null) return;
      const q = galleries[gi].questions[qi];
      out[q.category] += q.options[answer].score;
    }));
    return out;
  }

  function countWords(text) {
    const clean = String(text || '').trim();
    return clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  }

  function secondsForWords(words) {
    return Math.round((words / 125) * 60);
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.round(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2,'0')}`;
  }

  function allAnswered(gi) {
    return state.answers[gi].every((x) => x !== null);
  }

  function pitchWordCount(gi) {
    return countWords(state.pitchNotes[gi]);
  }

  function pitchReady(gi) {
    const words = pitchWordCount(gi);
    return allAnswered(gi) && words >= 30 && words <= 45;
  }

  function syncGalleryCompletion(gi) {
    const saved = state.savedSignatures[gi];
    state.completed[gi] = Boolean(saved && pitchReady(gi) && gallerySignature(gi) === saved);
    return state.completed[gi];
  }

  function selectedOption(gi, qi) {
    const idx = state.answers[gi][qi];
    return idx === null ? null : galleries[gi].questions[qi].options[idx];
  }

  function suggestedPitch(gi) {
    if (!allAnswered(gi)) return '';
    const exhibit = featuredObject(gi);
    const featured = selectedOption(gi, galleries[gi].featuredQuestion);
    const strongChoice = featured?.score === 2;
    const strongNotes = [
      `We begin with ${exhibit}. The Ethical Society is historically significant as the first known insurance company. Mores created the title “actuary”, and Morgan later helped formalise the profession and its responsibilities.`,
      `Our second exhibit is ${exhibit}. Price published Bayes’s work, which had remained unknown until then. Probability, demography and premiums help connect ideas about uncertainty, population and insurance to actuarial thinking.`,
      `Our third exhibit is ${exhibit}. Price supported American independence through political pamphlets and financial advice. Dissenters were excluded from institutions because of their religious beliefs, showing why politics, religion and Enlightenment networks belong in this history.`,
      `Our final exhibit is ${exhibit}. It connects the four galleries into one story. Together, they show that actuarial science emerged through insurance, probability, professional roles and a wider world of political, philosophical and religious ideas.`
    ];
    if (strongChoice) return strongNotes[gi];
    const scaffoldNotes = [
      `Our first exhibit is ${exhibit}. To defend this choice, we need to explain what it helps visitors understand about the profession’s origins, then support our claim with evidence about the Ethical Society, Mores and Morgan.`,
      `Our second exhibit is ${exhibit}. To defend it, we need to connect it clearly to the probability story in the lesson and explain how Bayes, Price, population thinking or insurance payments help visitors understand uncertainty.`,
      `Our third exhibit is ${exhibit}. To defend this choice, we need evidence from the lesson about Price, American independence, Dissenters or Priestley, and we must explain why this wider political, religious and intellectual context belongs in actuarial history.`,
      `Our final exhibit is ${exhibit}. To defend it, we need to show how it connects the earlier galleries rather than simply naming it. Our conclusion should explain what visitors ought to remember about the origins of actuarial science.`
    ];
    return scaffoldNotes[gi];
  }

  function featuredObject(gi) {
    const g = galleries[gi];
    const option = selectedOption(gi, g.featuredQuestion);
    return option?.object || 'Not selected yet';
  }

  function renderProgress() {
    const wrap = $('galleryProgress');
    if (!wrap) return;
    wrap.innerHTML = galleries.map((g, i) => {
      const active = state.started && !state.finalReached && state.currentGallery === i;
      const complete = state.completed[i];
      const disabled = !state.started || (!complete && i > firstIncompleteIndex());
      return `<button class="gallery-step${active ? ' active' : ''}${complete ? ' complete' : ''}" type="button" data-gallery-jump="${i}" ${disabled ? 'disabled' : ''} aria-current="${active ? 'step' : 'false'}"><img src="${g.visual}" alt=""><span>${i+1}. ${escapeHtml(g.short)}</span></button>`;
    }).join('');
    wrap.querySelectorAll('[data-gallery-jump]').forEach((btn) => {
      btn.addEventListener('click', () => withNavLock(() => {
        const i = Number(btn.dataset.galleryJump);
        if (state.completed[i] || i <= firstIncompleteIndex()) {
          const wasFinal = state.finalReached;
          if (wasFinal) stopTimer();
          state.reviewFromFinal = state.reviewFromFinal || wasFinal;
          state.finalReached = false;
          state.currentGallery = i;
          saveState();
          playTone('select');
          render();
          scrollGameTop();
        }
      }));
    });
    $('miniScore').textContent = savedScore();
    $('progressLabel').textContent = !state.started ? 'Setup' : state.finalReached ? 'Opening night' : `Gallery ${state.currentGallery + 1} of 4`;
  }

  function firstIncompleteIndex() {
    const i = state.completed.findIndex((x) => !x);
    return i === -1 ? galleries.length : i;
  }

  function renderNotebook() {
    const wrap = $('pitchNotebookEntries');
    if (!wrap) return;
    wrap.innerHTML = galleries.map((g, i) => {
      const note = state.pitchNotes[i].trim();
      return `<div class="pitch-entry${note ? '' : ' empty'}"><strong>Gallery ${i+1} · ${escapeHtml(g.short)}</strong><p>${note ? escapeHtml(note) : 'Your speaking note will appear here.'}</p></div>`;
    }).join('');
    const words = state.pitchNotes.reduce((sum, n) => sum + countWords(n), 0) + (state.pitchNotes.some((n) => n.trim()) ? 49 : 0);
    const seconds = secondsForWords(words);
    $('pitchWords').textContent = words;
    $('pitchTime').textContent = formatTime(seconds);
    const hint = $('pitchHint');
    if (words === 0) hint.textContent = 'Build one 30–45 word note per gallery. The projection also allows for a short opening and conclusion.';
    else if (seconds > 108) hint.textContent = 'Your projected pitch is getting long. Trim repeated facts so you have time for pauses and speaker handovers.';
    else if (seconds < 70 && state.completed.filter(Boolean).length >= 3) hint.textContent = 'You still have room for clearer links between the exhibits.';
    else hint.textContent = 'Good pace. Keep the complete team pitch under 2:00, including speaker handovers.';
  }

  function renderSetup() {
    setupView.innerHTML = `
      <div class="setup-card">
        <p class="museum-kicker">STEP 1 · BUILD YOUR CURATORIAL TEAM</p>
        <h2>How many curators are playing?</h2>
        <p class="setup-lead">Use one device per team. Choose 3 or 4 students. The historical questions, options and scoring are identical: only the team roles and final speaking split change.</p>
        <div class="player-choice-grid">
          <button class="player-choice" type="button" data-players="3" aria-pressed="${state.playerCount === 3}"><strong>3 students</strong><span>Three roles · roughly 30–40 seconds each in the final pitch.</span></button>
          <button class="player-choice" type="button" data-players="4" aria-pressed="${state.playerCount === 4}"><strong>4 students</strong><span>Four roles · roughly 20–30 seconds each in the final pitch.</span></button>
        </div>
        <div id="rolePreview"></div>
        <div class="setup-warning"><strong>Final deliverable:</strong> ONE team pitch, <strong>2:00 maximum for the whole team (not 2 minutes each)</strong>. Every student must speak. In each gallery, prepare one 30–45 word note; the Pitch Notebook combines those four notes into your final structure.</div>
        <div class="gallery-actions"><span></span><button class="museum-btn primary" id="confirmSetupBtn" type="button" ${state.playerCount ? '' : 'disabled'}>Start Gallery I →</button></div>
      </div>`;

    const updateRoles = () => {
      const rolePreview = $('rolePreview');
      if (!state.playerCount) { rolePreview.innerHTML = ''; return; }
      rolePreview.innerHTML = `<p class="museum-kicker">TEAM ROLES</p><div class="role-grid">${roles[state.playerCount].map(([name,desc]) => `<div class="role-card"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(desc)}</span></div>`).join('')}</div>`;
      $('confirmSetupBtn').disabled = false;
    };
    updateRoles();

    setupView.querySelectorAll('[data-players]').forEach((btn) => btn.addEventListener('click', () => {
      state.playerCount = Number(btn.dataset.players);
      state.started = false;
      state.setupConfirmed = false;
      saveState();
      playTone('select');
      renderSetup();
    }));
    $('confirmSetupBtn').addEventListener('click', () => withNavLock(() => {
      if (![3,4].includes(state.playerCount)) return;
      state.started = true;
      state.setupConfirmed = true;
      state.reviewFromFinal = false;
      if (state.completed.every(Boolean)) {
        state.finalReached = true;
        state.currentGallery = galleries.length - 1;
      } else {
        state.finalReached = false;
        state.currentGallery = Math.min(firstIncompleteIndex(), galleries.length - 1);
      }
      saveState();
      playTone('complete');
      render();
      scrollGameTop();
    }));
  }

  function focusOptionSoon(qi, oi) {
    window.requestAnimationFrame(() => {
      const target = galleryView.querySelector(`.option-card[data-q="${qi}"][data-o="${oi}"]`);
      if (target) target.focus({preventScroll:true});
    });
  }

  function wireRadioKeyboard() {
    galleryView.querySelectorAll('.options-grid').forEach((group) => {
      const buttons = [...group.querySelectorAll('.option-card')];
      buttons.forEach((btn, index) => btn.addEventListener('keydown', (event) => {
        if (!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key)) return;
        event.preventDefault();
        const delta = ['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1;
        buttons[(index + delta + buttons.length) % buttons.length].click();
      }));
    });
  }

  function renderGallery() {
    const gi = state.currentGallery;
    const g = galleries[gi];
    galleryView.innerHTML = `
      <div class="gallery-header">
        <div>
          <span class="gallery-number">Gallery ${gi + 1} / 4</span>
          <p class="museum-kicker" style="margin-top:14px">CURATOR BRIEFING</p>
          <h2 class="gallery-title">${escapeHtml(g.title)}</h2>
          <p class="gallery-brief">${escapeHtml(g.brief)}</p>
          <button class="museum-btn subtle" id="hearBriefBtn" type="button">🔊 Hear the curator briefing</button>
        </div>
        <img src="${g.visual}" alt="Illustration for ${escapeHtml(g.title)}.">
      </div>
      <div class="gallery-task-strip" role="note" aria-label="What to do in this gallery"><strong>What your team must do now</strong><span>1. Read the four decisions.</span><span>2. Discuss every option and agree on one answer per decision.</span><span>3. Review the suggested note, edit it if needed, and keep it between 30 and 45 words.</span><span>4. Check: exhibit + evidence + importance + link.</span><span>5. Click <em>Save gallery</em> before moving on.</span></div>
      <div class="gallery-object-strip" aria-label="Objects in this gallery">
        ${g.objects.map(([src,label]) => `<figure class="object-mini"><img src="${src}" alt="${escapeHtml(label)} illustration."><span>${escapeHtml(label)}</span></figure>`).join('')}
      </div>
      <div class="question-list">
        ${g.questions.map((q, qi) => `
          <section class="question-card" aria-labelledby="q-${gi}-${qi}">
            <div class="question-head"><span class="question-no">${qi+1}</span><div><h3 id="q-${gi}-${qi}">${escapeHtml(q.prompt)}</h3><span class="question-category">${escapeHtml(q.category)}</span></div></div>
            <div class="options-grid" role="radiogroup" aria-label="${escapeHtml(q.prompt)}">
              ${q.options.map((opt, oi) => `<button class="option-card${state.answers[gi][qi] === oi ? ' selected' : ''}" type="button" role="radio" aria-checked="${state.answers[gi][qi] === oi}" data-q="${qi}" data-o="${oi}"><span class="option-letter">${String.fromCharCode(65+oi)}</span>${escapeHtml(opt.text)}</button>`).join('')}
            </div>
          </section>`).join('')}
      </div>
      <section class="pitch-builder-card" aria-labelledby="pitchBuilderHeading">
        <p class="museum-kicker">ADD TO YOUR FINAL PITCH</p>
        <h3 id="pitchBuilderHeading">Pitch Notebook · Gallery ${gi+1}</h3>
        <p>${escapeHtml(g.pitchPrompt)}</p>
        <textarea class="pitch-textarea" id="galleryPitchNote" maxlength="420" ${allAnswered(gi) ? '' : 'disabled'} placeholder="Choose all four answers first. A suggested speaking note will then appear here.">${escapeHtml(state.pitchNotes[gi])}</textarea>
        <div class="pitch-tools"><small id="galleryPitchCount">${countWords(state.pitchNotes[gi])} words · 30–45 required to save</small><button class="museum-btn subtle" id="suggestPitchBtn" type="button" ${allAnswered(gi) ? '' : 'disabled'}>Use suggested wording</button></div>
        <div class="pitch-checklist" aria-label="Speaking structure for this gallery"><strong>Before you save, make sure your note:</strong><span>① names the exhibit</span><span>② gives one piece of evidence</span><span>③ explains why it matters</span><span>④ links it to your museum story</span></div>
      </section>
      <div class="gallery-actions">
        <button class="museum-btn subtle" id="backGalleryBtn" type="button">${gi === 0 ? '← Team setup' : '← Previous gallery'}</button>
        <button class="museum-btn primary" id="saveGalleryBtn" type="button" ${pitchReady(gi) ? '' : 'disabled'}>${state.completed[gi] ? 'Save changes' : 'Save gallery'} ${gi === 3 ? '→ Opening night' : '→ Next gallery'}</button>
      </div>`;

    $('hearBriefBtn').addEventListener('click', () => speak(`Gallery ${gi+1}. ${g.title}. ${g.brief}`));
    wireRadioKeyboard();

    galleryView.querySelectorAll('.option-card').forEach((btn) => btn.addEventListener('click', () => {
      const qi = Number(btn.dataset.q);
      const oi = Number(btn.dataset.o);
      state.answers[gi][qi] = oi;
      if (!state.pitchEdited[gi] && allAnswered(gi)) state.pitchNotes[gi] = suggestedPitch(gi);
      syncGalleryCompletion(gi);
      saveState();
      playTone('select');
      renderGallery();
      renderProgress();
      renderNotebook();
      focusOptionSoon(qi, oi);
    }));

    const note = $('galleryPitchNote');
    const initialPitchWords = countWords(note.value);
    $('galleryPitchCount').className = initialPitchWords >= 30 && initialPitchWords <= 45 ? 'pitch-count-good' : allAnswered(gi) ? 'pitch-count-warning' : '';
    note.addEventListener('input', () => {
      state.pitchNotes[gi] = note.value;
      state.pitchEdited[gi] = true;
      syncGalleryCompletion(gi);
      saveState();
      const words = countWords(note.value);
      $('galleryPitchCount').textContent = `${words} words · 30–45 required to save`;
      $('galleryPitchCount').className = words >= 30 && words <= 45 ? 'pitch-count-good' : 'pitch-count-warning';
      const saveBtn = $('saveGalleryBtn');
      if (saveBtn) saveBtn.disabled = !pitchReady(gi);
      renderProgress();
      renderNotebook();
    });

    $('suggestPitchBtn').addEventListener('click', () => {
      state.pitchNotes[gi] = suggestedPitch(gi);
      state.pitchEdited[gi] = false;
      syncGalleryCompletion(gi);
      saveState();
      playTone('select');
      renderGallery();
      renderNotebook();
    });

    $('backGalleryBtn').addEventListener('click', () => withNavLock(() => {
      if (gi === 0) {
        state.started = false;
        state.setupConfirmed = false;
      } else {
        state.currentGallery = gi - 1;
      }
      saveState();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      render();
      scrollGameTop();
    }));

    $('saveGalleryBtn').addEventListener('click', () => withNavLock(() => saveGallery(gi)));
  }

  function saveGallery(gi) {
    if (!allAnswered(gi)) {
      showStatus('Choose one answer for each decision first.');
      return;
    }
    const words = pitchWordCount(gi);
    if (words < 30 || words > 45) {
      showStatus(`Your Pitch Notebook note has ${words} words. Keep it between 30 and 45 words before saving.`);
      const note = $('galleryPitchNote'); if (note) note.focus();
      return;
    }
    const newSignature = gallerySignature(gi);
    const contentChanged = Boolean(state.savedSignatures[gi] && state.savedSignatures[gi] !== newSignature);
    state.completed[gi] = true;
    state.savedSignatures[gi] = newSignature;
    if (contentChanged) state.finalScript = '';
    playTone(gi === galleries.length - 1 ? 'complete' : 'save');
    if (state.completed.every(Boolean)) {
      state.finalReached = true;
      state.reviewFromFinal = false;
      state.currentGallery = galleries.length - 1;
    } else {
      state.finalReached = false;
      state.currentGallery = Math.min(firstIncompleteIndex(), galleries.length - 1);
    }
    saveState();
    render();
    showStatus(`Gallery ${gi+1} saved. Your pitch notebook has been updated.`);
    scrollGameTop();
  }

  function defaultFinalScript() {
    const intro = 'Welcome to The Actuarial Museum. We chose four exhibits to show how actuarial science emerged from insurance, probability, professional roles and a wider intellectual world.';
    const notes = state.pitchNotes.map((n) => n.trim()).filter(Boolean);
    const closing = 'Together, these exhibits show that actuarial science was never only about mathematics: it developed through institutions, ideas, people and changing ways of understanding risk.';
    return [intro, ...notes, closing].join('\n\n');
  }

  function speakerPlan() {
    const p = state.playerCount;
    if (p === 4) return [
      ['Speaker 1 · Head Curator', 'Open the exhibition, then present Gallery I. Aim for about 25–30 seconds.'],
      ['Speaker 2 · Evidence Officer', 'Present Gallery II and give one clear historical sequence. Aim for about 20–25 seconds.'],
      ['Speaker 3 · Relevance Officer', 'Present Gallery III and explain why the wider context matters. Aim for about 20–25 seconds.'],
      ['Speaker 4 · Visitor Designer', 'Present Gallery IV, then deliver the conclusion. Aim for about 25–30 seconds.']
    ];
    return [
      ['Speaker 1 · Head Curator', 'Open the exhibition, then present Gallery I. Aim for about 30–35 seconds.'],
      ['Speaker 2 · Evidence Officer', 'Present Galleries II and III, using one clear historical sequence. Aim for about 35–40 seconds.'],
      ['Speaker 3 · Actuarial Story Officer', 'Present Gallery IV, then deliver the conclusion. Aim for about 30–35 seconds.']
    ];
  }

  function renderFinal() {
    if (!state.completed.every(Boolean)) {
      state.finalReached = false;
      state.reviewFromFinal = false;
      state.currentGallery = Math.min(firstIncompleteIndex(), galleries.length - 1);
      saveState();
      render();
      return;
    }
    if (!state.finalScript.trim()) { state.finalScript = defaultFinalScript(); saveState(); }
    const scores = categoryScores();
    const total = currentScore();
    const titleOption = selectedOption(3,1)?.text || 'Your exhibition';
    finalView.innerHTML = `
      <div class="final-hero">
        <img src="assets/session2-museum/gallery4-final.svg" alt="Four framed exhibits on the final museum wall.">
        <p class="museum-kicker" style="margin-top:16px">OPENING NIGHT</p>
        <h2 class="final-title">Your exhibition is ready.</h2>
        <p class="final-subtitle"><strong>${escapeHtml(titleOption)}</strong><br>You now have one final job: turn your four curated choices into a clear two-minute spoken story.</p>
      </div>
      <div class="exhibition-wall" aria-label="Your four selected exhibits">
        ${galleries.map((g,i) => `<div class="wall-frame"><span>Gallery ${i+1}</span><strong>${escapeHtml(featuredObject(i))}</strong></div>`).join('')}
      </div>
      <div class="score-board">
        ${categoryOrder.map((cat) => `<div class="score-cell"><span>${escapeHtml(cat)}</span><strong>${scores[cat]}/8</strong></div>`).join('')}
      </div>
      <div class="final-total"><span><strong>Curatorial score</strong><br>${total >= 28 ? 'Master Curators' : total >= 22 ? 'Strong Exhibition' : total >= 16 ? 'Promising Exhibition' : 'Revisit the archive'}</span><strong>${total}/${MAX_SCORE}</strong></div>
      <section class="final-pitch-section">
        <p class="museum-kicker">TEAM RECAP BUILDER</p>
        <h2>Your final pitch · 2 minutes maximum</h2>
        <div class="final-deliverable" role="note"><strong>Exactly what to deliver</strong><p><strong>ONE team pitch · maximum 2:00 TOTAL.</strong> Every student speaks. This is not 2 minutes per person.</p><ol><li>Open with one sentence introducing your exhibition.</li><li>Present Galleries I–IV in order. For each one: name the exhibit, give one piece of historical evidence, and explain why it matters.</li><li>Use at least one clear historical sequence (for example Past Perfect + Past Simple).</li><li>Finish with one conclusion: what should visitors remember about the origins of actuarial science?</li></ol><p><strong>Aim:</strong> about 160–210 words for the whole team so you have time for pauses and speaker handovers.</p></div>
        <div class="speaker-plan">${speakerPlan().map(([who,task]) => `<div class="speaker-row"><strong>${escapeHtml(who)}</strong><p>${escapeHtml(task)}</p></div>`).join('')}</div>
        <textarea class="final-script" id="finalScript" maxlength="2200" aria-label="Editable final team pitch">${escapeHtml(state.finalScript)}</textarea>
        <div class="pitch-tools"><small id="finalWordCount"></small><span id="finalTimeEstimate"></span></div>
        <div class="final-tools"><button class="museum-btn subtle" id="resetScriptBtn" type="button">Rebuild from Pitch Notebook</button><button class="museum-btn subtle" id="copyScriptBtn" type="button">Copy pitch</button></div>
        <div class="timer-box"><strong>Practice timer</strong><span class="timer-display" id="timerDisplay">2:00</span><button class="museum-btn" id="timerStartBtn" type="button">Start</button><button class="museum-btn" id="timerResetBtn" type="button">Reset</button><span id="timerMessage"></span></div>
      </section>
      <div class="gallery-actions"><button class="museum-btn subtle" id="reviewBtn" type="button">← Review Gallery IV</button><button class="museum-btn subtle" id="restartBtn" type="button">Restart museum</button></div>`;

    const script = $('finalScript');
    const updateScriptStats = () => {
      const words = countWords(script.value);
      const sec = secondsForWords(words);
      $('finalWordCount').textContent = `${words} words`;
      $('finalTimeEstimate').textContent = `Estimated speaking time: ${formatTime(sec)} at ~125 words/min`;
      $('finalTimeEstimate').className = sec > 105 ? 'timer-warning' : '';
      $('finalTimeEstimate').title = sec > 105 ? 'Trim the script to leave time for pauses and speaker handovers.' : 'This estimate leaves room for natural pauses if you keep a steady pace.';
    };
    updateScriptStats();
    script.addEventListener('input', () => { state.finalScript = script.value; saveState(); updateScriptStats(); });
    $('resetScriptBtn').addEventListener('click', () => {
      state.finalScript = defaultFinalScript(); saveState(); script.value = state.finalScript; updateScriptStats(); playTone('select'); showStatus('Pitch rebuilt from your four gallery notes.');
    });
    $('copyScriptBtn').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(script.value); showStatus('Pitch copied.'); playTone('save'); }
      catch { script.focus(); script.select(); showStatus('Select and copy the highlighted pitch.'); }
    });
    $('reviewBtn').addEventListener('click', () => withNavLock(() => {
      stopTimer(); state.reviewFromFinal = true; state.finalReached = false; state.currentGallery = 3; saveState(); render(); scrollGameTop();
    }));
    $('restartBtn').addEventListener('click', () => withNavLock(() => {
      if (!window.confirm('Restart The Actuarial Museum? This will clear this team’s saved choices and pitch notes.')) return;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      stopTimer();
      const sound = state.sound;
      state = defaultState(); state.sound = sound; saveState(); render(); showStatus('Museum restarted.'); scrollGameTop();
    }));
    $('timerStartBtn').addEventListener('click', toggleTimer);
    $('timerResetBtn').addEventListener('click', resetTimer);
    renderTimer();
  }

  function renderTimer() {
    const display = $('timerDisplay');
    if (!display) return;
    display.textContent = formatTime(timerRemaining);
    const msg = $('timerMessage');
    if (timerRemaining === 0) { msg.textContent = 'Time. Finish your sentence.'; msg.className = 'timer-warning'; }
    else if (timerRemaining <= 20) { msg.textContent = '20 seconds or less — move to your conclusion.'; msg.className = 'timer-warning'; }
    else { msg.textContent = 'Maximum 2:00 for the whole team.'; msg.className = ''; }
    const btn = $('timerStartBtn');
    if (btn) btn.textContent = timerInterval ? 'Pause' : timerRemaining === 0 ? 'Start again' : 'Start';
  }

  function syncTimerFromClock() {
    if (!timerDeadline) return;
    timerRemaining = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
    if (timerRemaining === 0) {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null; timerDeadline = null;
      playTone('timer');
    }
    renderTimer();
  }

  function toggleTimer() {
    if (timerInterval) {
      syncTimerFromClock();
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null; timerDeadline = null; renderTimer(); return;
    }
    if (timerRemaining === 0) timerRemaining = 120;
    timerDeadline = Date.now() + timerRemaining * 1000;
    timerInterval = setInterval(syncTimerFromClock, 250);
    syncTimerFromClock();
  }

  function stopTimer() {
    if (timerInterval) { syncTimerFromClock(); clearInterval(timerInterval); }
    timerInterval = null; timerDeadline = null;
  }
  function resetTimer() { stopTimer(); timerRemaining = 120; renderTimer(); playTone('select'); }

  function scrollGameTop() {
    const top = stage.getBoundingClientRect().top + window.scrollY - 82;
    const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth'});
  }

  function render() {
    updateSoundButtons();
    renderProgress();
    renderNotebook();
    setupView.hidden = state.started;
    galleryView.hidden = !state.started || state.finalReached;
    finalView.hidden = !state.finalReached;
    if (!state.started) renderSetup();
    else if (state.finalReached) renderFinal();
    else renderGallery();
  }

  $('startSetupBtn').addEventListener('click', () => withNavLock(() => {
    stage.hidden = false;
    if (state.started && state.completed.every(Boolean)) state.finalReached = true;
    saveState();
    render();
    playTone('complete');
    scrollGameTop();
  }));
  $('soundToggleHero').addEventListener('click', () => setSound(!state.sound));
  $('soundToggle').addEventListener('click', () => setSound(!state.sound));

  window.addEventListener('pageshow', () => { navLocked = false; updateSoundButtons(); });
  window.addEventListener('pagehide', () => { navLocked = false; stopTimer(); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    if (!document.hidden && timerInterval) syncTimerFromClock();
  });

  updateSoundButtons();
  updateSaveBadge();
  if (state.started) stage.hidden = false;
  render();
})();
