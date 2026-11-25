'use strict';
(() => {
  const key='portal-informatics6-done-v1';
  const read=()=>{try{return new Set(JSON.parse(localStorage.getItem(key)||'[]'));}catch{return new Set();}};
  const completed=read();
  document.querySelectorAll('[data-lesson-status]').forEach(el=>{
    if(completed.has(el.dataset.lessonStatus)){el.textContent='Пройден';el.dataset.done='true';}
  });
  const count=document.querySelector('[data-progress]');
  if(count) count.textContent='Пройдено: '+Array.from(completed).filter(v=>/^(0[1-9]|[12][0-9]|3[0-3])$/.test(v)).length+' из 33';
  const done=document.querySelector('[data-mark]');
  if(done) {
    const msg=document.getElementById('mark-status');
    function update(){
      const yes=completed.has(done.dataset.mark);
      done.setAttribute('aria-pressed',String(yes));done.textContent=yes?'Снять отметку':'Отметить урок пройденным';
    }
    update();
    done.addEventListener('click',()=>{
      const id=done.dataset.mark;
      if(completed.has(id)) completed.delete(id); else completed.add(id);
      update();
      try {localStorage.setItem(key,JSON.stringify([...completed]));msg.textContent=completed.has(id)?'Отмечено в этом браузере.':'Отметка снята.';}
      catch {msg.textContent='Браузер не разрешил сохранить отметку.';}
    });
  }
  document.querySelectorAll('[data-print]').forEach(el=>el.addEventListener('click',()=>window.print()));
  document.querySelectorAll('[data-copy]').forEach(el=>el.addEventListener('click',async()=>{
    const msg=document.getElementById('copy-status'),code=document.querySelector('.code code').textContent;
    try {await navigator.clipboard.writeText(code);msg.textContent='Код скопирован.';}
    catch {msg.textContent='Выдели код курсором и скопируй вручную.';}
  }));
  document.querySelectorAll('[data-download]').forEach(el=>el.addEventListener('click',()=>{
    const code=document.querySelector('.code code').textContent;
    const link=document.createElement('a');
    const url=URL.createObjectURL(new Blob([code+'\n'],{type:'text/x-python;charset=utf-8'}));
    link.href=url;link.download=location.pathname.split('/').pop().split('.')[0]+'.py';
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
  }));
  const quiz=document.querySelector('.quiz');
  if(quiz){
    const fields=Array.from(quiz.querySelectorAll('fieldset')),score=document.getElementById('score');
    quiz.addEventListener('submit',e=>{
      e.preventDefault();
      let good=0,answered=0;
      fields.forEach(f=>{
        const input=f.querySelector('input:checked'),out=f.querySelector('[data-feedback]');
        if(!input){out.textContent='Выбери один вариант.';out.dataset.ok='false';out.hidden=false;return;}
        answered++;
        const ok=input.value===f.dataset.answer;
        if(ok) good++;
        out.textContent=(ok?'Верно. ':'Подумай ещё. ')+f.dataset.why;
        out.dataset.ok=String(ok);out.hidden=false;
      });
      score.textContent='Верных ответов: '+good+' из '+fields.length+(answered<fields.length?'. Ответь и на пропущенные вопросы.':'.');
    });
    quiz.addEventListener('reset',()=>{
      fields.forEach(f=>{f.querySelector('[data-feedback]').hidden=true;});score.textContent='';
    });
  }
  const demo=document.querySelector('[data-demo]');
  if(!demo) return;
  const out=demo.querySelector('[data-demo-status]');
  if(demo.dataset.demo==='vector'){
    const pts=[[30,68],[78,68],[126,25],[174,68],[222,68],[126,128]],selected=[];
    const shape=demo.querySelector('[data-shape]'),nodes=demo.querySelector('[data-nodes]'),label=demo.querySelector('[data-label]');
    const caption=demo.querySelector('[name=caption]'),fill=demo.querySelector('[name=fill]'),stroke=demo.querySelector('[name=stroke]');
    let closed=false;
    function redraw(){
      const visible=selected.map(i=>pts[i].join(','));
      if(closed&&visible.length) visible.push(visible[0]);
      shape.setAttribute('points',visible.join(' '));
      shape.setAttribute('fill',closed?fill.value:'none');shape.setAttribute('stroke',stroke.value);
      label.textContent=caption.value;
      [...nodes.children].forEach((n,i)=>n.setAttribute('fill',selected.includes(i)?'#f1bb60':'#fff'));
      out.textContent='Узлов: '+selected.length+'. '+(closed?'Контур замкнут, заливка видна.':'Контур открыт. Можно добавить узлы.');
    }
    demo.querySelectorAll('[data-point]').forEach(b=>b.onclick=()=>{
      if(closed||selected.includes(Number(b.dataset.point))) return;
      selected.push(Number(b.dataset.point));b.setAttribute('aria-pressed','true');redraw();
    });
    demo.querySelector('[data-close]').onclick=()=>{
      if(selected.length<3){out.textContent='Для замыкания выбери хотя бы три узла.';return;}
      closed=true;redraw();
    };
    demo.querySelector('[data-clear]').onclick=()=>{selected.length=0;closed=false;demo.querySelectorAll('[data-point]').forEach(b=>b.setAttribute('aria-pressed','false'));redraw();};
    [caption,fill,stroke].forEach(i=>i.addEventListener('input',redraw));
    redraw();
  } else if(demo.dataset.demo==='training'){
    const control=demo.querySelector('select');
    function redraw(){
      const actual=[true,false,true,false],byColour=[true,false,false,true];
      const predictions=control.value==='colour'?byColour:actual;
      const score=predictions.filter((v,i)=>v===actual[i]).length;
      demo.querySelectorAll('[data-prediction]').forEach((label,i)=>{
        label.textContent='→ '+(predictions[i]?'треугольник':'не треугольник')+(predictions[i]===actual[i]?' ✓':' · ошибка');
      });
      out.textContent='Верных предсказаний: '+score+' из 4.';
    }
    control.addEventListener('change',redraw);redraw();
  } else if(demo.dataset.demo==='raster'){
    const range=demo.querySelector('input'),pixel=demo.querySelector('[data-pixel]'),vector=demo.querySelector('[data-vector]');
    const redraw=()=>{const z=Number(range.value);[pixel,vector].forEach(x=>x.setAttribute('transform','translate(60 53) scale('+z+')'));out.textContent='Масштаб: ×'+z;};
    range.addEventListener('input',redraw);redraw();
  } else if(demo.dataset.demo==='division'){
    const inputs=Array.from(demo.querySelectorAll('input'));
    function redraw(){
      const [n,d]=inputs.map(i=>i.valueAsNumber);
      if(!Number.isInteger(n)||n<0||n>999||!Number.isInteger(d)||d<1||d>99){out.textContent='Введи целое количество от 0 до 999 и размер группы от 1 до 99.';return;}
      const q=Math.floor(n/d),r=n%d;
      out.textContent=n+' // '+d+' = '+q+'; '+n+' % '+d+' = '+r+'. Проверка: '+q+' × '+d+' + '+r+' = '+n+'.';
    }
    inputs.forEach(i=>i.addEventListener('input',redraw));redraw();
  } else if(demo.dataset.demo==='chart'){
    const inputs=Array.from(demo.querySelectorAll('input'));
    function redraw(){
      const values=inputs.map(i=>Number(i.value));const max=Math.max(...values,1);
      demo.querySelectorAll('.chart-line').forEach((line,i)=>{line.querySelector('i').style.width=(100*values[i]/max)+'%';line.querySelector('output').textContent=values[i];});
      const high=Math.max(...values);
      out.textContent='Максимум: '+high+'. Категории: '+values.map((v,i)=>v===high?'АБВ'[i]:null).filter(Boolean).join(', ')+'.';
    }
    inputs.forEach(i=>i.addEventListener('input',redraw));redraw();
  }
})();
