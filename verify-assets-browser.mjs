import {readFile,writeFile} from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const bootstrap=html.match(/\/\* OFFLINE_CAT_ASSET_START \*\/[\s\S]*?\/\* OFFLINE_CAT_ASSET_END \*\//)[0];
const header=html.match(/class="title-illustration" src="([^"]+)"/)[1];
const check=`async function check(){
 const images=[];
 for(const element of document.querySelectorAll('[data-image-check]')){
  const src=element.tagName==='IMG'?element.src:getComputedStyle(element).backgroundImage.match(/^url\\((['"]?)(.*?)\\1\\)$/)?.[2];
  const image=new Image();image.src=src||'';
  try{await image.decode();images.push({name:element.dataset.imageCheck,loaded:true,width:image.naturalWidth,height:image.naturalHeight});}
  catch{images.push({name:element.dataset.imageCheck,loaded:false});}
 }
 const result={background:getComputedStyle(document.body).backgroundColor,text:getComputedStyle(document.body).color,catUrlLength:document.documentElement.style.getPropertyValue('--cat-art').length,images};
 document.querySelector('#asset-result').textContent=JSON.stringify(result,null,2);
 document.querySelector('#asset-result').dataset.complete='true';
}check();`;
const fixture='<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>保存版の画像チェック</title><style>'+css+'\nbody{padding:24px}.asset-row{display:flex;gap:20px;flex-wrap:wrap}.asset-row>div{width:160px}.cat-portrait{width:160px;height:160px}.asset-header{width:240px;height:auto}pre{white-space:pre-wrap;font-size:14px}</style></head><body><h1>保存版の画像チェック</h1><div class="asset-row"><div><span class="cat-portrait portrait-monaka" data-image-check="モナカ"></span>モナカ</div><div><span class="cat-portrait portrait-ohagi" data-image-check="おはぎ"></span>おはぎ</div><div><span class="cat-portrait portrait-daifuku" data-image-check="大福"></span>大福</div><div class="intro-art chosen-cat portrait-monaka" data-image-check="開始画面"></div><img class="asset-header" src="'+header+'" data-image-check="タイトル画像"></div><pre id="asset-result">読み込み中…</pre><script type="module">'+bootstrap+'\n'+check+'</script></body></html>';
await writeFile(new URL('./dist/asset-check.html',import.meta.url),fixture);
console.log('Prepared CSS/image verification page from the built standalone HTML.');
