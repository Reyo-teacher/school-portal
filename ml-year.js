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
    ["Числа, уравнения и данные",5],["Статистика и зависимости",9],
    ["Закономерности, вероятность и время",13],["Геометрия и итоговое повторение",17]];
  const raw=new URL(location.href).searchParams.get("week"),week=Number(raw);
  if(!raw||!Number.isInteger(week)||week<1||week>34){
    $("map").hidden=false;
    add($("map"),"p","На нечётной неделе изучаем тему. На чётной решаем 10 задач по изученному: сначала новой темы, затем и более ранних. Чем дальше по курсу, тем шире повторение.","section-note");
    let i=0;
    for(const [title,limit] of phases){
      const phase=add($("map"),"section",undefined,"phase");add(phase,"h2",title);const grid=add(phase,"div",undefined,"pairs");
      for(;i<limit;i++){
        const pair=add(grid,"article",undefined,"pair");add(pair,"h3",bank.topics[i]);
        const one=add(pair,"a",`Неделя ${2*i+1} · Тема`);one.href="?week="+(2*i+1);
        const two=add(pair,"a",i===0?"Неделя 2 · Закрепление":i===16?"Неделя 34 · Итоговый пробник":`Неделя ${2*i+2} · Смешанный тест`,"mixed");two.href="?week="+(2*i+2);
      }
    }
    return;
  }
  let attempt=0,qs=[],submitted=false;
  const i=Math.ceil(week/2)-1, thematic=week%2===1;
  $("toMap").hidden=false;$("work").hidden=false;
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
