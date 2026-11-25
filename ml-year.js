(() => {
  "use strict";
  const bank=window.MLYear, $=id=>document.getElementById(id);
  const el=(tag,txt,cl)=>{const o=document.createElement(tag);if(txt!==undefined)o.textContent=txt;if(cl)o.className=cl;return o;};
  const add=(p,tag,txt,cl)=>p.appendChild(el(tag,txt,cl));
  const svg=(tag,attrs,parent)=>{const o=document.createElementNS("http://www.w3.org/2000/svg",tag);Object.entries(attrs).forEach(([k,val])=>o.setAttribute(k,val));return parent.appendChild(o);};
  const label=(p,x,y,t,anchor="middle")=>{svg("text",{x,y,"text-anchor":anchor},p).textContent=t;};
  const colors=["#3c8bbb","#efab5f","#6db796","#b79ada"];
  function draw(host,d){
    const f=add(host,"figure",undefined,"visual");
    if(d.kind==="table"){
      const t=add(f,"table"),hr=add(add(t,"thead"),"tr");
      d.labels.forEach(x=>{add(hr,"th",x).scope="col";});const body=add(t,"tbody");
      d.values.forEach(row=>{const r=add(body,"tr");row.forEach((x,i)=>{const cell=add(r,i?"td":"th",x);if(!i)cell.scope="row";});});
      return;
    }
    const s=svg("svg",{viewBox:d.kind==="pie"?"0 0 335 153":"0 0 410 230",role:"img"},f);
    svg("title",{},s).textContent=d.kind==="pie"?"Круговая диаграмма":d.kind==="hist"?"Гистограмма":d.kind==="bar"?"Столбчатая диаграмма":"Полигон частот";
    if(d.kind==="pie"){
      let a=-Math.PI/2;
      d.values.forEach((v,i)=>{let z=a+v*Math.PI/50;const xy=r=>[90+62*Math.cos(r),74+62*Math.sin(r)];
        const [x1,y1]=xy(a),[x2,y2]=xy(z);
        svg("path",{d:`M90 74 L${x1} ${y1} A62 62 0 ${v>50?1:0} 1 ${x2} ${y2} Z`,fill:colors[i],stroke:"#fff"},s);
        svg("rect",{x:183,y:24+28*i,width:13,height:13,fill:colors[i],stroke:"#456"},s);
        label(s,204,35+28*i,d.labels[i]+": "+v+"%","start");a=z;});
      return;
    }
    label(s,46,17,d.unit,"start");
    const L=46,R=392,base=185,step=(R-L)/d.values.length;
    const minor=d.kind==="line"&&Math.max(...d.values)<=20?1:2;
    const major=minor*5;
    const top=Math.ceil(Math.max(...d.values)/major)*major;
    const point=(z)=>base-150*z/top;
    for(let k=0;k<=top;k+=minor){
      const y=point(k);svg("line",{x1:L,y1:y,x2:R,y2:y,stroke:k%major===0?"#9bb7c8":"#e0eaf0"},s);if(k%major===0)label(s,L-6,y+4,k,"end");
    }
    svg("path",{d:`M${L} 35 V${base} H${R}`,fill:"none",stroke:"#395972","stroke-width":1.5},s);
    const points=[];
    d.values.forEach((z,i)=>{const x=L+step*(i+.5),y=point(z);points.push([x,y]);
      if(z%minor!==0)label(s,x,y-6,z);
      label(s,x,207,d.labels[i]);
      if(d.kind!=="line"){const w=d.kind==="hist"?step:step*.6;svg("rect",{x:x-w/2,y,width:w,height:base-y,fill:"#60a8cf",stroke:"#215879"},s);}
    });
    if(d.kind==="line"){
      svg("polyline",{points:points.map(a=>a.join(",")).join(" "),fill:"none",stroke:"#126185","stroke-width":3},s);
      points.forEach(([x,y])=>svg("circle",{cx:x,cy:y,r:4,fill:"#075b8a"},s));
    }
    // A keyboard/screen-reader alternative preserves the same data.
    const t=svg("desc",{},s); t.textContent=d.labels.map((x,i)=>x+": "+d.values[i]).join("; ");
  }
  const phases=[
    {name:"Числа и уравнения",subtitle:"Доли, множества, проценты и первые диаграммы",icon:"✦",color:"sky",limit:5},
    {name:"Статистика и зависимости",subtitle:"От гистограмм до движения и тарифов",icon:"▥",color:"mint",limit:9},
    {name:"Закономерности и вероятность",subtitle:"Считаем варианты, читаем время и масштаб",icon:"◇",color:"violet",limit:13},
    {name:"Геометрия и финиш",subtitle:"Площади, пространственная логика и итоговый пробник",icon:"⚑",color:"amber",limit:17}
  ];
  const storageKey="school-portal:ml-year-progress:v1";
  function readProgress(){
    try{const saved=JSON.parse(localStorage.getItem(storageKey)||"{}");return saved&&typeof saved==="object"&&!Array.isArray(saved)?saved:{};}catch{return {};}
  }
  const progress=readProgress();
  const done=w=>Number.isInteger(progress[w])&&progress[w]>=0&&progress[w]<=10;
  function saveScore(w,score){
    if(!done(w)||progress[w]<score)progress[w]=score;
    try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch{}
  }
  const raw=new URL(location.href).searchParams.get("week"),week=Number(raw);
  if(!raw||!Number.isInteger(week)||week<1||week>34){
    $("map").hidden=false;
    const state=add($("map"),"aside",undefined,"route-progress");
    const completed=Array.from({length:34},(_,i)=>i+1).filter(done).length;
    const firstOpen=Array.from({length:34},(_,i)=>i+1).find(w=>!done(w));
    const stateCopy=add(state,"div",undefined,"route-state");
    add(stateCopy,"strong",`Пройдено ${completed} из 34 недель`);
    const bar=add(stateCopy,"progress");bar.max=34;bar.value=completed;bar.setAttribute("aria-label","Прогресс по неделям");
    add(stateCopy,"small","Сохраняется только в этом браузере.");
    const cta=add(state,"a",firstOpen?(completed?`Продолжить с недели ${firstOpen}`:"Начать маршрут"):"Повторить итоговый пробник","route-cta");
    cta.href="?week="+(firstOpen||34);
    const jump=add($("map"),"nav",undefined,"route-jump");jump.setAttribute("aria-label","Этапы маршрута");
    phases.forEach((p,j)=>{const link=add(jump,"a",`${j+1}. ${p.name}`);link.href="#etap-"+(j+1);});
    let i=0;
    const station=(parent,w,title,description,cls)=>{
      const link=add(parent,"a",undefined,"station "+cls+(done(w)?" is-done":""));link.href="?week="+w;
      const badge=add(link,"span",String(w),"station-num");badge.setAttribute("aria-hidden","true");
      const copy=add(link,"span",undefined,"station-copy");add(copy,"small",`Неделя ${w} · ${description}`);add(copy,"strong",title);
      if(done(w))add(copy,"small","Лучший результат: "+progress[w]+"/10","station-result");
      const arrow=add(link,"span",done(w)?"✓":"→","station-arrow");arrow.setAttribute("aria-hidden","true");
    };
    phases.forEach((p,j)=>{
      const step=add($("map"),"section",undefined,"phase phase-"+p.color);step.id="etap-"+(j+1);
      const banner=add(step,"header",undefined,"phase-head");const icon=add(banner,"span",p.icon,"phase-icon");icon.setAttribute("aria-hidden","true");
      const copy=add(banner,"div");add(copy,"p",`ЭТАП ${j+1} · НЕДЕЛИ ${i*2+1}–${p.limit*2}`,"phase-kicker");add(copy,"h2",p.name);add(copy,"p",p.subtitle,"phase-desc");
      const route=add(step,"div",undefined,"phase-trail");
      for(;i<p.limit;i++){
        const pair=add(route,"article",undefined,"route-pair");
        station(pair,2*i+1,bank.topics[i],"Новая тема","station-topic");
        station(pair,2*i+2,i===0?"Закрепление первой темы":i===16?"Итоговый пробник":"Смешанный тест",i===0?"Практика":i===16?"Финиш":"Повторение",i===16?"station-final":"station-review");
      }
    });
    return;
  }
  document.body.classList.add("ml-quiz");
  let attempt=0,qs=[],submitted=false;
  const i=Math.ceil(week/2)-1, thematic=week%2===1;
  $("toMap").hidden=false;$("toMap").href="ml-tests.html?course=34";$("work").hidden=false;
  $("intro").textContent="Тренажёр ЕНТ · 10 заданий с одним правильным ответом";
  $("weekType").textContent=`Неделя ${week} из 34 · ${thematic?"новая тема":week===2?"закрепление":"накопительное повторение"}`;
  $("weekTitle").textContent=thematic?bank.topics[i]:week===34?"Итоговый пробник":week===2?"Закрепление первой темы":"Смешанный тест";
  $("scope").textContent=thematic?"10 заданий по одной теме.":week===2?"Пока пройдена одна тема: числа, доли и округление.":"В каждом наборе есть последняя тема и выборка из более ранних. Тем, которые будут дальше, здесь нет.";
  function render(){
    qs=bank.build(week,attempt);submitted=false;
    $("quiz").replaceChildren();$("results").replaceChildren();$("results").hidden=true;
    $("scope").dataset.attempt=String(attempt);
    qs.forEach((q,index)=>{
      const f=add($("quiz"),"fieldset",undefined,"question");
      add(f,"legend",`Задание ${index+1}`);
      add(f,"p",q.prompt,"prompt");
      if(q.visual)draw(f,q.visual);
      q.options.forEach((o,k)=>{
        const l=add(f,"label",undefined,"option");
        const input=add(l,"input");input.type="radio";input.name="q"+index;input.value=String(k);
        add(l,"span","АБВГ"[k]+". "+o);
      });
    });
    $("check").textContent="Проверить ответы";
  }
  $("quiz").addEventListener("submit",ev=>{
    ev.preventDefault();submitted=true;
    const fd=new FormData($("quiz")), answers=qs.map((q,i)=>{const a=fd.get("q"+i);return a===null?null:q.options[Number(a)];});
    const score=qs.filter((q,i)=>q.answer===answers[i]).length;
    const blanks=answers.filter(x=>x===null).length;
    const results=$("results");results.replaceChildren();results.hidden=false;
    add(results,"h2",`Результат: ${score} из ${qs.length}`);
    if(blanks)add(results,"p",`Без ответа: ${blanks}. Они не засчитаны.`);
    else saveScore(week,score);
    qs.forEach((q,i)=>{
      const ok=q.answer===answers[i];
      $("quiz").children[i].className="question "+(ok?"correct":"wrong");
      const card=add(results,"article",undefined,ok?"review":"review wrong");
      add(card,"h3",`№ ${i+1} · ${ok?"верно":answers[i]===null?"без ответа":"ошибка"} · ${q.level}`);
      add(card,"p",bank.topics[q.topic-1]);
      add(card,"p",`Твой ответ: ${answers[i]??"—"}. Правильный: ${q.answer}.`);
      add(card,"p",q.solution);
    });
    results.focus();
  });
  $("retry").addEventListener("click",()=>{
    if(!submitted&&$("quiz").querySelector(":checked")&&!window.confirm("Начать другой набор? Текущие ответы будут сброшены."))return;
    attempt++;render();$("weekTitle").scrollIntoView({block:"start"});
  });
  $("printBtn").addEventListener("click",()=>window.print());
  render();
})();
