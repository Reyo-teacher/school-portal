(()=>{
const D=globalThis.EV3_PDFS||[],q=document.querySelector('#find'),cat=document.querySelector('#category'),out=document.querySelector('#items'),stats=document.querySelector('#results'),more=document.querySelector('#more');
const categories=[...new Set(D.flatMap(x=>x[1]))].sort((a,b)=>a.localeCompare(b,'ru'));
for(const c of categories){const o=document.createElement('option');o.value=c;o.textContent=c;cat.append(o)}
const normalize=(s)=>s.trim().toLowerCase().replaceAll('ё','е');let limit=24;
function card(row){
 const [t,cs,pdf,src]=row;const item=document.createElement('article');item.className='pdf-card';
 const lab=document.createElement('p');lab.className='quiet';lab.textContent=cs.join(' · ');
 const h=document.createElement('h3');h.textContent=t;
 const foot=document.createElement('div');foot.className='row';
 for(const [url,text] of [[pdf,'Открыть PDF ↗'],[src,'Источник ↗']]){
  const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=text;foot.append(a)
 }
 item.append(lab,h,foot);return item
}
function render(){
 const terms=normalize(q.value).split(/\s+/).filter(Boolean);
 const selected=D.filter(([t,cs])=>(!cat.value||cs.includes(cat.value))&&terms.every(w=>normalize(t+' '+cs.join(' ')).includes(w)));
 out.replaceChildren(...selected.slice(0,limit).map(card));
 stats.textContent=selected.length?'Найдено: '+selected.length+' из '+D.length+'. Показано: '+Math.min(limit,selected.length)+'.':'Ничего не найдено. Измени запрос или категорию.';
 more.hidden=limit>=selected.length;
}
const reset=()=>{limit=24;render()};q.addEventListener('input',reset);cat.addEventListener('change',reset);
more.addEventListener('click',()=>{limit+=24;render()});document.querySelector('#total').textContent=D.length+' PDF · открыть каталог';render();
})();
