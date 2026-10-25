import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {assembleOfflineHtml,verifyOfflineHtml,escapeInlineScript} from './offline-html.mjs';

const template='<!doctype html><html><head><link rel="stylesheet" href="style.css"></head><body><img src="assets/museum-cat-fish-header.png"><script type="module" src="game3d.js"></script></body></html>';
const make=script=>assembleOfflineHtml({template,css:'body{color:white}',headerArt:'AAAA',script});

test('replacement metacharacters stay literal in the inline library and stylesheet',()=>{
 const value="$& $` $'";
 const script=`const $=true;globalThis.result=[$&&42,${JSON.stringify(value)}];`;
 const html=assembleOfflineHtml({template,css:'/* $& $` */ body{color:white}',headerArt:'AAAA',script});
 const embedded=verifyOfflineHtml(html,script),context={};runInNewContext(embedded,context);
 assert.equal(context.result[0],42);assert.equal(context.result[1],value);
 assert.ok(html.includes('/* $& $` */'));
 assert.equal((html.match(/<script\b/gi)||[]).length,1);
 assert.ok(!html.includes('src="game3d.js"'));
});

test('a JavaScript string containing a closing script tag cannot escape into the page',()=>{
 const script='globalThis.result="</ScRiPt>";';const html=make(script),context={};
 runInNewContext(verifyOfflineHtml(html,script),context);assert.equal(context.result,'</ScRiPt>');
 assert.ok(escapeInlineScript(script).includes('<\\/ScRiPt>'));
});

test('validation rejects the original replacement-string corruption and broken JavaScript',()=>{
 const script='const $=true;globalThis.result=$&&42;';
 const broken=template.replace('<script type="module" src="game3d.js"></script>',`<script type="module">${script}</script>`);
 assert.throws(()=>verifyOfflineHtml(broken,script),/exactly one inline script/);
 assert.throws(()=>make('const broken = ;'),SyntaxError);
});

test('the written standalone game contains the exact checked code and embedded images',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const checked=await readFile(new URL('./offline-script-check.mjs',import.meta.url),'utf8');
 assert.equal(verifyOfflineHtml(html),checked);
 assert.ok(html.includes('src="data:image/png;base64,'));
 assert.ok(html.includes('const THREE='));assert.ok(html.includes('const CONTROLLERS='));
 assert.ok(!/src="assets\//.test(html));
});
