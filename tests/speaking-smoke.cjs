'use strict';
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = 'file://' + path.resolve('.');
const pageUrl = name => root + '/' + name;

async function navCheck(page, file) {
  await page.goto(pageUrl(file));
  await page.waitForLoadState('domcontentloaded');
  const found = await page.locator('.main-nav a').evaluateAll(anchors =>
    anchors.map(a => ({ href: a.getAttribute('href'), name: a.textContent.trim() })));
  const skills = ['reading.html', 'writing.html', 'listening.html', 'speaking.html'];
  const positions = skills.map(href => found.findIndex(x => x.href === href));
  assert(positions.every(p => p >= 0), file + ': one or more skills are absent');
  assert(positions.every((p, i) => i === 0 || p === positions[i - 1] + 1), file + ': skills must be together and ordered');
  assert(skills.every(href => found.filter(x => x.href === href).length === 1), file + ': duplicate skill links');
}

async function contentChecks(browserType, viewport) {
  const browser = await browserType.launch({headless: true});
  const context = await browser.newContext({viewport});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    for (const file of ['index.html', 'm1.html', 'm2.html', 'privacy.html', 'pronunciation.html', 'speaking.html']) {
      await navCheck(page, file);
    }
    await page.goto(pageUrl('index.html'));
    assert.equal(await page.locator('a.portal-card[href="speaking.html"]').count(), 1, 'missing Speaking card');
    for (const href of ['reading.html','writing.html','listening.html','speaking.html']) {
      assert.equal(await page.locator('a.portal-card[href="' + href + '"]').count(), 1, 'missing card '+href);
    }
    assert.equal(await page.locator('.portal-card').count(), 11, 'wrong homepage card count');

    await page.goto(pageUrl('speaking.html'));
    assert.equal(await page.locator('.speaking-choice').count(), 6, 'wrong category count');
    assert.equal(await page.locator('#speakingCounter').innerText(), 'SITUATION 1 OF 3');
    assert.equal(await page.locator('#speakingPhrases li').count(), 4);
    const packs = ['smalltalk','meeting','explain','data','recommend','unexpected'];
    for (const pack of packs) {
      const chosen = page.locator('[data-pack="' + pack + '"]');
      await chosen.click();
      assert.equal(await chosen.getAttribute('aria-pressed'), 'true', pack + ' selected state');
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'speakingTitle', pack + ' heading keyboard focus');
      assert.equal(await page.locator('#speakingCounter').innerText(), 'SITUATION 1 OF 3', pack + ' reset counter');
      assert.equal(await page.locator('#speakingPhrases li').count(), 4, pack + ' phrase bank');
      const observed = new Set();
      for (let i = 0; i < 3; i++) {
        const prompt = await page.locator('#speakingPrompt').innerText();
        const sample = await page.locator('#speakingExample').textContent();
        assert(prompt.length > 50, pack + ': prompt too short');
        assert(sample.length > 60, pack + ': example too short');
        assert(!observed.has(prompt), pack + ': repeated scenario');
        observed.add(prompt);
        if (pack === 'data') {
          assert(await page.locator('#speakingChart').isVisible(), 'chart hidden');
          assert.equal(await page.locator('#speakingChart tbody tr').count(), 3, 'missing chart values');
          const values=await page.locator('#speakingChart tbody td').allInnerTexts();
          assert(values.every(v => v.trim().length > 1), 'missing accessible chart data');
        } else {
          assert.equal(await page.locator('#speakingChart').isVisible(), false, pack + ': old chart persists');
        }
        await page.locator('#speakingSupport').selectOption('stretch');
        assert((await page.locator('#speakingSupportText').innerText()).length > 30, 'stretch missing');
        await page.locator('#speakingSupport').selectOption('free');
        assert.match(await page.locator('#speakingSupportText').innerText(), /Speak naturally/);
        await page.locator('#speakingSupport').selectOption('guided');
        await page.locator('#speakingPhraseDetails summary').click();
        assert.equal(await page.locator('#speakingPhraseDetails').getAttribute('open'), '', 'phrases not expanded');
        await page.locator('#speakingExampleDetails summary').click();
        assert.equal(await page.locator('#speakingExampleDetails').getAttribute('open'), '', 'example not expanded');
        await page.locator('.speaking-reflect').first().check();
        await page.locator('#speakingReplay').click();
        await page.locator('#speakingNext').click();
        assert.equal(await page.locator('#speakingPhraseDetails').getAttribute('open'), null, 'phrases should reset');
        assert.equal(await page.locator('#speakingExampleDetails').getAttribute('open'), null, 'example should reset');
        assert.equal(await page.locator('.speaking-reflect').first().isChecked(), false, 'checklist should reset');
      }
      assert.equal(await page.locator('#speakingCounter').innerText(), 'SITUATION 1 OF 3', pack + ': wrap-around');
    }
    // Catch clipped navigation/cards at ordinary desktop and mobile widths.
    const geometry = await page.evaluate(() => ({
      screen: innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }));
    assert(geometry.document <= geometry.screen + 2 && geometry.body <= geometry.screen + 2,
      browserType.name() + '/' + viewport.width + ': horizontal overflow ' + JSON.stringify(geometry));
    assert.deepEqual(errors, [], 'uncaught browser errors');
    console.log('PASS ' + browserType.name() + ' ' + viewport.width + 'x' + viewport.height +
      ': 18 prompts, support levels, chart data, reset states, navigation, layout');
  } finally { await context.close(); await browser.close(); }
}

function fakeMicrophone({grant=true, delayed=false}={}) {
  // This runs inside Playwright before the page scripts.
  window.__stoppedTracks = 0;
  const makeStream = () => ({getTracks: () => [{stop() {window.__stoppedTracks++}}]});
  const getUserMedia = () => {
    if (!grant) return Promise.reject(new DOMException('Permission denied','NotAllowedError'));
    if (delayed) return new Promise(resolve => {window.__resolveMic = () => resolve(makeStream());});
    return Promise.resolve(makeStream());
  };
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia}});
  class FakeMediaRecorder extends EventTarget {
    constructor(stream, opts) {
      super();
      this.stream=stream;
      this.mimeType=opts?.mimeType||'audio/webm';
      this.state='inactive';
    }
    static isTypeSupported() {return true;}
    start() {this.state='recording';}
    stop() {
      if (this.state==='inactive') throw new Error('Recorder already stopped');
      this.state='inactive';
      this.dispatchEvent(new MessageEvent('dataavailable',{data:new Blob(['test audio'],{type:this.mimeType})}));
      this.dispatchEvent(new Event('stop'));
    }
  }
  Object.defineProperty(window,'MediaRecorder',{configurable:true,value:FakeMediaRecorder});
}
async function microphoneChecks() {
  const browser=await chromium.launch({headless:true});
  try {
    const context=await browser.newContext();
    await context.addInitScript(fakeMicrophone, {grant:true, delayed:false});
    const page=await context.newPage(), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pageUrl('speaking.html'));
    await page.locator('#speakingRecord').click();
    await page.waitForFunction(() => document.getElementById('speakingRecordStatus').textContent.includes('Recording…'));
    assert.equal(await page.locator('#speakingStop').isDisabled(),false,'stop button disabled during recording');
    await page.locator('#speakingStop').click();
    await page.waitForFunction(() => document.getElementById('speakingRecordStatus').textContent.includes('Recording ready'));
    assert.equal(await page.locator('#speakingAudio').isVisible(),true,'audio replay missing');
    const src=await page.locator('#speakingAudio').getAttribute('src');
    assert(src.startsWith('blob:'),'audio should stay in local blob URL');
    await page.locator('[data-pack="meeting"]').click();
    assert.equal(await page.locator('#speakingAudio').isVisible(),false,'previous audio leaked into next activity');
    assert((await page.evaluate(() => window.__stoppedTracks))>=1,'microphone not released');
    await page.locator('#speakingRecord').click();
    await page.waitForFunction(() => document.getElementById('speakingRecordStatus').textContent.includes('Recording…'));
    await page.locator('#speakingNext').click();
    assert.equal(await page.locator('#speakingStop').isDisabled(),true,'recording not cancelled on next situation');
    assert((await page.evaluate(() => window.__stoppedTracks))>=2,'stream not released on next situation');
    assert.deepEqual(errors,[],'microphone browser errors');
    await context.close();
    console.log('PASS microphone: record, stop, local replay, release, activity change');

    const denied=await browser.newContext();
    await denied.addInitScript(fakeMicrophone,{grant:false, delayed:false});
    const pageDenied=await denied.newPage();
    const errs=[];pageDenied.on('pageerror',e=>errs.push(e.message));
    await pageDenied.goto(pageUrl('speaking.html'));
    await pageDenied.locator('#speakingRecord').click();
    await pageDenied.waitForFunction(() => document.querySelector('#speakingRecordStatus').textContent.includes('declined'));
    assert.equal(await pageDenied.locator('#speakingRecord').isDisabled(),false,'record button locked after denial');
    assert.deepEqual(errs,[],'permission denied should not throw');
    await denied.close();
    console.log('PASS microphone: permission denial');

    const pending=await browser.newContext();
    await pending.addInitScript(fakeMicrophone,{grant:true, delayed:true});
    const pagePending=await pending.newPage();
    await pagePending.goto(pageUrl('speaking.html'));
    await pagePending.locator('#speakingRecord').click();
    await pagePending.waitForFunction(() => typeof window.__resolveMic==='function');
    await pagePending.locator('[data-pack="data"]').click();
    await pagePending.evaluate(() => window.__resolveMic());
    await pagePending.waitForFunction(() => window.__stoppedTracks>0);
    assert.equal(await pagePending.locator('#speakingStop').isDisabled(),true,'late permission opened recorder');
    assert.equal(await pagePending.locator('#speakingAudio').isVisible(),false);
    await pending.close();
    console.log('PASS microphone: delayed permission after activity change');
  } finally {await browser.close();}
}

(async()=>{
  try{
    await contentChecks(chromium,{width:1366,height:768});
    await contentChecks(chromium,{width:390,height:844});
    await contentChecks(webkit,{width:390,height:844});
    await microphoneChecks();
    console.log('SPEAKING STUDIO AUDIT: ALL CHECKS PASSED');
  }catch(e){console.error('SPEAKING STUDIO AUDIT FAILED:',e);process.exitCode=1;}
})();
