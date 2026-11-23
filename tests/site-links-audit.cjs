'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const pages=[
'index.html','dictionary.html','m1.html','m2.html','refresher.html',
'reading.html','writing.html','listening.html','speaking.html',
'grammar.html','pronunciation.html','games.html','flashcards.html',
'notebook.html','privacy.html','accessibility.html'
];
const issues=[];
let examined=0;
for(const file of pages){
  if(!fs.existsSync(file)){issues.push(file+': main page missing');continue}
  const html=fs.readFileSync(file,'utf8');
  // Exclude inline JS/CSS strings that contain HTML-like examples, but keep script src attributes.
  const markup=html.replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi,'$1$2')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  const elements=markup.match(/<(?:a|script|link|img|source|iframe)\b[^>]*>/gi)||[];
  for(const tag of elements){
    const attrs=[...tag.matchAll(/\b(href|src)\s*=\s*(["'])(.*?)\2/gi)];
    for(const m of attrs){
      const value=m[3].trim();
      if(!value || /^(?:#|https?:|mailto:|tel:|data:|blob:|javascript:|\/\/)/i.test(value))continue;
      // An anchor with only ?parameters refers to the current page.
      const target=value.split(/[?#]/)[0];
      if(!target)continue;
      const local=path.resolve(path.dirname(file),decodeURIComponent(target));
      examined++;
      if(!fs.existsSync(local))issues.push(file+': missing '+m[1]+'='+value);
    }
  }
}
assert.equal(issues.length,0,'Broken local links and assets:\n'+issues.join('\n'));
console.log('PASS site link audit: '+pages.length+' main pages, '+examined+' local paths verified');
