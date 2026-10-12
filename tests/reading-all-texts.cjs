const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

async function run(browserType, width, height) {
  const browser = await browserType.launch({headless:true});
  const context = await browser.newContext({viewport:{width,height}});
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  try {
    await page.goto('file://'+path.resolve('reading.html'));
    const texts=await page.evaluate(()=>{
      const code=[...document.scripts].map(s=>s.textContent).find(s=>s.includes('const DATA='));
      const start=code.indexOf('const DATA=')+11;
      const end=code.indexOf(';\nconst $=',start);
      return JSON.parse(code.slice(start,end));
    });
    assert.equal(texts.length,11,'expected eight challenges and three mock exams');
    await page.locator('#readShowExam').click();
    let checked=0;
    for(let index=0;index<texts.length;index++){
      await page.locator('#mode').selectOption(index<8?'practice':'exam');
      await page.locator('#challenge').selectOption(String(index));
      const t=texts[index];
      await page.evaluate(data=>{
        const choose=(name,value)=>{
          const input=[...document.querySelectorAll('input[name="'+name+'"]')].find(el=>el.value===String(value));
          if(!input)throw new Error('Missing answer '+name+'='+value);
          input.checked=true;
          input.dispatchEvent(new Event('change',{bubbles:true}));
        };
        data.facts.forEach((q,i)=>choose('f'+i,q[2]));
        data.tf.forEach((q,i)=>{
          choose('t'+i,q[1]?0:1);
          const select=document.querySelector('#p'+i);
          select.value=String(q[2]);
          select.dispatchEvent(new Event('change',{bubbles:true}));
        });
        data.expr.forEach((q,i)=>{
          const options=[q[1],...data.expr.filter((_,j)=>j!==i).map(x=>x[1]),data.vocab[i][0]].sort((a,b)=>a.localeCompare(b));
          choose('e'+i,options.indexOf(q[1]));
        });
        data.vocab.forEach((q,i)=>choose('v'+i,q[2]));
        data.critical.forEach((q,i)=>q[2].forEach(choice=>choose('c'+i,choice)));
      },t);
      assert.match(await page.locator('#answerStatus').innerText(),/18\/18/,'answer count, text '+index);
      await page.locator('#submitRead').evaluate(el=>el.click());
      assert.match(await page.locator('#results').innerText(),/Answers checked/,'feedback, text '+index);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('actuarial-reading-b2-v1')).records.at(-1).points),20,'internal grading, text '+index);
      assert.equal(await page.locator('.read-feedback-slot .read-feedback').count(),18,'feedback count, text '+index);
      checked++;
    }
    if(width<=800){
      await page.locator('#viewText').click();
      assert.equal(await page.locator('.read-article').isVisible(),true);
      await page.locator('#viewQuestions').click();
      assert.equal(await page.locator('.read-questions').isVisible(),true);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      if(overflow>2){const offenders=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el);return style.display!=='none'&&style.visibility!=='hidden'&&r.width>0&&(r.right>innerWidth+2||r.left< -2)}).map(el=>({tag:el.tagName,cls:String(el.className).slice(0,85),id:el.id,right:Math.round(el.getBoundingClientRect().right),width:Math.round(el.getBoundingClientRect().width)})).slice(0,25));console.error('Mobile overflow offenders:',JSON.stringify(offenders))}assert.ok(overflow<=2,'horizontal mobile overflow: '+overflow+' px');
    }
    assert.deepEqual(errors,[],'browser JavaScript errors');
    console.log('PASS '+browserType.name()+' '+width+'x'+height+': '+checked+' texts graded 20/20');
  } finally {await context.close();await browser.close();}
}
(async()=>{
  await run(chromium,1366,768);
  await run(chromium,390,844);
  await run(webkit,390,844);
})().catch(err=>{console.error(err);process.exitCode=1;});