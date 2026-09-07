
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const KEY = 'actuarial_group_draft_r29';
  const OLD_KEYS = ['actuarial_group_draft_r28','actuarial_group_draft_r27','actuarial_group_draft_r26','actuarial_group_draft_r25','actuarial_group_draft_r24','actuarial_group_draft_r23','actuarial_group_draft_r22','actuarial_group_draft_r21','actuarial_group_draft_v4_final_audit','actuarial_group_draft_v3_audit'];
  const mount = $('#gameMount');
  const progressFill = $('#progressFill');
  const dots = $$('#progressDots li');
  const soundBtn = $('#soundToggle');
  const defaultState = () => ({stage:1, soundOn:true, players:null, client:null, expertise:[], team:[], tools:[], identity:[], challengeChoice:null, firmName:'', promise:'', challengeId:null});
  let state;
  let soundOn = true;
  let voice = null;
  let feedback = {text:'', type:'info'};
  let audioCtx = null;
  let lockNav = false;
  let lastChoiceKey = '';
  let lastChoiceAt = 0;

  const data = {
    client:[
      {id:'insurance', label:'Insurance companies', cost:14, icon:'🚗', blurb:'Pricing, claims and portfolio risk.', tag:'Claims, premiums, portfolio risk', points:['claims','premiums','portfolio risk']},
      {id:'pensions', label:'Pension funds', cost:14, icon:'🏦', blurb:'Long-term obligations and longevity.', tag:'Liabilities, longevity, funding', points:['liabilities','longevity','future obligations']},
      {id:'banks', label:'Banks & financial institutions', cost:16, icon:'📈', blurb:'Capital, stress and market scenarios.', tag:'Capital, stress testing, market risk', points:['capital','stress testing','financial risk']},
      {id:'health', label:'Healthcare organisations', cost:12, icon:'🏥', blurb:'Population costs, demand and uncertainty.', tag:'Healthcare costs, demand, uncertainty', points:['health costs','population data','uncertainty']},
      {id:'climate', label:'Climate-risk clients', cost:18, icon:'🌍', blurb:'Extreme events and exposure modelling.', tag:'Exposure, severe weather, catastrophe risk', points:['exposure','extreme events','catastrophe loss']},
      {id:'international', label:'International companies', cost:18, icon:'🌐', blurb:'Complex operations across markets.', tag:'Multi-market risk, scenarios, exposure', points:['multi-market risk','scenario planning','complex exposure']}
    ],
    expertise:[
      {id:'pricing', label:'Pricing', cost:16, icon:'💷', blurb:'Estimate sustainable premiums.', tag:'Good for insurance and product decisions'},
      {id:'reserving', label:'Reserving', cost:16, icon:'📚', blurb:'Estimate future claim obligations.', tag:'Good for liabilities and claim forecasting'},
      {id:'pensions', label:'Pensions', cost:16, icon:'👥', blurb:'Long-term liabilities and funding.', tag:'Good for pension and longevity work'},
      {id:'risk', label:'Risk management', cost:14, icon:'🛡️', blurb:'Identify and compare uncertainties.', tag:'Good for governance and decision-making'},
      {id:'modelling', label:'Data modelling', cost:14, icon:'🧮', blurb:'Build models from data and assumptions.', tag:'Good for evidence-based analysis'},
      {id:'climate', label:'Climate risk', cost:18, icon:'🌦️', blurb:'Scenario analysis for extreme events.', tag:'Good for severe weather and exposure'}
    ],
    team:[
      {id:'senior', label:'Senior actuary', cost:18, icon:'🧠', blurb:'Experience, judgement and quality control.', tag:'Credibility and judgement'},
      {id:'junior', label:'Junior actuary team', cost:14, icon:'📘', blurb:'Analysts who prepare and test the work.', tag:'Capacity and technical support'},
      {id:'datasci', label:'Data scientist', cost:16, icon:'💻', blurb:'Data pipelines and analytical support.', tag:'Data cleaning and automation'},
      {id:'economist', label:'Economist', cost:12, icon:'📉', blurb:'Macro context and economic assumptions.', tag:'Context and assumptions'},
      {id:'compliance', label:'Compliance specialist', cost:14, icon:'⚖️', blurb:'Governance, regulation and documentation.', tag:'Regulation and governance'},
      {id:'communication', label:'Client communication officer', cost:12, icon:'🗣️', blurb:'Clear explanations for non-specialists.', tag:'Client-friendly explanations'}
    ],
    tools:[
      {id:'traditional', label:'Traditional actuarial modelling', cost:8, icon:'🧩', blurb:'Reliable core modelling environment.', tag:'Reliable modelling backbone'},
      {id:'scenario', label:'Advanced scenario analysis', cost:10, icon:'📊', blurb:'Compare plausible future outcomes.', tag:'Trade-offs and future scenarios'},
      {id:'ai', label:'AI-assisted analytics', cost:14, icon:'🤖', blurb:'Support pattern detection and analysis.', tag:'Pattern spotting and support'},
      {id:'dashboards', label:'Interactive dashboards', cost:10, icon:'🖥️', blurb:'Make results easier to explore and explain.', tag:'Clear visual communication'},
      {id:'stress', label:'Stress-testing tools', cost:10, icon:'🧪', blurb:'Test severe but plausible conditions.', tag:'Stress scenarios and resilience'},
      {id:'cat', label:'Catastrophe visualisation', cost:14, icon:'🛰️', blurb:'Map exposure to extreme events.', tag:'Climate and catastrophe visuals'}
    ],
    identity:[
      {id:'reliable', label:'Reliable & conservative', cost:0, icon:'🧱', blurb:'Careful assumptions and robust processes.', tag:'Stability and trust'},
      {id:'innovative', label:'Innovative & data-driven', cost:0, icon:'🚀', blurb:'New methods backed by evidence.', tag:'Modern and ambitious'},
      {id:'client', label:'Client-focused & clear', cost:0, icon:'🤝', blurb:'Useful advice for non-specialists.', tag:'Clear communication'},
      {id:'specialist', label:'Specialist & high-level', cost:0, icon:'🎯', blurb:'Deep expertise in selected areas.', tag:'Deep expertise'},
      {id:'international', label:'International & ambitious', cost:0, icon:'🌍', blurb:'A broad offer across markets.', tag:'Broad market outlook'},
      {id:'agile', label:'Agile & modern', cost:0, icon:'⚡', blurb:'Fast decisions and adaptability.', tag:'Fast and adaptable'}
    ]
  };

  state = normaliseState(load());
  soundOn = state.soundOn;

  const stageMeta = {
    1:{title:'Choose your first target client', subtitle:'Your investors want to know who this new firm is for. Pick one client segment to anchor the whole draft.', img:'group-office-r27.webp', icon:'🎯', badges:['Choose one','This decision shapes the alert','Discuss before selecting'], audio:'Round one. Choose one target client for your actuarial consultancy.', gallery:[['group-case-files-r27.webp','Client files waiting for your decision'],['group-client-meeting-r27.webp','Imagine the first client conversation'],['group-office-r27.webp','Your team enters the consultancy']]},
    2:{title:'Build your technical expertise', subtitle:'You cannot promise everything. Choose exactly two areas of expertise that make sense together.', img:'group-case-files-r27.webp', icon:'📚', badges:['Choose exactly two','Technical offer','Stay strategic'], audio:'Round two. Choose two expertise areas that support your chosen client.', gallery:[['group-case-files-r27.webp','Case files suggest several directions'],['group-analytics-r27.webp','Think of the data you would analyse'],['group-risk-lab-r27.webp','Models and scenarios must match the brief']]},
    3:{title:'Recruit the core team', subtitle:'Your consultancy needs people, not just ideas. Choose the two profiles that will make the biggest difference.', img:'group-client-meeting-r27.webp', icon:'👥', badges:['Choose exactly two','Human resources','Trade-offs matter'], audio:'Round three. Recruit two profiles for your new actuarial firm.', gallery:[['group-client-meeting-r27.webp','Client-facing skills matter'],['group-office-r27.webp','Who will work in this office?'],['group-boardroom-r27.webp','Who can defend the work in the boardroom?']]},
    4:{title:'Invest in the tools', subtitle:'The board will ask what your firm actually uses to analyse uncertainty. Pick two tools.', img:'group-risk-lab-r27.webp', icon:'🛠️', badges:['Choose exactly two','Technology','Budget pressure'], audio:'Round four. Pick two tools that your firm will use to analyse uncertainty.', gallery:[['group-risk-lab-r27.webp','The risk lab is open'],['group-analytics-r27.webp','Dashboards and metrics matter'],['group-boardroom-r27.webp','Choose tools you can justify']]},
    5:{title:'Decide what kind of firm you are', subtitle:'These identity choices are free, but you will need to prove them later. Choose two.', img:'group-analytics-r27.webp', icon:'✨', badges:['Choose exactly two','Free but important','Prepare the pitch'], audio:'Round five. Choose two identity words for your firm.', gallery:[['group-office-r27.webp','The office creates a first impression'],['group-client-meeting-r27.webp','Your identity must sound credible'],['group-boardroom-r27.webp','The board will challenge vague promises']]},
    6:{title:'War-room review', subtitle:'Check whether your firm is coherent, affordable and convincing before the real test arrives.', img:'group-boardroom-r27.webp', icon:'🧭', badges:['Review','Budget check','Strengths + risks'], audio:'Round six. Review the firm before the investor board arrives.', gallery:[['group-boardroom-r27.webp','Boardroom rehearsal'],['group-analytics-r27.webp','Review your evidence'],['group-case-files-r27.webp','Review your client fit']]},
    7:{title:'Client alert', subtitle:'A real client problem hits your desk. The challenge is fixed by your choices — not by randomness.', img:'group-risk-lab-r27.webp', icon:'🚨', badges:['Deterministic','Make one decision','Consequences'], audio:'Round seven. Respond to a client alert based on your earlier choices.', gallery:[['group-risk-lab-r27.webp','You need evidence, not guesswork'],['group-client-meeting-r27.webp','Prepare a clear response'],['group-boardroom-r27.webp','Your answer must survive scrutiny']]},
    8:{title:'Boardroom pitch', subtitle:'Name the firm, generate the board brief and prepare your final presentation.', img:'group-boardroom-r27.webp', icon:'🏛️', badges:['Boardroom','Every student speaks','Copy your brief'], audio:'Round eight. Prepare the boardroom pitch and final brief.', gallery:[['group-boardroom-r27.webp','Final presentation time'],['group-client-meeting-r27.webp','Client language must stay clear'],['group-office-r27.webp','Your consultancy is now ready to launch']]}
  };

  function load(){
    // Read each key independently. A malformed current save must not prevent
    // recovery from the previous valid version.
    for(const key of [KEY, ...OLD_KEYS]){
      try{
        const raw = sessionStorage.getItem(key);
        if(!raw) continue;
        const parsed = JSON.parse(raw);
        if(parsed && typeof parsed === 'object') return parsed;
      }catch(_){ /* try the next recoverable key */ }
    }
    return null;
  }
  function optionBy(group,id){ return data[group].find(x => x.id === id); }
  function canonicalIds(group, ids){
    const wanted = new Set(Array.isArray(ids) ? ids : []);
    return data[group].filter(item => wanted.has(item.id)).map(item => item.id).slice(0,2);
  }
  function challengeFor(s){
    if(s.client==='climate' || s.expertise.includes('climate')) return {id:'climate-cat-loss', title:'Catastrophe-loss alert', intro:'A client reports that severe weather losses have jumped sharply across two regions. They need advice today.', choices:[['Run new climate scenarios, test exposure and explain the uncertainty clearly to the client.', true],['Ignore the new information and keep last year’s assumptions unchanged.', false],['Promise that losses will certainly fall next year.', false]], why:'A climate-risk client expects scenario analysis, updated assumptions and transparent communication.'};
    if(s.client==='pensions' || s.expertise.includes('pensions')) return {id:'pensions-longevity', title:'Longevity pressure', intro:'A pension client fears that members may live longer than expected, increasing future obligations.', choices:[['Review longevity assumptions, model future liabilities and discuss the funding impact.', true],['Remove the uncertainty section to reassure the client.', false],['Focus only on office costs instead of future obligations.', false]], why:'Pension work requires a direct link between assumptions, liabilities and long-term cost.'};
    if(s.client==='insurance' || s.expertise.includes('pricing') || s.expertise.includes('reserving')) return {id:'insurance-claims-spike', title:'Claims spike', intro:'A motor-insurance client sees claim costs rising faster than expected and wants a fast recommendation.', choices:[['Analyse claim frequency and severity, review assumptions and assess the effect on premiums or reserves.', true],['Tell the client to wait a year without analysing the trend.', false],['Rewrite the marketing slogan first.', false]], why:'Insurance clients need evidence-based action built on claims data and actuarial judgement.'};
    if(s.client==='health') return {id:'health-cost-volatility', title:'Healthcare-cost volatility', intro:'A healthcare client notices rising costs and inconsistent data between departments.', choices:[['Clean the data, compare the cost drivers and explain which uncertainties matter most.', true],['Pretend the dataset is perfect and publish a result immediately.', false],['Avoid discussing uncertainty with the client.', false]], why:'Healthcare organisations need both data quality and clear explanation of cost uncertainty.'};
    if(s.client==='banks') return {id:'banks-capital-stress', title:'Capital-stress request', intro:'A bank wants a rapid stress scenario to understand how an adverse shock could affect its position.', choices:[['Run a stress scenario, document assumptions and explain the possible financial consequences.', true],['Guarantee the exact future outcome without showing assumptions.', false],['Skip scenario work because it is too technical for the client.', false]], why:'Banks and financial institutions expect scenario-based thinking and disciplined assumptions.'};
    return {id:'international-multi-market', title:'Multi-market risk alert', intro:'An international client expands into two new markets and wants an urgent cross-market risk view.', choices:[['Compare scenarios across markets, identify the main uncertainties and explain the trade-offs clearly.', true],['Assume all markets behave in exactly the same way.', false],['Ignore the expansion and discuss only last year’s domestic results.', false]], why:'International work needs comparison, uncertainty management and careful interpretation.'};
  }
  function challengePassed(s=state){
    const c = challengeFor(s);
    return Number.isInteger(s.challengeChoice) && s.challengeId === c.id && Boolean(c.choices[s.challengeChoice] && c.choices[s.challengeChoice][1]);
  }
  function challengeOrder(c){
    // Fixed permutations keep the answer position varied but deterministic on every device.
    const orders = {
      'climate-cat-loss':[1,0,2],
      'pensions-longevity':[2,1,0],
      'insurance-claims-spike':[0,2,1],
      'health-cost-volatility':[1,2,0],
      'banks-capital-stress':[2,0,1],
      'international-multi-market':[1,0,2]
    };
    return orders[c.id] || [0,1,2];
  }

  function normaliseState(raw){
    const s = {...defaultState(), ...(raw || {})};
    s.soundOn = typeof s.soundOn === 'boolean' ? s.soundOn : true;
    s.players = (Number(s.players) === 3 || Number(s.players) === 4) ? Number(s.players) : null;
    const itemCost = (group,id) => optionBy(group,id)?.cost || 0;
    s.client = data.client.some(x=>x.id===s.client) ? s.client : null;
    s.expertise = canonicalIds('expertise', s.expertise);
    s.team = canonicalIds('team', s.team);
    s.tools = canonicalIds('tools', s.tools);
    s.identity = canonicalIds('identity', s.identity);
    s.challengeChoice = Number.isInteger(s.challengeChoice) && s.challengeChoice >= 0 && s.challengeChoice < 3 ? s.challengeChoice : null;
    s.challengeId = typeof s.challengeId === 'string' ? s.challengeId : null;
    s.firmName = typeof s.firmName === 'string' ? s.firmName.slice(0,60) : '';
    s.promise = typeof s.promise === 'string' ? s.promise.slice(0,220) : '';

    // Make the saved wizard state internally sequential, not just visually clamped.
    // Hidden downstream selections from a damaged/legacy save must never reappear later.
    if(!s.client){
      s.expertise = []; s.team = []; s.tools = []; s.identity = [];
      s.challengeChoice = null; s.challengeId = null;
    } else if(s.expertise.length !== 2){
      s.team = []; s.tools = []; s.identity = [];
      s.challengeChoice = null; s.challengeId = null;
    }

    let spentBeforeTools = (s.client ? itemCost('client',s.client) : 0) + s.expertise.reduce((n,id)=>n+itemCost('expertise',id),0) + s.team.reduce((n,id)=>n+itemCost('team',id),0);
    if(s.client && s.expertise.length===2 && (s.team.length !== 2 || 100-spentBeforeTools < 18)){
      s.tools = []; s.identity = [];
      s.challengeChoice = null; s.challengeId = null;
    }

    let total = spentBeforeTools + s.tools.reduce((n,id)=>n+itemCost('tools',id),0);
    if(s.team.length===2 && (s.tools.length !== 2 || total > 100)){
      s.identity = [];
      s.challengeChoice = null; s.challengeId = null;
    }
    if(s.identity.length !== 2){
      s.challengeChoice = null; s.challengeId = null;
    }

    // Challenge answers are only meaningful once the whole firm draft exists.
    if(s.identity.length===2 && s.challengeChoice !== null){
      const currentChallenge = challengeFor(s);
      if(s.challengeId && s.challengeId !== currentChallenge.id){
        s.challengeChoice = null;
        s.challengeId = null;
      } else {
        // Legacy builds stored only the answer index. Attach the deterministic challenge id.
        s.challengeId = currentChallenge.id;
      }
    } else if(s.challengeChoice === null){
      s.challengeId = null;
    }

    spentBeforeTools = (s.client ? itemCost('client',s.client) : 0) + s.expertise.reduce((n,id)=>n+itemCost('expertise',id),0) + s.team.reduce((n,id)=>n+itemCost('team',id),0);
    total = spentBeforeTools + s.tools.reduce((n,id)=>n+itemCost('tools',id),0);

    let maxStage = 1;
    if(s.client){
      maxStage = 2;
      if(s.expertise.length===2){
        maxStage = 3;
        if(s.team.length===2 && 100-spentBeforeTools>=18){
          maxStage = 4;
          if(s.tools.length===2 && total<=100){
            maxStage = 5;
            if(s.identity.length===2){
              maxStage = 7;
              if(challengePassed(s)) maxStage = 8;
            }
          }
        }
      }
    }
    s.stage = Math.min(maxStage, Math.max(1, Math.min(8, Number(s.stage) || 1)));
    return s;
  }
  function save(){
    state.soundOn = soundOn;
    try{ sessionStorage.setItem(KEY, JSON.stringify(state)); }catch(_){}
    renderHud();
  }
  function reset(){
    if(!confirm('Start a completely new firm?')) return;
    try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(_){}
    for(const key of [KEY, ...OLD_KEYS]){
      try{ sessionStorage.removeItem(key); }catch(_){}
    }
    location.reload();
  }
  $('#restartDraft').addEventListener('click', reset);

  function ensureAudioContext(){
    try{
      if(audioCtx && audioCtx.state !== 'closed') return audioCtx;
      audioCtx = null;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if(!Ctx) return null;
      audioCtx = new Ctx();
      return audioCtx;
    }catch(_){ audioCtx = null; return null; }
  }
  function playFx(type){
    if(!soundOn) return;
    try{
      const ctx = ensureAudioContext();
      if(!ctx) return;
      if(ctx.state === 'suspended') ctx.resume().catch(()=>{});
      const patterns = {
      select:[[660,0,.05,.05],[820,.06,.05,.04]],
      success:[[523,0,.07,.06],[659,.08,.07,.05],[784,.16,.09,.04]],
      error:[[220,0,.09,.08],[170,.09,.11,.08]],
      next:[[440,0,.05,.04],[554,.06,.06,.04],[659,.13,.07,.04]],
      copy:[[740,0,.05,.04],[880,.06,.06,.04]],
      alert:[[180,0,.08,.07],[260,.09,.08,.06],[180,.18,.08,.07]],
      fanfare:[[523,0,.08,.05],[659,.07,.08,.05],[784,.14,.11,.05],[1046,.24,.12,.04]]
    };
    const now = ctx.currentTime;
    (patterns[type] || patterns.select).forEach(([freq,delay,duration,vol])=>{
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type='sine'; osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.0001, now+delay);
      gain.gain.exponentialRampToValueAtTime(vol, now+delay+0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now+delay+duration);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now+delay); osc.stop(now+delay+duration+0.02);
      });
    }catch(_){
      // Sound effects are optional: never let an audio restriction break a game choice.
      try{ if(audioCtx && audioCtx.state === 'closed') audioCtx = null; }catch(_){}
    }
  }
  function resolveVoice(){
    const synth = window.speechSynthesis;
    if(!synth) return null;
    const voices = synth.getVoices();
    voice = voices.find(v => /en-GB/i.test(v.lang) || /UK|British/i.test(v.name)) || voices.find(v => /^en/i.test(v.lang)) || null;
    return voice;
  }
  if('speechSynthesis' in window){
    resolveVoice();
    window.speechSynthesis.addEventListener && window.speechSynthesis.addEventListener('voiceschanged', resolveVoice, {once:true});
  }
  function speak(text){
    if(!soundOn){ setFeedback('Sound is off. Turn it on first if you want the audio prompts.', 'warning'); paintFeedback(); return; }
    if(!('speechSynthesis' in window)) { setFeedback('Speech output is unavailable on this browser, but the game still works normally.', 'warning'); paintFeedback(); playFx('error'); return; }
    try{
      const utter = new SpeechSynthesisUtterance(text);
      const selected = resolveVoice();
      if(selected) utter.voice = selected;
      utter.lang = (selected && selected.lang) || 'en-GB';
      utter.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      playFx('select');
    }catch(_){ setFeedback('Audio could not start on this browser.', 'warning'); paintFeedback(); }
  }
  soundBtn.addEventListener('click', ()=>{ soundOn = !soundOn; if(!soundOn){try{window.speechSynthesis&&window.speechSynthesis.cancel();}catch(_){}} updateSound(); save(); if(soundOn)playFx('select'); });
  function updateSound(){
    const speechSupported = 'speechSynthesis' in window;
    if(!speechSupported && !(window.AudioContext || window.webkitAudioContext)){
      soundBtn.textContent = '🔈 Audio unavailable';
      soundBtn.disabled = true;
      soundBtn.setAttribute('aria-disabled','true');
      return;
    }
    soundBtn.disabled = false;
    soundBtn.textContent = soundOn ? '🔊 Sound on' : '🔈 Sound off';
    soundBtn.setAttribute('aria-pressed', String(soundOn));
  }
  updateSound();

  function sumCosts(group){
    const val = state[group];
    if(!val) return 0;
    if(Array.isArray(val)) return val.reduce((n,id)=> n + (optionBy(group,id)?.cost || 0), 0);
    return optionBy(group,val)?.cost || 0;
  }
  function totalSpent(){ return sumCosts('client') + sumCosts('expertise') + sumCosts('team') + sumCosts('tools'); }
  function budgetLeft(){ return 100 - totalSpent(); }
  function spentBeforeTools(){ return sumCosts('client') + sumCosts('expertise') + sumCosts('team'); }
  function budgetBeforeTools(){ return 100 - spentBeforeTools(); }
  function toolWouldBlockCompletion(id){
    if(state.tools.includes(id)) return false;
    const clicked = optionBy('tools', id);
    if(!clicked) return true;
    const available = budgetLeft();
    if(available < clicked.cost) return true;
    const slotsAfter = 2 - (state.tools.length + 1);
    if(slotsAfter <= 0) return false;
    const remainingBudget = available - clicked.cost;
    const otherCosts = data.tools
      .filter(tool => tool.id !== id && !state.tools.includes(tool.id))
      .map(tool => tool.cost)
      .sort((a,b)=>a-b);
    return !otherCosts.length || otherCosts[0] > remainingBudget;
  }
  function selectionCount(){ return (state.players?1:0) + (state.client?1:0) + state.expertise.length + state.team.length + state.tools.length + state.identity.length; }
  function configCode(){
    if(!state.client) return '—';
    const codes = {
      client:{insurance:'INS',pensions:'PEN',banks:'BNK',health:'HLT',climate:'CLM',international:'INT'},
      expertise:{pricing:'PRI',reserving:'RES',pensions:'PEN',risk:'RSK',modelling:'MOD',climate:'CLM'},
      team:{senior:'SEN',junior:'JUN',datasci:'DAT',economist:'ECO',compliance:'CMP',communication:'COM'},
      tools:{traditional:'TRA',scenario:'SCN',ai:'AIA',dashboards:'DSH',stress:'STR',cat:'CAT'},
      identity:{reliable:'REL',innovative:'INN',client:'CLI',specialist:'SPE',international:'INT',agile:'AGL'}
    };
    const part = (group, ids) => [...ids].sort().map(id=>codes[group][id]);
    return [codes.client[state.client], ...part('expertise',state.expertise), ...part('team',state.team), ...part('tools',state.tools), ...part('identity',state.identity)].join('-');
  }
  function outcomeCode(){
    if(!state.client) return '—';
    const c = challengeFor(state);
    return `${configCode()} · ${totalSpent()}PTS · ${c.id.toUpperCase()}`;
  }
  function statusInfo(){
    if(!state.players) return ['Choose team size','status-warning'];
    const left = budgetLeft();
    if(totalSpent()===0) return ['Planning','status-warning'];
    if(left < 0) return ['Over budget','status-bad'];
    if(state.stage < 6) return ['Drafting','status-warning'];
    if(state.stage === 6) return ['Review','status-warning'];
    if(state.stage === 7 && !challengePassed()) return ['Alert pending','status-warning'];
    if(state.stage === 7 && challengePassed()) return ['Alert cleared','status-good'];
    if(state.stage === 8 && !(state.firmName.trim() && state.promise.trim())) return ['Pitch setup','status-warning'];
    return ['Board-ready','status-good'];
  }
  function updateStickyOffset(){
    const topbar = document.querySelector('.topbar');
    const desktopSticky = window.matchMedia('(min-width:901px)').matches;
    const offset = desktopSticky && topbar ? Math.ceil(topbar.getBoundingClientRect().height) + 10 : 0;
    document.documentElement.style.setProperty('--firm-sticky-offset', `${offset}px`);
  }
  const topbarForSticky = document.querySelector('.topbar');
  if(topbarForSticky && 'ResizeObserver' in window){
    try{ new ResizeObserver(()=>updateStickyOffset()).observe(topbarForSticky); }catch(_){}
  }

  function renderHud(){
    const budgetNode=$('#budgetLeft'), spentNode=$('#budgetSpent'), barNode=$('#budgetBar');
    if(!budgetNode || !spentNode || !barNode) return;
    budgetNode.childNodes[0].nodeValue = String(budgetLeft());
    spentNode.textContent = `${totalSpent()} points spent`;
    barNode.style.width = `${Math.min(100, Math.max(0, totalSpent()))}%`;
    const sumPlayers=$('#sumPlayers'); if(sumPlayers) sumPlayers.textContent = state.players ? `${state.players} players` : '—';
    $('#sumClient').textContent = state.client ? optionBy('client',state.client).label : '—';
    $('#sumExpertise').textContent = state.expertise.length ? state.expertise.map(id=>optionBy('expertise',id).label).join(' + ') : '—';
    $('#sumTeam').textContent = state.team.length ? state.team.map(id=>optionBy('team',id).label).join(' + ') : '—';
    $('#sumTools').textContent = state.tools.length ? state.tools.map(id=>optionBy('tools',id).label).join(' + ') : '—';
    $('#sumIdentity').textContent = state.identity.length ? state.identity.map(id=>optionBy('identity',id).label).join(' + ') : '—';
    const configNode = $('#configCode');
    configNode.textContent = `Config code · ${configCode()}`;
    configNode.dataset.outcome = outcomeCode();
    configNode.title = state.client ? `Deterministic outcome: ${outcomeCode()}` : 'Choose a client to generate the deterministic configuration code.';
    $('#selectionsMade').textContent = `${selectionCount()} decisions made`;
    $('#currentStageCard').textContent = state.players ? `Round ${state.stage} / 8` : 'Team setup';
    const [label, cls] = statusInfo();
    const pill = $('#statusPill');
    pill.textContent = label; pill.className = `status-pill ${cls}`;
    const pickerButtons = $$('[data-player-count]');
    pickerButtons.forEach(btn=>{
      const selected = Number(btn.dataset.playerCount) === state.players;
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    const teamFormatSub=$('#teamFormatSub');
    if(teamFormatSub) teamFormatSub.textContent = state.players ? `${state.players} students selected · one device per team recommended` : 'Choose 3 or 4 players before starting';
    dots.forEach((dot, i)=>{
      const round = i + 1;
      const active = Boolean(state.players) && round === state.stage;
      dot.classList.toggle('active', active);
      dot.classList.toggle('done', Boolean(state.players) && round < state.stage);
      if(active) dot.setAttribute('aria-current','step'); else dot.removeAttribute('aria-current');
      dot.setAttribute('aria-label', `Round ${round}${active ? ', current' : state.players && round < state.stage ? ', completed' : ''}`);
    });
    progressFill.style.width = state.players ? `${((state.stage-1)/7)*100}%` : '0%';
  }
  function setPlayers(count, announce=true, focusRound=false){
    const n = Number(count);
    if(n !== 3 && n !== 4) return;
    if(state.players === n){
      if(announce){ setFeedback(`Your student team is already set to ${n} players.`, 'info'); paintFeedback(); }
      renderHud();
      return;
    }
    state.players = n;
    if(announce) setFeedback(`${n}-player team selected. The final Boardroom roles will adapt automatically.`, 'success');
    save();
    playFx('select');
    render();
    requestAnimationFrame(()=>{
      const target = focusRound ? $('#roundTitle') : document.querySelector(`[data-player-count="${n}"]`);
      if(target) try{ target.focus({preventScroll:true}); }catch(_){ try{ target.focus(); }catch(__){} }
    });
  }
  function bindStaticPlayerPicker(){
    $$('[data-player-count]').forEach(btn=>btn.addEventListener('click',()=>setPlayers(btn.dataset.playerCount)));
  }
  function renderPlayerSetup(){
    mount.innerHTML = `<article class="stage-card player-setup-card"><div class="stage-head"><div><p class="round-time">TEAM SETUP</p><h2 id="roundTitle" tabindex="-1">How many students are in your team?</h2><p>Choose your student team size before starting. This does <strong>not</strong> change the 100-point budget or the actuarial outcome — it only adapts the final speaking roles.</p><div class="mini-badges"><span>Choose 3 or 4</span><span>One device per team</span><span>Boardroom roles adapt automatically</span></div></div><div class="stage-head-media"><img src="group-client-meeting-r27.webp" alt="Students working together around an actuarial client brief"></div></div><div class="stage-body"><div class="notice-box"><strong>Start here:</strong> select the number of students in your group. You can change it later without losing your firm choices.</div><div class="player-setup-grid"><button type="button" class="player-setup-choice" data-player-setup="3"><span class="setup-icon" aria-hidden="true">👥</span><strong>3 players</strong><span>The final Boardroom brief will give you three balanced speaking roles.</span></button><button type="button" class="player-setup-choice" data-player-setup="4"><span class="setup-icon" aria-hidden="true">👥👥</span><strong>4 players</strong><span>The final Boardroom brief will give you four separate speaking roles.</span></button></div></div></article>`;
    mount.querySelectorAll('[data-player-setup]').forEach(btn=>btn.addEventListener('click',()=>setPlayers(btn.dataset.playerSetup,true,true)));
    requestAnimationFrame(()=>{ const first=mount.querySelector('[data-player-setup]'); if(first) try{ first.focus({preventScroll:true}); }catch(_){ first.focus(); } });
  }
  function setFeedback(text, type='info'){ feedback = {text, type}; }
  function clearFeedback(){ feedback = {text:'', type:'info'}; }
  function paintFeedback(){
    const box = $('#stageFeedback');
    if(!box) return;
    if(feedback.text){
      box.className = `feedback-box show feedback-${feedback.type}`;
      box.textContent = feedback.text;
    } else {
      box.className = 'feedback-box';
      box.textContent = '';
    }
  }
  function thumbHtml(src, caption){ return `<figure class="stage-thumb"><img src="${src}" alt="${escapeHtml(caption)}"><figcaption>${escapeHtml(caption)}</figcaption></figure>`; }
  function frame(stageNum, inner){
    const meta = stageMeta[stageNum];
    return `<article class="stage-card"><div class="stage-head"><div><p class="round-time">ROUND ${stageNum} OF 8</p><h2 id="roundTitle" tabindex="-1">${meta.title}</h2><p>${meta.subtitle}</p><div class="mini-badges">${meta.badges.map(b=>`<span>${b}</span>`).join('')}</div><div class="head-actions"><button type="button" class="secondary-btn round-speak" data-say="${escapeAttr(meta.audio)}">🔊 Hear this round</button><button type="button" class="secondary-btn" id="teamPromptBtn">💬 Team prompt</button></div></div><div class="stage-head-media"><img src="${meta.img}" alt="Illustration for stage ${stageNum}"></div></div><div class="stage-body"><div class="objective"><div class="icon">${meta.icon}</div><div><strong>Objective</strong><p>${meta.title}</p></div></div><div id="stageFeedback" class="feedback-box" role="status" aria-live="polite"></div><div class="stage-gallery">${meta.gallery.map(([src,cap])=>thumbHtml(src, cap)).join('')}</div>${inner}</div></article>`;
  }
  function cardHtml(group, item, selected, softLocked=false){
    const extra = item.points ? `<ul>${item.points.map(x=>`<li>${x}</li>`).join('')}</ul>` : '';
    const cost = item.cost === undefined || item.cost===0 ? 'FREE' : `${item.cost} pts`;
    return `<button type="button" class="choice-card ${selected?'selected':''} ${softLocked?'soft-locked':''}" data-group="${group}" data-id="${item.id}" aria-pressed="${selected?'true':'false'}"><div class="top"><div class="emoji">${item.icon || '•'}</div><span class="cost-pill">${cost}</span></div><h3>${item.label}</h3><p>${item.blurb || ''}</p>${extra}${item.tag ? `<span class="card-tag">${item.tag}</span>`:''}</button>`;
  }
  function coachPrompt(){
    const prompts = {
      1:'Discuss which client would need the clearest actuarial support and why.',
      2:'Explain why your two expertise areas belong together.',
      3:'Decide which two profiles would make your firm credible from day one.',
      4:'Justify your tool choices in terms of risk analysis and communication.',
      5:'Choose two identity words that you can actually prove later.',
      6:'Name one strength and one weak point before you continue.',
      7:'Choose the response that sounds most evidence-based and realistic.',
      8:'Split the speaking roles so every student has a meaningful part of the final pitch.'
    };
    const text = prompts[state.stage] || 'Discuss your next move as a team.';
    setFeedback(text, 'info'); paintFeedback(); playFx('select');
  }
  function bindRoundHelpers(){
    const sayBtn = $('.round-speak'); if(sayBtn) sayBtn.addEventListener('click', ()=> speak(sayBtn.dataset.say));
    const promptBtn = $('#teamPromptBtn'); if(promptBtn) promptBtn.addEventListener('click', coachPrompt);
  }
  function renderStage1(){
    mount.innerHTML = frame(1, `<div class="notice-box"><strong>Instructions:</strong> Your student team has <strong>${state.players} players</strong>. Discuss every option in English. One device per team is recommended. The same choices always give the same budget and the same next step on every device.</div><div class="option-grid">${data.client.map(item=>cardHtml('client', item, state.client===item.id)).join('')}</div><div class="decision-row"><div class="selection-meter">Choose <strong>1 client</strong> · Current selection: ${state.client ? optionBy('client',state.client).label : 'none yet'}</div><div class="code-badge">Fixed budget · 100 pts</div></div><div class="nav-row"><span></span><button type="button" class="primary-link" id="nextBtn" ${state.client ? '' : 'disabled'}>Lock this client →</button></div>`);
    bindRoundHelpers(); paintFeedback();
    bindChoices('client',1);
    $('#nextBtn').onclick=()=>go(2);
  }
  function renderStage2(){
    mount.innerHTML = frame(2, `<div class="notice-box"><strong>Task:</strong> Choose exactly <strong>2 expertise areas</strong>. They should support the client you selected and help your future firm sound credible.</div><div class="option-grid">${data.expertise.map(item=>cardHtml('expertise', item, state.expertise.includes(item.id), !state.expertise.includes(item.id) && state.expertise.length>=2)).join('')}</div><div class="decision-row"><div class="selection-meter">Choose <strong>2</strong> · Selected: ${state.expertise.length}/2</div><div class="code-badge">Budget left · ${budgetLeft()} pts</div></div><div class="nav-row"><button type="button" class="secondary-btn" id="backBtn">← Back</button><button type="button" class="primary-link" id="nextBtn" ${state.expertise.length===2 ? '' : 'disabled'}>Lock expertise →</button></div>`);
    bindRoundHelpers(); paintFeedback();
    bindChoices('expertise',2); $('#backBtn').onclick=()=>go(1); $('#nextBtn').onclick=()=>go(3);
  }
  function renderStage3(){
    mount.innerHTML = frame(3, `<div class="notice-box"><strong>Task:</strong> Choose exactly <strong>2 team profiles</strong>. Think about technical strength, communication and judgement.</div><div class="option-grid">${data.team.map(item=>cardHtml('team', item, state.team.includes(item.id), !state.team.includes(item.id) && state.team.length>=2)).join('')}</div><div class="decision-row"><div class="selection-meter">Choose <strong>2</strong> · Selected: ${state.team.length}/2</div><div class="code-badge">Before tools · ${budgetBeforeTools()} pts left</div></div>${state.team.length===2 && budgetBeforeTools()<18 ? '<div class="notice-box" style="margin-top:16px"><strong>Budget dead-end:</strong> you need at least 18 points left to buy two tools. Revise your team or earlier choices before continuing.</div>' : ''}<div class="nav-row"><button type="button" class="secondary-btn" id="backBtn">← Back</button><button type="button" class="primary-link" id="nextBtn" ${state.team.length===2 && budgetBeforeTools()>=18 ? '' : 'disabled'}>Lock team →</button></div>`);
    bindRoundHelpers(); paintFeedback();
    bindChoices('team',2); $('#backBtn').onclick=()=>go(2); $('#nextBtn').onclick=()=>go(4);
  }
  function renderStage4(){
    mount.innerHTML = frame(4, `<div class="notice-box"><strong>Task:</strong> Choose exactly <strong>2 tools</strong>. All tools stay visible, but the game blocks a choice if it would make it impossible to afford the two required tools.</div><div class="option-grid">${data.tools.map(item=>{ const selected=state.tools.includes(item.id); const softLocked=!selected && toolWouldBlockCompletion(item.id); return cardHtml('tools', item, selected, softLocked); }).join('')}</div><div class="decision-row"><div class="selection-meter">Choose <strong>2</strong> · Selected: ${state.tools.length}/2</div><div class="code-badge">Live budget · ${budgetLeft()} pts left</div></div><div class="nav-row"><button type="button" class="secondary-btn" id="backBtn">← Back</button><button type="button" class="primary-link" id="nextBtn" ${state.tools.length===2 && budgetLeft()>=0 ? '' : 'disabled'}>Lock tools →</button></div>`);
    bindRoundHelpers(); paintFeedback();
    bindChoices('tools',2); $('#backBtn').onclick=()=>go(3); $('#nextBtn').onclick=()=>go(5);
  }
  function renderStage5(){
    mount.innerHTML = frame(5, `<div class="notice-box"><strong>Task:</strong> Choose exactly <strong>2 identity words</strong>. These cost <strong>0 points</strong>, but they must be visible in your final presentation.</div><div class="option-grid">${data.identity.map(item=>cardHtml('identity', item, state.identity.includes(item.id), !state.identity.includes(item.id) && state.identity.length>=2)).join('')}</div><div class="decision-row"><div class="selection-meter">Choose <strong>2</strong> · Selected: ${state.identity.length}/2</div><div class="code-badge">Budget left · ${budgetLeft()} pts</div></div><div class="nav-row"><button type="button" class="secondary-btn" id="backBtn">← Back</button><button type="button" class="primary-link" id="nextBtn" ${state.identity.length===2 ? '' : 'disabled'}>Review the firm →</button></div>`);
    bindRoundHelpers(); paintFeedback();
    bindChoices('identity',2); $('#backBtn').onclick=()=>go(4); $('#nextBtn').onclick=()=>go(6);
  }
  function insights(){
    const strengths=[], risks=[];
    if(state.identity.includes('client') || state.team.includes('communication')) strengths.push('You are likely to explain actuarial ideas clearly to non-specialists.');
    if(state.expertise.includes('modelling') || state.tools.includes('scenario')) strengths.push('Your firm has a strong analytical backbone.');
    if(state.expertise.includes('climate') && state.client==='climate') strengths.push('Your client and expertise fit each other extremely well.');
    if(state.team.includes('senior')) strengths.push('A senior actuary adds judgement and credibility.');
    if(!state.team.includes('communication') && state.identity.includes('client')) risks.push('You claim to be client-focused, but no communication specialist supports that promise.');
    if(state.client==='climate' && !state.expertise.includes('climate')) risks.push('Climate-risk clients may expect dedicated climate-risk expertise.');
    if(state.client==='pensions' && !state.expertise.includes('pensions')) risks.push('Pension clients may expect pensions expertise very quickly.');
    if(budgetLeft() < 0) risks.push('Your total is above 100 points, so the board will reject the current draft.');
    if(budgetLeft() <= 6 && budgetLeft() >= 0) risks.push('You have almost no spare budget, so the board may see the plan as ambitious or fragile.');
    if(!state.team.includes('compliance')) risks.push('Without compliance support, regulation and governance may become a weak point.');
    return {strengths: strengths.length ? strengths : ['Your choices create a focused firm with a clear offer.'], risks: risks.length ? risks : ['No major weakness stands out at this stage.']};
  }
  function renderStage6(){
    const fit = insights();
    const left = budgetLeft();
    const status = left < 0 ? '<span class="status-pill status-bad">Over budget</span>' : left <= 10 ? '<span class="status-pill status-warning">Tight budget</span>' : '<span class="status-pill status-good">Balanced budget</span>';
    mount.innerHTML = frame(6, `<div class="review-grid"><div class="review-box"><p class="module-number" style="margin:0">WAR-ROOM SUMMARY</p><div style="margin-top:10px">${status}</div><div class="summary-list" style="margin-top:14px"><div><strong>Target client</strong><span>${optionBy('client',state.client).label}</span></div><div><strong>Expertise</strong><span>${state.expertise.map(id=>optionBy('expertise',id).label).join(' + ')}</span></div><div><strong>Team</strong><span>${state.team.map(id=>optionBy('team',id).label).join(' + ')}</span></div><div><strong>Tools</strong><span>${state.tools.map(id=>optionBy('tools',id).label).join(' + ')}</span></div><div><strong>Identity</strong><span>${state.identity.map(id=>optionBy('identity',id).label).join(' + ')}</span></div><div><strong>Total spent</strong><span>${totalSpent()} pts</span></div><div><strong>Budget left</strong><span>${left} pts</span></div></div></div><div class="insight-box"><p class="module-number" style="margin:0">BOARD VIEW</p><h3 style="margin-top:10px;color:#102a43">What already looks strong?</h3><ul>${fit.strengths.map(x=>`<li>${x}</li>`).join('')}</ul><h3 style="margin-top:16px;color:#102a43">What could worry investors?</h3><ul>${fit.risks.map(x=>`<li>${x}</li>`).join('')}</ul></div></div><div class="coach-box" style="margin-top:18px"><h3 style="color:#102a43">Mini speaking checkpoint</h3><p>Before you continue, each student says <strong>one sentence</strong>: a strength, a weak point, a trade-off, or a reason for the client choice. This keeps everyone active before the final pitch.</p></div><div class="nav-row"><button type="button" class="secondary-btn" id="backBtn">← Adjust choices</button><button type="button" class="primary-link" id="nextBtn" ${left >= 0 ? '' : 'disabled'}>Open the client alert →</button></div>`);
    bindRoundHelpers(); paintFeedback();
    $('#backBtn').onclick=()=>go(5); $('#nextBtn').onclick=()=>go(7);
  }
  function challenge(){ return challengeFor(state); }
  function renderStage7(){
    const c = challenge();
    const order = challengeOrder(c);
    const passed = challengePassed();
    const choicesHtml = order.map(i=>{
      const choice = c.choices[i];
      let cls='challenge-choice';
      if(state.challengeChoice===i && choice[1]) cls+=' correct';
      else if(state.challengeChoice===i && !choice[1]) cls+=' wrong';
      return `<button type="button" class="${cls}" data-challenge="${i}" aria-pressed="${state.challengeChoice===i?'true':'false'}">${choice[0]}</button>`;
    }).join('');
    mount.innerHTML = frame(7, `<div class="notice-box"><strong>This alert is deterministic:</strong> it comes from your client + expertise choices. If another group makes the same choices on another device, they receive the same alert, the same answer order and the same correct response.</div><div class="review-box"><p class="module-number" style="margin:0">CLIENT ALERT</p><h3 style="margin-top:10px;color:#102a43">${c.title}</h3><p>${c.intro}</p><div class="challenge-choices">${choicesHtml}</div><p style="margin-top:14px;color:#526b80" id="challengeFeedback">${state.challengeChoice!==null ? (passed ? c.why : 'Not strong enough. Try again before entering the boardroom.') : 'Choose one group response. A good response must sound actuarial, useful and credible.'}</p></div><div class="nav-row"><button type="button" class="secondary-btn" id="backBtn">← Back to review</button><button type="button" class="primary-link" id="nextBtn" ${passed ? '' : 'disabled'}>Prepare the boardroom pitch →</button></div>`);
    bindRoundHelpers(); paintFeedback();
    $('#backBtn').onclick=()=>go(6);
    const challengeButtons = mount.querySelectorAll('[data-challenge]');
    if(passed){
      challengeButtons.forEach(btn=>{ btn.disabled=true; btn.setAttribute('aria-disabled','true'); });
    }
    challengeButtons.forEach(btn => btn.addEventListener('click', ()=>{
      if(lockNav || btn.disabled) return;
      lockNav = true;
      const i = Number(btn.dataset.challenge);
      state.challengeChoice = i; state.challengeId = c.id; save();
      if(c.choices[i][1]){ setFeedback('Strong answer. The boardroom is now unlocked.', 'success'); playFx('success'); }
      else { setFeedback('Not convincing enough yet. Try another response.', 'error'); playFx('error'); }
      renderStage7();
      requestAnimationFrame(()=>{
        const target = challengePassed() ? $('#nextBtn') : mount.querySelector(`[data-challenge="${i}"]`);
        if(target) try{ target.focus({preventScroll:true}); }catch(_){ target.focus(); }
      });
      lockNav = false;
    }));
    $('#nextBtn').onclick=()=>go(8);
  }

  function boardroomRolesHtml(){
    if(state.players === 3){
      return `<div class="student-grid players-3"><div><strong>Student 1 · Who we are</strong><p>Firm name, promise, target client and identity.</p></div><div><strong>Student 2 · What we do</strong><p>Expertise, data, models and tools.</p></div><div><strong>Student 3 · Why trust us?</strong><p>Team, budget trade-offs, client alert response, strengths and weak points.</p></div></div>`;
    }
    return `<div class="student-grid players-4"><div><strong>Student 1 · Who we are</strong><p>Firm name, promise and target client.</p></div><div><strong>Student 2 · What actuaries do</strong><p>Expertise, data, models, uncertainty and risk.</p></div><div><strong>Student 3 · How we built the firm</strong><p>Team, tools, costs and trade-offs.</p></div><div><strong>Student 4 · Why trust us?</strong><p>Identity, client alert response, strengths and weak points.</p></div></div>`;
  }
  function boardroomRolesText(){
    if(state.players === 3){
      return [
        'Student 1: firm name, promise, target client and identity.',
        'Student 2: expertise, data, models and tools.',
        'Student 3: team, budget trade-offs, client alert response, strengths and weak points.'
      ];
    }
    return [
      'Student 1: firm name, promise and target client.',
      'Student 2: expertise, data, models, uncertainty and risk.',
      'Student 3: team, tools, costs and trade-offs.',
      'Student 4: identity, client alert response, strengths and weak points.'
    ];
  }
  function renderBoardroomBrief(){
    const left = budgetLeft();
    const clientLabel = optionBy('client',state.client).label;
    const challengeLabel = challenge().title;
    const box = $('#briefBox');
    if(!box) return;
    const ready = Boolean(state.firmName.trim() && state.promise.trim());
    box.innerHTML = `<p class="module-number" style="margin:0">BOARDROOM BRIEF</p><h3 id="briefFirmName" style="margin-top:10px;color:#102a43">${escapeHtml(state.firmName || 'Your new firm')}</h3><p id="briefPromiseText">${escapeHtml(state.promise || 'Add a one-sentence promise to make the firm sound memorable and client-focused.')}</p><div class="brief-columns"><div><h4 style="color:#102a43">Firm DNA</h4><ul><li><strong>Student team:</strong> ${state.players} players</li><li><strong>Target client:</strong> ${clientLabel}</li><li><strong>Expertise:</strong> ${state.expertise.map(id=>optionBy('expertise',id).label).join(' + ')}</li><li><strong>Team:</strong> ${state.team.map(id=>optionBy('team',id).label).join(' + ')}</li><li><strong>Tools:</strong> ${state.tools.map(id=>optionBy('tools',id).label).join(' + ')}</li><li><strong>Identity:</strong> ${state.identity.map(id=>optionBy('identity',id).label).join(' + ')}</li><li><strong>Budget:</strong> ${totalSpent()} / 100 points (${left} left)</li><li><strong>Config code:</strong> ${configCode()}</li><li><strong>Outcome code:</strong> ${outcomeCode()}</li></ul></div><div><h4 style="color:#102a43">How to defend the firm</h4><ul><li>Explain why this client needs actuarial support.</li><li>Show how your expertise and tools help you understand risk and uncertainty.</li><li>Justify your budget choices and trade-offs.</li><li>Summarise your response to the <strong>${challengeLabel}</strong>.</li><li>Use at least one strength and one weak point from the review.</li></ul></div></div>${boardroomRolesHtml()}${ready ? `<div class="finish-banner"><strong>Boardroom access unlocked</strong><span>Your ${state.players}-player speaking plan is ready. Every student has a distinct active role.</span></div>` : `<div class="notice-box" style="margin-top:18px"><strong>One last step:</strong> add a firm name and a one-sentence promise to unlock the final boardroom brief.</div>`}`;
    const copyBtn = $('#copyBtn');
    if(copyBtn) copyBtn.disabled = !ready;
  }
  function renderStage8(){
    mount.innerHTML = frame(8, `<div class="notice-box"><strong>Final task:</strong> name your firm, give it a one-sentence promise, then use the generated brief to prepare your oral presentation. <strong>Your ${state.players}-player team will get ${state.players} speaking roles below.</strong></div><div class="brief-grid"><label class="input-box">Firm name<input id="firmName" class="text-input" type="text" maxlength="60" placeholder="e.g. Northbridge Actuarial" value="${escapeAttr(state.firmName)}"></label><label class="input-box">One-sentence promise<textarea id="firmPromise" class="text-area" maxlength="220" placeholder="We help organisations understand uncertainty and make clear, evidence-based decisions.">${escapeHtml(state.promise)}</textarea></label></div><div class="firm-brief" id="briefBox"></div><div class="boardroom-nav"><button type="button" class="secondary-btn" id="backBtn">← Revise firm choices</button><button type="button" class="secondary-btn" id="copyBtn" disabled>Copy our firm brief</button><button type="button" class="secondary-btn" id="restartBtn">Start a new firm</button></div>`);
    bindRoundHelpers(); paintFeedback();
    const nameInput = $('#firmName');
    const promiseInput = $('#firmPromise');
    const refresh = ()=>{ state.firmName = nameInput.value.slice(0,60); state.promise = promiseInput.value.slice(0,220); save(); renderBoardroomBrief(); };
    nameInput.addEventListener('input', refresh);
    promiseInput.addEventListener('input', refresh);
    $('#backBtn').onclick = ()=>go(6);
    $('#copyBtn').onclick = copyBrief;
    $('#restartBtn').onclick = reset;
    renderBoardroomBrief();
  }
  function copyBrief(){
    if(!(state.firmName.trim() && state.promise.trim())){ setFeedback('Add a firm name and a promise before copying the boardroom brief.', 'warning'); paintFeedback(); playFx('error'); return; }
    const text = [
      `Firm name: ${state.firmName || 'Your new firm'}`,
      `Promise: ${state.promise || ''}`,
      `Student team size: ${state.players} players`,
      `Target client: ${optionBy('client',state.client).label}`,
      `Expertise: ${state.expertise.map(id=>optionBy('expertise',id).label).join(' + ')}`,
      `Team: ${state.team.map(id=>optionBy('team',id).label).join(' + ')}`,
      `Tools: ${state.tools.map(id=>optionBy('tools',id).label).join(' + ')}`,
      `Identity: ${state.identity.map(id=>optionBy('identity',id).label).join(' + ')}`,
      `Budget: ${totalSpent()} / 100 points (${budgetLeft()} left)`,
      `Config code: ${configCode()}`,
      `Outcome code: ${outcomeCode()}`,
      `Client alert: ${challenge().title}`,
      '',
      'Presentation roles:',
      ...boardroomRolesText().map(role=>`- ${role}`)
    ].join('\n');
    const copied = () => { setFeedback('Your firm brief has been copied.', 'success'); paintFeedback(); playFx('copy'); const btn=$('#copyBtn'); if(btn){ const old=btn.textContent; btn.textContent='✓ Copied'; setTimeout(()=>{ if(document.body.contains(btn)) btn.textContent=old; },1200); } };
    const fallback = () => {
      const previous = document.activeElement;
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly','');
      ta.setAttribute('aria-hidden','true');
      ta.style.position='fixed'; ta.style.left='-9999px'; ta.style.top='0'; ta.style.opacity='0';
      document.body.appendChild(ta);
      try{
        ta.focus({preventScroll:true});
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand('copy');
        if(ok) copied();
        else { setFeedback('Copy failed. Select the boardroom brief and copy it manually.', 'warning'); paintFeedback(); playFx('error'); }
      }catch(_){
        setFeedback('Copy failed. Select the boardroom brief and copy it manually.', 'warning'); paintFeedback(); playFx('error');
      }finally{
        ta.remove();
        if(previous && typeof previous.focus === 'function') requestAnimationFrame(()=>{ try{ previous.focus({preventScroll:true}); }catch(_){ try{ previous.focus(); }catch(__){} } });
      }
    };
    if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(copied).catch(fallback); else fallback();
  }
  function invalidateDownstream(group){
    const order = ['client','expertise','team','tools','identity'];
    const idx = order.indexOf(group);
    if(idx < 0) return;
    for(const downstream of order.slice(idx + 1)) state[downstream] = [];
    state.challengeChoice = null;
    state.challengeId = null;
  }

  function restoreChoiceFocus(group,id){
    requestAnimationFrame(()=>{
      const target = mount.querySelector(`[data-group="${group}"][data-id="${id}"]`);
      if(target) try{ target.focus({preventScroll:true}); }catch(_){ target.focus(); }
    });
  }
  function bindChoices(group, limit){
    mount.querySelectorAll(`[data-group="${group}"]`).forEach(btn => btn.addEventListener('click', ()=>toggleChoice(group, btn.dataset.id, limit)));
  }
  function toggleChoice(group, id, limit){
    const clicked = optionBy(group,id);
    if(!clicked) return;
    const now = (window.performance && performance.now) ? performance.now() : Date.now();
    const clickKey = `${group}:${id}`;
    if(clickKey === lastChoiceKey && now - lastChoiceAt < 280) return;
    lastChoiceKey = clickKey;
    lastChoiceAt = now;

    if(group==='client'){
      if(state.client !== id){
        invalidateDownstream('client');
        state.client = id;
        setFeedback(`Client selected: ${clicked.label}. Later-round choices were cleared because the client changed.`, 'success');
      } else {
        setFeedback(`${clicked.label} is already your target client.`, 'info');
      }
      playFx('select');
      save(); renderStage1(); restoreChoiceFocus('client', id); return;
    }

    const arr = state[group];
    const idx = arr.indexOf(id);
    let changed = false;
    if(idx >= 0){
      invalidateDownstream(group);
      arr.splice(idx,1);
      changed = true;
      setFeedback(`${clicked.label} removed. Later-round choices were cleared so the draft stays consistent.`, 'info');
      playFx('select');
    }
    else if(arr.length >= limit){
      setFeedback(`You already chose ${limit}. Remove one option first.`, 'warning');
      playFx('error');
    }
    else if(group==='tools' && toolWouldBlockCompletion(id)){
      const rawUnaffordable = budgetLeft() < (clicked.cost || 0);
      setFeedback(rawUnaffordable ? 'Not enough budget for this tool. Choose a cheaper option or revise earlier choices.' : 'That tool would leave too little budget for your second required tool. Choose a cheaper first tool or revise earlier choices.', 'warning');
      playFx('error');
    }
    else {
      invalidateDownstream(group);
      arr.push(id);
      changed = true;
      setFeedback(`${clicked.label} added to the draft.`, 'success');
      playFx('select');
    }
    if(changed) state[group] = canonicalIds(group, arr);
    save(); render();
    restoreChoiceFocus(group, id);
  }
  function canEnter(stage){
    if(!state.players) return false;
    if(stage===2) return !!state.client;
    if(stage===3) return state.expertise.length===2;
    if(stage===4) return state.team.length===2 && budgetBeforeTools()>=18;
    if(stage===5) return state.tools.length===2 && budgetLeft()>=0;
    if(stage===6) return state.identity.length===2;
    if(stage===7) return state.identity.length===2 && budgetLeft() >= 0;
    if(stage===8) return challengePassed();
    return true;
  }
  function go(stage){
    if(stage === state.stage) return;
    if(!canEnter(stage)){
      setFeedback('Complete the current requirements before moving to that round.', 'warning');
      paintFeedback();
      playFx('error');
      return;
    }
    clearFeedback();
    state.stage = stage;
    save();
    render();
    playFx(stage===7 ? 'alert' : stage===8 ? 'fanfare' : 'next');
    const target=document.querySelector('.progress-panel');
    if(target){ try{ target.scrollIntoView({behavior:'smooth',block:'start'}); }catch(_){ try{ target.scrollIntoView(); }catch(__){} } }
    requestAnimationFrame(()=>{
      const heading=$('#roundTitle');
      if(heading) try{ heading.focus({preventScroll:true}); }catch(_){ heading.focus(); }
    });
  }

  function keepActiveProgressVisible(){
    const list=$('#progressDots'); const active=$('#progressDots li.active');
    if(!list||!active||!window.matchMedia('(max-width:1100px)').matches)return;
    const target=active.offsetLeft-(list.clientWidth-active.offsetWidth)/2;
    const left=Math.max(0,target);
    try{ if(typeof list.scrollTo === 'function') list.scrollTo({left,behavior:'auto'}); else list.scrollLeft=left; }
    catch(_){ list.scrollLeft=left; }
  }
  window.addEventListener('resize',()=>requestAnimationFrame(()=>{ updateStickyOffset(); keepActiveProgressVisible(); }),{passive:true});

  function render(){
    renderHud();
    if(!state.players){
      renderPlayerSetup();
      save();
      return;
    }
    switch(state.stage){
      case 1: renderStage1(); break;
      case 2: renderStage2(); break;
      case 3: renderStage3(); break;
      case 4: renderStage4(); break;
      case 5: renderStage5(); break;
      case 6: renderStage6(); break;
      case 7: renderStage7(); break;
      default: renderStage8();
    }
    save();
    requestAnimationFrame(keepActiveProgressVisible);
  }
  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function escapeAttr(s){ return escapeHtml(s).replace(/`/g,'&#96;'); }
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden){ try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(_){} } });
  window.addEventListener('pagehide', ()=>{
    try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(_){}
    try{ audioCtx && audioCtx.close && audioCtx.close(); }catch(_){}
    audioCtx = null;
  });
  window.addEventListener('pageshow', event=>{
    if(event.persisted){ audioCtx = null; updateSound(); requestAnimationFrame(()=>{ updateStickyOffset(); keepActiveProgressVisible(); }); }
  });
  $$('.speak').forEach(btn => btn.addEventListener('click', ()=> speak(btn.dataset.say)));
  bindStaticPlayerPicker();
  updateStickyOffset();
  render();
})();
