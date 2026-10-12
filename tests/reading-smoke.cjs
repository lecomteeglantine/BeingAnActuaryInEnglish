const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({headless:true});
  const test = async (viewport) => {
    const context = await browser.newContext({viewport});
    const page = await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('file://' + path.resolve('reading.html'));
    await page.locator('#diagnosticQuestions input').first().check();
    await page.locator('#diagnosticCheck').click();
    await page.locator('#diagnosticResult').getByText('Diagnostic:').waitFor();
    await page.locator('#rmModuleSelect').selectOption('3');
    assert.equal(await page.locator('#module-4').isVisible(),true);
    await page.locator('#readShowExam').click();
    await page.locator('#challenge').selectOption('1');
    await page.locator('input[name=f0]').first().check();
    await page.locator('#answerStatus').getByText('1/18').waitFor();
    await page.reload();
    await page.locator('#readShowExam').click();
    assert.equal(await page.locator('input[name=f0]').first().isChecked(),true,'draft was not restored');
    await page.locator('#submitRead').click();
    await page.locator('#results').getByText('Result:').waitFor();
    assert.match(await page.locator('#results').innerText(), /\d+\/20/);
    await page.locator('#mode').selectOption('exam');
    assert.equal(await page.locator('#challenge option').count(),3);
    await page.locator('input[name=f0]').first().check();
    const before=await page.locator('#readTimer').innerText();
    await page.reload();
    await page.locator('#readShowExam').click();
    assert.equal(await page.locator('#mode').inputValue(),'exam');
    assert.equal(await page.locator('input[name=f0]').first().isChecked(),true);
    assert.equal(await page.locator('#challenge option').count(),3);
    if(viewport.width<=800){
      await page.locator('#viewQuestions').click();
      assert.equal(await page.locator('.read-questions').isVisible(),true);
      await page.locator('#viewText').click();
      assert.equal(await page.locator('.read-article').isVisible(),true);
    }
    // Check every section's scoring against the embedded answer key.
    await page.locator('#mode').selectOption('practice');
    await page.locator('#challenge').selectOption('0');
    if(viewport.width<=800) await page.locator('#viewQuestions').click();
    const key = await page.evaluate(() => {
      const source=[...document.scripts].map(s=>s.textContent).find(s=>s.includes('const DATA='));
      const match=source.match(/const DATA=(\[[\s\S]*?\]);\s*const \$=/);
      return JSON.parse(match[1])[0];
    });
    await page.evaluate(t=>{
      const choose=(name,value,multi=false)=>{
        const input=[...document.querySelectorAll('input[name="'+name+'"]')].find(x=>x.value===String(value));
        if(!input)throw new Error('Missing '+name+' value '+value);
        input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));
      };
      t.facts.forEach((q,i)=>choose('f'+i,q[2]));
      t.tf.forEach((q,i)=>{
        choose('t'+i,q[1]?0:1);
        const select=document.querySelector('#p'+i);select.value=String(q[2]);select.dispatchEvent(new Event('change',{bubbles:true}));
      });
      t.expr.forEach((q,i)=>{
        const choices=[q[1],...t.expr.filter((_,j)=>j!==i).map(x=>x[1]),t.vocab[i][0]].sort((a,b)=>a.localeCompare(b));
        choose('e'+i,choices.indexOf(q[1]));
      });
      t.vocab.forEach((q,i)=>choose('v'+i,q[2]));
      t.critical.forEach((q,i)=>q[2].forEach(v=>choose('c'+i,v,true)));
    },key);
    await page.locator('#submitRead').click();
    assert.match(await page.locator('#results').innerText(),/Result: 20\/20/,'perfect score');

    // Test partial inference credit: one correct and one wrong option = 1 / 2.
    await page.locator('#restartRead').click();
    await page.evaluate(t=>{
      const choose=(name,value)=>{
        const el=[...document.querySelectorAll('input[name="'+name+'"]')].find(x=>x.value===String(value));
        el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));
      };
      const correct=t.critical[0][2][0];
      const wrong=[0,1,2,3].find(n=>!t.critical[0][2].includes(n));
      choose('c0',correct);choose('c0',wrong);
    },key);
    await page.locator('#submitRead').click();
    assert.match(await page.locator('#readQuestions [data-q="c0"] .read-feedback-slot').innerText(),/1\/2 points/);

    // An expired 45-minute exam must be submitted after reload.
    await page.locator('#mode').selectOption('exam');
    const examIndex=await page.locator('#challenge').inputValue();
    await page.evaluate(index=>{
      const key='actuarial-reading-exam-clock-v1';
      const v=JSON.parse(localStorage.getItem(key)||'{}');
      v[index]=Date.now()-46*60*1000;
      localStorage.setItem(key,JSON.stringify(v));
    },examIndex);
    await page.reload();
    if(viewport.width<=800) await page.locator('#readShowExam').click();
    assert.match(await page.locator('#results').innerText(),/Result: \d+\/20/,'expired exam was not submitted');
    assert.equal(await page.locator('#submitRead').isDisabled(),true,'exam still editable');

    assert.deepEqual(errors,[], 'uncaught browser errors');
    await context.close();
    console.log('PASS '+viewport.width+'x'+viewport.height+'; timer '+before);
  };
  try {await test({width:1366,height:768}); await test({width:390,height:844});}
  finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});