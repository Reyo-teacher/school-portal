(function(root){
"use strict";
function scoreMulti(correct, selected) {
  const got = [...new Set(selected)];
  const right = got.filter(i => correct.includes(i)).length;
  const wrong = got.length - right;
  if (right === correct.length && wrong === 0) return 2;
  if (wrong >= 2 || right === 0) return 0;
  return (correct.length === 3 ? right >= 2 : right >= 1) ? 1 : 0;
}
function scoreItem(q, selection){
  if(q.type==="single") return selection===q.answer ? 1 : 0;
  if(q.type==="multi") return scoreMulti(q.answer,selection);
  return q.answer.filter((v,i)=>v===selection[i]).length;
}
if(typeof module==="object"){module.exports={scoreMulti,scoreItem};return;}
const $=id=>document.getElementById(id);
const el=(parent,tag,text,cl)=>{
  const o=document.createElement(tag);
  if(text!==undefined)o.textContent=text;
  if(cl)o.className=cl;
  parent.appendChild(o);return o;
};
const say={"2":"Степени и корни","3":"Преобразование выражений","4":"Линейные и квадратные уравнения","5":"Дробно-рациональные уравнения","6":"Иррациональные уравнения","7":"Показательные уравнения","8":"Логарифмы","9":"Логарифмические уравнения","10":"Единичная окружность","12":"Тригонометрические уравнения","13":"Системы уравнений","15":"Неравенства","16":"Метод интервалов","17":"Показательные неравенства","18":"Логарифмические неравенства","21":"Арифметическая прогрессия","22":"Геометрическая прогрессия","23":"Функции и графики","24":"Производная","25":"Касательная","26":"Экстремумы","27":"Интегралы","28":"Моделирование","29":"Планиметрия","30":"Окружность и векторы на плоскости","31":"Стереометрия и векторы"};
const getVariant = () => Number(location.hash.match(/^#variant-([12])$/)?.[1]||0);
const parts={0:["Один правильный ответ","В каждом задании выбери один вариант."],25:["Один ответ по общему контексту","Прочитай общий текст. Для каждого задания выбери один ответ."],30:["Один или несколько правильных ответов","Отметь все верные варианты. Верных ответов может быть от одного до трёх."] ,35:["Соответствие","Для каждой строки выбери подходящий ответ."]};
let version=0, activeExam=null, submitted=false;
const attempts=new Map();
const attemptFor=v=>attempts.get(v)||0;
const attemptKey=v=>"school-portal:mp-mock-attempt:"+v;
function openAttempt(v){
  let n=0;
  try{n=Number(localStorage.getItem(attemptKey(v)));}catch{}
  if(!Number.isSafeInteger(n)||n<0||n>2000000000)n=0;
  setAttempt(v,n);
}
function setAttempt(v,n){
  attempts.set(v,n);
  try{localStorage.setItem(attemptKey(v),String(n+1));}catch{}
}
function nextSet(){
  if(!version)return;
  const paper=$("paper");
  if(!submitted&&(paper.querySelector("input:checked")||[...paper.querySelectorAll("select")].some(x=>x.value))&&!window.confirm("Начать новый набор? Текущие ответы будут сброшены."))return;
  setAttempt(version,attemptFor(version)+1);render();$("name").scrollIntoView({block:"start"});
}
function render(){
 const v=getVariant();
 if(v&&v!==version)openAttempt(v);
 version=v;submitted=false;
 $("choose").hidden=!!v;$("exam").hidden=!v;
 if(!v)return;
 const original=root.MP_MOCKS[v-1],attempt=attemptFor(v);
 activeExam=attempt&&root.ProfilePractice?.freshMock ? root.ProfilePractice.freshMock(original,v,attempt) : original;
 if(activeExam!==original&&root.ProfileMockSections?.fresh)activeExam=root.ProfileMockSections.fresh(activeExam,v,attempt);
 const {context,questions}=activeExam;
 const paper=$("paper"),res=$("result");paper.replaceChildren();res.replaceChildren();res.hidden=true;
 $("name").textContent="Вариант "+v+(activeExam!==original?" · новый набор "+attempt:"");
 questions.forEach((q,i)=>{
   if(parts[i]){
     el(paper,"h3",parts[i][0],"part");el(paper,"p",parts[i][1]);
     if(i===25){const box=el(paper,"aside",undefined,"context");el(box,"strong","Общий контекст");el(box,"p",context);}
   }
   const f=el(paper,"fieldset");el(f,"legend","Задание "+(i+1));el(f,"p",q.q);
   if(q.type==="match"){
     const reference=el(f,"ol",undefined,"match-options");q.options.forEach((op,k)=>el(reference,"li","АБВГ"[k]+". "+op));
     q.rows.forEach((row,j)=>{
       const l=el(f,"label",undefined,"pair");el(l,"span",(j+1)+". "+row);
       const select=el(l,"select");select.name="q"+i+"_"+j;el(select,"option","Выбери ответ").value="";
       q.options.forEach((op,k)=>{el(select,"option","АБВГ"[k]+". "+op).value=String(k);});
     });
   }else{
     const answers=el(f,"div",undefined,"answers");
     q.options.forEach((op,k)=>{
       const l=el(answers,"label");const input=el(l,"input");input.type=q.type==="single"?"radio":"checkbox";input.name="q"+i;input.value=String(k);
       el(l,"span","АБВГДЕ"[k]+". "+op);
     });
   }
 });
 const act=el(paper,"div",undefined,"actions");
 el(act,"button","Завершить и проверить").type="submit";
 const print=el(act,"button","Распечатать задания");print.type="button";print.addEventListener("click",()=>window.print());
 el(act,"a","К выбору вариантов").href="#/";
}
$("paper").addEventListener("submit",ev=>{
 ev.preventDefault();if(!version||!activeExam)return;
 submitted=true;
 const qs=activeExam.questions,fd=new FormData($("paper"));
 const res=$("result");res.replaceChildren();res.hidden=false;
 let points=0, blanks=0;
 const totals={},details=[];
 qs.forEach((q,i)=>{
   const raw=fd.get("q"+i);
   const ans=q.type==="single"?(raw===null?-1:Number(raw)):q.type==="multi"?fd.getAll("q"+i).map(Number):
      q.rows.map((_,j)=>{const val=fd.get("q"+i+"_"+j);return val===""||val===null?-1:Number(val);});
   const blank=q.type==="single"?ans===-1:q.type==="multi"?ans.length===0:ans.every(x=>x===-1);
   if(blank)blanks++;
   const max=q.type==="single"?1:2,score=scoreItem(q,ans);
   points+=score;totals[q.topic]=(totals[q.topic]||0)+max-score;
   details.push([q,i,score,max,blank]);
 });
 el(res,"h2","Результат: "+points+" из 50");
 if(blanks)el(res,"p","Без ответа: "+blanks+" из 40.");
 const guide=el(res,"section",undefined,"repeat");
 const allGaps=Object.entries(totals).filter(([,loss])=>loss>0).sort((a,b)=>b[1]-a[1]);
 root.PortalResultShare?.mount(res,{subject:"Профильная математика",title:"Пробный ЕНТ. "+$("name").textContent,score:points,max:50,topics:allGaps.map(([n])=>say[n]||"Занятие "+n),blank:blanks});
 if(root.ProfilePractice?.freshMock){
   const controls=el(res,"div",undefined,"actions");
   const retry=el(controls,"button","Решить новый набор");retry.type="button";
   retry.addEventListener("click",nextSet);
 }
 const gaps=allGaps.slice(0,5);
 el(guide,"h3",gaps.length?"Что повторить":"Все задания решены верно");
 if(gaps.length){
   const list=el(guide,"ul");
   gaps.forEach(([n,loss])=>{
     const row=el(list,"li");
     el(row,"a",say[n]||"Занятие "+n).href="mp-format.html#/t/"+n;
     row.append(" · потеряно баллов: "+loss);
   });
 }
 if(version===1)el(guide,"a","К занятию 33: работа над ошибками").href="mp-format.html#/t/33";
 details.forEach(([q,i,p,max,blank])=>{
   const card=el(res,"article",undefined,"review"+(p===max?"":p?" partial":" miss"));
   el(card,"h3","№ "+(i+1)+" · "+p+"/"+max+(blank?" · без ответа":""));
   const correct=q.type==="single"?q.options[q.answer]:q.type==="multi"?q.answer.map(j=>q.options[j]).join("; "):
      q.rows.map((row,k)=>row+" → "+q.options[q.answer[k]]).join("; ");
   el(card,"p","Верный ответ: "+correct);
   el(card,"p",q.explain);
 });
 res.focus();
});
const fresh=$("fresh");
fresh.hidden=!root.ProfilePractice?.freshMock;
fresh.addEventListener("click",nextSet);
addEventListener("hashchange",()=>{render();window.scrollTo(0,0);});
render();
})(typeof window!=="undefined"?window:null);
