import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
let server,browser;
const origin='http://127.0.0.1:3199';
before(async()=>{
 server=spawn('node',['node_modules/next/dist/bin/next','start','--port','3199'],{stdio:'pipe'});
 let output=''; server.stderr.on('data',b=>output+=b); server.stdout.on('data',b=>output+=b);
 let ready=false;
 for(let i=0;i<100;i++){try{const r=await fetch(origin+'/en');if(r.ok){ready=true;break;}}catch{} await new Promise(r=>setTimeout(r,150));}
 assert.ok(ready,`Server did not become ready: ${output}`);
 browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
});
after(async()=>{await browser?.close();server?.kill();});
for(const locale of ['en','tr','id']){
 test(`${locale}: localized responsive navigation and FAQ`,async()=>{
  const page=await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [375,768,1440]){
   await page.setViewportSize({width,height:900});
   const response=await page.goto(`${origin}/${locale}`);assert.equal(response.status(),200);
   assert.equal(await page.locator('html').getAttribute('lang'),locale);
   assert.equal(await page.locator('h1').count(),1);
   assert.ok(await page.locator('h1').isVisible());
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
   await page.locator('#join').scrollIntoViewIfNeeded();assert.ok(await page.locator('#join').isVisible());
  }
  const faq=page.locator('.faq details').first(); await faq.locator('summary').click();assert.ok(await faq.getAttribute('open')!==null);
  const other=locale==='en'?'tr':'en';await page.locator(`.locales a[lang="${other}"]`).click();await page.waitForURL(`**/${other}`);assert.equal(await page.locator('html').getAttribute('lang'),other);
  assert.deepEqual(errors,[]);await page.close();
 });
}
test('unknown locale is rejected and defensive headers are present',async()=>{
 const r=await fetch(origin+'/xx');assert.equal(r.status,404);
 const publicPage=await fetch(origin+'/en');assert.equal(publicPage.headers.get('x-frame-options'),'DENY');assert.equal(publicPage.headers.get('x-content-type-options'),'nosniff');
 const root=await fetch(origin,{redirect:'manual'});assert.ok([307,308].includes(root.status));assert.equal(root.headers.get('location'),'/en');
});
test('public foundation does not expose functional payment or upload controls',async()=>{
 const page=await browser.newPage();await page.goto(origin+'/en');
 assert.equal(await page.locator('input[type=file],input[type=password],form').count(),0);
 assert.ok(await page.locator('a[href="/en/auth/signup"]').count()>0);
 await page.close();
});
test('localized auth screens and protected member routes fail safely without backend configuration',async()=>{
 const page=await browser.newPage();
 for(const locale of ['en','tr','id']){
  for(const mode of ['signup','login','forgot','reset','resend']){
   const r=await page.goto(`${origin}/${locale}/auth/${mode}`);assert.equal(r.status(),200);
   assert.equal(await page.locator('html').getAttribute('lang'),locale);assert.equal(await page.locator('h1').count(),1);
   await page.setViewportSize({width:375,height:812});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.ok((await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'));
  }
  const r=await page.goto(`${origin}/${locale}/app/discover`);assert.equal(r.status(),200);
  assert.ok(page.url().endsWith('/auth/login')||await page.locator('.member-unavailable').count()>0);
 }
 const hostile=await fetch(origin+'/api/auth',{method:'POST',headers:{Origin:'https://hostile.example','Content-Type':'application/json'},body:JSON.stringify({action:'signup'})});assert.equal(hostile.status,403);
 const photo=await fetch(origin+'/api/photos/11111111-1111-4111-8111-111111111111');assert.equal(photo.status,404);
 await page.close();
});
