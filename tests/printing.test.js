const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const practice=require('../lesson-practice.js'),paper=require('../course-print.js'),game=require('../course-game.js');
const root=path.resolve(__dirname,'..');
const sample={title:'Числа <пример>',code:'5.1',variant:1234,LV:['a','b'],tasks:[{html:'Вычисли 4 + 5.',ans:'9',explanation:'4 + 5 = 9.'},{html:'Выбери чётное число.',fields:[{type:'choice',label:'Число',answer:'8',options:[{value:'7',label:'7'},{value:'8',label:'8'}]}]}],exit:{title:'Проверь себя',intro:'Объясни ответ.',items:[{q:'Сколько пар из 6 предметов?',answer:'3'}]}};
test('student sheet has blanks, choices and exit task; teacher key uses the same variant',()=>{
 const student=practice.buildSheet({...sample,withKey:false}),key=practice.buildSheet({...sample,withKey:true});
 for(const html of [student,key]){assert.match(html,/Вариант № 1234/);assert.match(html,/Сколько пар из 6 предметов/);assert.match(html,/Числа &lt;пример&gt;/);}
 assert.ok(!student.includes('class="pe-key"'));assert.ok(!student.includes('☑'));assert.ok(!student.includes('Пояснение:'));
 assert.match(student,/class="pe-work"/);assert.match(key,/class="pe-key">9/);assert.match(key,/☑ 8/);assert.match(key,/Пояснение: 4 \+ 5 = 9/);
});
test('every published new lesson has a complete paper companion for every variant',()=>{
 const registry=JSON.parse(fs.readFileSync(path.join(root,'data/grade-5-games.json'))).lessons;
 for(const n of registry.filter(x=>![4,5].includes(x))){
  const html=fs.readFileSync(path.join(root,`lesson-5-${String(n).padStart(3,'0')}.html`),'utf8');
  const data=JSON.parse(html.match(/<script id="course-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.match(html,/id="course-print-panel"/);assert.match(html,/src="course-print.js"/);
  for(let round=0;round<3;round++){
   const info=paper.sheetInfo(data,round,game.model);assert.equal(info.tasks.length,6);assert.equal(info.variant,n*10+round+1);
   const a=practice.buildSheet({...info,withKey:false}),b=practice.buildSheet({...info,withKey:true});
   assert.ok(!a.includes('undefined')&&!b.includes('undefined'));assert.ok(!a.includes('☑'));assert.ok(b.includes('Ответы для учителя'));
   assert.equal((a.match(/class="print-exercise"/g)||[]).length,7);
  }
 }
});
test('paper adaptations retain instructions for selection, drawing and open-ended answers',()=>{
 const shade=paper.adapt({type:'shade',total:8,answer:3,prompt:'Закрась 3/8.',success:'3 из 8.'},game.model);assert.match(shade.vis,/fraction-piece/);assert.ok(!shade.vis.includes('filled'));
 const ray=paper.adapt({type:'ray',answer:3,unit:4,max:8,prompt:'Отметь 3/4.',success:'Готово'},game.model);assert.equal(ray.fields[0].answer,'3/4');assert.match(ray.vis,/<svg/);
 const seq=paper.adapt({type:'sequence',start:2,count:4,prompt:'Придумай правило.',success:'Готово'},game.model);assert.match(seq.fields[0].answer,/любой постоянный натуральный шаг/);
 const multi=paper.adapt({type:'multi',answer:['2','4'],options:['2','3','4'],prompt:'Выбери чётные.',success:'Готово'},game.model);assert.match(multi.vis,/Карточки: 2; 3; 4/);assert.equal(multi.fields[0].answer,'2, 4');
});
