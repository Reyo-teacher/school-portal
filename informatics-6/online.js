'use strict';
(() => {
 const sections=[...document.querySelectorAll('details[data-print-open]')];
 let last;
 window.addEventListener('beforeprint',()=>{if(!last)last=sections.map(el=>el.open);sections.forEach(el=>{el.open=true;});});
 window.addEventListener('afterprint',()=>{if(last)sections.forEach((el,i)=>{el.open=last[i];});last=undefined;});
})();
