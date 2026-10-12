const { chromium, webkit }=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');
async function test(engine,viewport){
const browser=await engine.launch();const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',x=>errors.push(x.message));
try{
 await page.goto('file://'+path.resolve('writing.html'));
 assert.equal(await page.locator('#pathLevels button').count(),4,'four progressive writing levels');
 for(let level=0;level<4;level++){
  await page.locator('#pathLevels button').nth(level).click();
  assert.equal(await page.locator('#pathPractice fieldset').count(),7);
  await page.locator('#pathCheck').click();
  assert.match(await page.locator('#pathResult').innerText(),/Choose an answer/);
  for(let q=0;q<7;q++)await page.locator('input[name="pathq'+q+'"]').first().check();
  await page.locator('#pathCheck').click();
  assert.equal(await page.locator('.path-explanation:not([hidden])').count(),7);
 }
 await page.locator('#pathLevels button').first().click();
 for(let q=0;q<7;q++)await page.locator('input[name="pathq'+q+'"]').first().check();
 await page.locator('#pathCheck').click();
 assert.equal(await page.locator('.path-explanation:not([hidden])').count(),7);
 await page.locator('input[name="pathq0"]').nth(1).check();
 assert.equal(await page.locator('.path-explanation:not([hidden])').count(),6,'CEFR feedback must reset after changed answer');
 assert.equal(await page.locator('#builderNavigation button').count(),4);
 for(let stage=0;stage<4;stage++){
  await page.locator('#builderNavigation button').nth(stage).click();
  await page.locator('#builderCheck').click();
  assert.match(await page.locator('#builderFeedback').innerText(),/select an option/);
  await page.locator('input[name="builderChoice"]').first().check();
  await page.locator('#builderCheck').click();
  assert.match(await page.locator('#builderFeedback').innerText(),/Correct|Try again/);
  await page.locator('#builderDraft').fill('Sentence written for stage '+stage+'.');
 }
 await page.reload();
 await page.locator('#builderNavigation button').nth(3).click();
 assert.match(await page.locator('#builderDraft').inputValue(),/stage 3/);
 await page.locator('#builderNavigation button').nth(0).click();
 assert.match(await page.locator('#builderDraft').inputValue(),/stage 0/);
 assert.equal(await page.locator('#studioNav button').count(),6);
 for(let n=0;n<5;n++){
   await page.locator('#studioNav button').nth(n).click();
   assert.equal(await page.locator('#studioContent fieldset').count(),3);
   for(let q=0;q<3;q++)await page.locator('#studioContent fieldset').nth(q).locator('input').first().check();
   await page.locator('#studioContent button').last().click();
   assert.equal(await page.locator('#studioContent .studio-feedback:not([hidden])').count(),3);
 }
 // Feedback must be cleared when a checked answer is changed.
 await page.locator('#studioNav button').nth(0).click();
 for(let q=0;q<3;q++)await page.locator('#studioContent fieldset').nth(q).locator('input').first().check();
 await page.locator('#studioContent button').last().click();
 assert.equal(await page.locator('#studioContent .studio-feedback:not([hidden])').count(),3);
 await page.locator('#studioContent fieldset').first().locator('input').nth(1).check();
 assert.equal(await page.locator('#studioContent .studio-feedback:not([hidden])').count(),2,'stale feedback not hidden');
 await page.locator('#studioNav button').nth(5).click();
 await page.locator('#studioContent details').evaluate(el=>el.open=true);
 assert.equal(await page.locator('#studioContent details').evaluate(el=>el.open),false,'model accessible before writing');
 await page.locator('#studioContent textarea').fill('A practice text preserved across sessions.');
 await page.locator('#studioContent details').evaluate(el=>el.open=true);
 assert.equal(await page.locator('#studioContent details').evaluate(el=>el.open),true,'model not accessible after writing');
 await page.reload();
 await page.locator('#studioNav button').nth(5).click();
 assert.match(await page.locator('#studioContent textarea').inputValue(),/preserved across sessions/);
 assert.equal(await page.locator('#criterionSelect option').count(),5);
 assert.equal(await page.locator('.cefr-levels > div').count(),4,'four CEFR level descriptions expected');
 assert.deepEqual(await page.locator('.cefr-levels strong').allTextContents(),['A2 · Building sentences','B1 · Connecting ideas','B2 · Developing an argument','C1 · Refining your position']);
 assert.equal(await page.locator('#draft').isVisible(),true);
 assert.equal(await page.locator('#introDraft').isVisible(),true);
 for(let i=0;i<5;i++){await page.locator('#criterionSelect').selectOption(String(i));assert.equal(await page.locator('#criterionExercises fieldset').count(),3);
 for(let q=0;q<3;q++){await page.locator('input[name="criteria-'+q+'"]').first().check()}
 await page.locator('#criterionCheck').click();assert.equal(await page.locator('.criterion-feedback:not([hidden])').count(),3)}
 await page.locator('#criterionSelect').selectOption('0');
 for(let q=0;q<3;q++)await page.locator('input[name="criteria-'+q+'"]').first().check();
 await page.locator('#criterionCheck').click();
 assert.equal(await page.locator('.criterion-feedback:not([hidden])').count(),3);
 await page.locator('input[name="criteria-0"]').nth(1).check();
 assert.equal(await page.locator('.criterion-feedback:not([hidden])').count(),2,'rubric feedback must reset after changed answer');
 assert.equal(await page.locator('#mission option').count(),6);
 await page.locator('#introDraft').fill('A practice paragraph that will be saved safely on this device.');
 await page.reload();assert.match(await page.locator('#introDraft').inputValue(),/saved safely/);
 await page.locator('#mission').selectOption('2');await page.locator('#draft').fill('Dear team, could you please share the figures?');await page.reload();await page.locator('#mission').selectOption('2');assert.match(await page.locator('#draft').inputValue(),/share the figures/);
 assert.deepEqual(errors,[]);
 const overflow=await page.evaluate(()=>{const sc=document.scrollingElement;const initial=sc.scrollLeft;sc.scrollLeft=1000;const shifted=Math.abs(sc.scrollLeft-initial);sc.scrollLeft=initial;return shifted});assert.ok(overflow<=2,'Actual horizontal scrolling: '+overflow);
 console.log('PASS writing '+engine.name()+' '+viewport.width+'px');
}finally{await browser.close()}}
(async()=>{await test(chromium,{width:1280,height:800});await test(chromium,{width:390,height:844});await test(webkit,{width:390,height:844});await test(chromium,{width:320,height:640});await test(webkit,{width:320,height:640})})().catch(e=>{console.error(e);process.exitCode=1});