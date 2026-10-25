import {Script} from 'node:vm';

export function removeCssImports(css){
 return css.replace(/@import\s+(?:url\(\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^)]*)\s*\)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')[^;]*;/gi,'');
}

export function catAssetBootstrap(base64){
 // Large data URLs can exceed browser CSS-custom-property limits. Keep only
 // the short blob URL in CSS; the PNG remains embedded in the standalone file.
 return `/* OFFLINE_CAT_ASSET_START */\n(()=>{const bytes=Uint8Array.from(atob(${JSON.stringify(base64)}),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));document.documentElement.style.setProperty('--cat-art',\`url("\${url}")\`);})();\n/* OFFLINE_CAT_ASSET_END */`;
}

function replaceRequired(source,needle,value){
 if(source.split(needle).length!==2)throw new Error(`Expected one HTML placeholder: ${needle}`);
 // A replacement string would interpret $&, $` and $' inside the library code.
 return source.replace(needle,()=>value);
}

export function escapeInlineScript(source){
 return source.replace(/<\/script/gi,match=>`<\\/${match.slice(2)}`);
}

export function verifyOfflineHtml(html,expectedScript){
 const opening='<script type="module">';
 const count=re=>[...html.matchAll(re)].length;
 if(count(/<script\b/gi)!==1||count(/<\/script\s*>/gi)!==1)throw new Error('Offline HTML must contain exactly one inline script');
 if(count(/<\/body\s*>/gi)!==1||count(/<\/html\s*>/gi)!==1)throw new Error('Offline document structure was corrupted');
 if(/<script\b[^>]*\bsrc\s*=/i.test(html))throw new Error('Offline HTML contains an external script');
 const start=html.indexOf(opening);
 if(start<0)throw new Error('Offline module script is missing');
 const end=html.indexOf('</script>',start+opening.length);
 const extracted=html.slice(start+opening.length,end);
 if(expectedScript!==undefined&&extracted!==escapeInlineScript(expectedScript))throw new Error('Inline JavaScript was altered while assembling the HTML');
 new Script(extracted,{filename:'offline-inline-script.js'});
 return extracted;
}

export function assembleOfflineHtml({template,css,headerArt,script}){
 if(/<\/style/i.test(css))throw new Error('Stylesheet contains an unsafe closing tag');
 const inlineScript=escapeInlineScript(script);
 let html=template.replace('href="./"','href="#"');
 html=replaceRequired(html,'<link rel="stylesheet" href="style.css">',`<style>${css}</style>`);
 if(headerArt)html=replaceRequired(html,'src="assets/errand-hero.png"',`src="data:image/png;base64,${headerArt}"`);
 html=replaceRequired(html,'<script type="module" src="game.js"></script>',`<script type="module">${inlineScript}</script>`);
 verifyOfflineHtml(html,script);
 return html;
}
