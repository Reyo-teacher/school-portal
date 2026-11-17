/* Paper companion for curriculum games; uses the teacher-provided sheet layout. */
(function(root){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function ray(t){const W=440,X=i=>25+385*i/t.max;let s=`<svg class="ray" viewBox="0 0 ${W} 100" role="img" aria-label="Луч для построения"><path d="M25 50H430l-8-5m8 5l-8 5" fill="none" stroke="#334155" stroke-width="2"/>`;for(let i=0;i<=t.max;i++)s+=`<path d="M${X(i)} 44v12" stroke="#334155"/><text x="${X(i)}" y="80" text-anchor="middle">${i===0?'0':i===t.unit?'1':''}</text>`;return s+'</svg>';}
 function adapt(t,renderModel){
  let label='Ответ',answer=t.answer,fields,vis=t.model?renderModel(t.model):'';
  if(t.type==='choice')fields=[{id:'answer',type:'choice',label:'Выбери ответ',answer:t.answer,options:t.options.map(x=>({value:x,label:x}))}];
  if(t.type==='multi'){label='Выпиши все подходящие карточки';answer=t.answer.join(', ');vis+=`<p>Карточки: ${t.options.map(esc).join('; ')}</p>`;}
  if(t.type==='order'){label='Запиши карточки в нужном порядке';answer=t.answer.join(' → ');vis+=`<p>Карточки: ${t.options.map(esc).join('; ')}</p>`;}
  if(t.type==='shade'){label='Сколько частей закрашено';vis=renderModel({type:'fraction',n:0,d:t.total});}
  if(t.type==='ray'){label='Отметь точку на рисунке; её координата';answer=t.answer%t.unit===0?String(t.answer/t.unit):t.answer+'/'+t.unit;vis=ray(t);}
  if(t.type==='sequence'){label='Твои числа и правило';answer='Например: '+Array.from({length:t.count},(_,i)=>t.start+(i+1)*3).join(', ')+'. Каждый раз +3. Принимается любой постоянный натуральный шаг.';}
  if(t.type==='angle'){label='Построй угол транспортиром. Градусная мера';answer=t.answer+'°';vis='<div class="paper-drawing"></div>';}
  if(t.type==='chart'){label='Построй диаграмму по таблице';answer=t.labels.map((x,i)=>x+': '+t.answer[i]).join('; ');vis+='<div class="paper-drawing"></div>';}
  return {html:esc(t.prompt),vis,fields:fields||[{id:'answer',type:'number',label,answer:String(answer)}],explanation:t.type==='sequence'?String(answer):t.success};
 }
 function sheetInfo(data,round,renderModel){
  return {title:data.title,code:'Урок '+data.number+(data.mode==='preparation'?' · Подготовка, не контрольная работа':data.mode==='correction'?' · Тренировка после разбора ошибок':''),variant:data.number*10+round+1,LV:['a','a','a','b','b','b'],tasks:data.variants[round].map(t=>adapt(t,renderModel)),exit:{title:'Самостоятельная работа в тетради',intro:data.paper,items:[{q:'Объясни ход решения или выполни построение. Ответ проверяет учитель.',answer:'Свободная работа по условию. Учитель проверяет решение, объяснение и необходимые элементы чертежа.'}]}};
 }
 function mount(panel,getData){
  panel.innerHTML='<p>Можно заниматься без интернета: распечатай карточку или сохрани её в PDF через окно печати.</p><div class="practice-toolbar"><button class="filter-btn" type="button" data-paper="student">🖨 Рабочая карточка (PDF)</button><button class="filter-btn" type="button" data-paper="teacher">🖨 Ответы для учителя</button></div><p class="source-note">Карточка и ответы используют один вариант. Чтобы получить другие числа, пройди маршрут и выбери «Сыграть с другими числами».</p>';
  panel.addEventListener('click',event=>{const b=event.target.closest('[data-paper]');if(!b)return;const {data,round,renderModel}=getData();const info=sheetInfo(data,round,renderModel);let sheet=document.getElementById('practice-print');if(!sheet){sheet=document.createElement('div');sheet.id='practice-print';document.body.appendChild(sheet);}info.withKey=b.dataset.paper==='teacher';const rules='<section class="paper-rules"><strong>Вспомни правило</strong>'+data.notes.map(x=>'<p>'+esc(x)+'</p>').join('')+'<p><strong>Пример: '+esc(data.example[0])+'</strong> '+esc(data.example[1])+'</p></section>';const html=root.LessonPractice.buildSheet(info);sheet.innerHTML=html.replace('<h2 class="ps-level">',rules+'<h2 class="ps-level">');root.speechSynthesis?.cancel();document.body.classList.add('practice-printing');root.print();});
  root.addEventListener('afterprint',()=>document.body.classList.remove('practice-printing'));
  const openPaper=()=>{if(root.location?.hash==='#paper-practice'){const block=document.getElementById('paper-practice');if(block)block.open=true;}};openPaper();root.addEventListener('hashchange',openPaper);
 }
 const api={adapt,sheetInfo,mount};root.CoursePrint=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
