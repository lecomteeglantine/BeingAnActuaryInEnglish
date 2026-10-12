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
    assert.deepEqual(errors,[], 'uncaught browser errors');
    await context.close();
    console.log('PASS '+viewport.width+'x'+viewport.height+'; timer '+before);
  };
  try {await test({width:1366,height:768}); await test({width:390,height:844});}
  finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});