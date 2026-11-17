const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const practice = require('../lesson-practice.js');
const widgets = require('../lesson-widgets.js');
const root = path.resolve(__dirname,'..');
function loadLesson(filename,random=Math.random){
  const html=fs.readFileSync(path.join(root,filename),'utf8');
  const elements={};const fake=s=>elements[s]||(elements[s]={value:s==='#demo'?'12050':s==='#ra'?'3':s==='#rb'?'8':'',addEventListener(){}});
  let config;
  const math=Object.create(Math);math.random=random;
  const context=vm.createContext({document:{querySelector:fake},Math:math,LessonPractice:{start:c=>{config=c;}}});
  for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(match[1],context,{timeout:3000});
  return {config,context,html};
}
function rightValues(task){return Object.fromEntries(practice.fields(task).map(f=>[f.id,String(f.answer)]));}
test('all live generators produce valid fields, answers, skill bindings and feedback',()=>{
  for(const filename of ['topic-5-1-1.html','topic-5-1-2.html']){
    const {config}=loadLesson(filename);assert.equal(config.G.length,config.LV.length);
    for(let run=0;run<500;run++)for(let i=0;i<config.G.length;i++){
      const task=config.G[i]();assert.ok(config.skills[task.skill],task.skill);assert.ok(task.html);assert.ok(task.hint);
      const fields=practice.fields(task);assert.equal(new Set(fields.map(f=>f.id)).size,fields.length);
      const correct=rightValues(task);assert.equal(practice.grade(task,correct).ok,true,`${filename} task ${i}`);
      assert.equal(practice.grade(task,{}).empty,true);
      for(const field of fields){
        if(field.type==='choice'){assert.ok(field.options.some(o=>o.value===field.answer));const other=field.options.find(o=>o.value!==field.answer);assert.equal(practice.grade(task,{...correct,[field.id]:other.value}).ok,false);}
        else {assert.ok(Number.isSafeInteger(Number(field.answer)));assert.ok(Number(field.answer)>=0);assert.equal(practice.grade(task,{...correct,[field.id]:String(Number(field.answer)+1)}).ok,false);}
      }
    }
  }
});
test('minimum and maximum generated values remain answerable',()=>{
  for(const random of [()=>0,()=>0.999999])for(const filename of ['topic-5-1-1.html','topic-5-1-2.html']){
    const {config}=loadLesson(filename,random);
    for(const make of config.G){const t=make();assert.equal(practice.grade(t,rightValues(t)).ok,true);}
  }
});
test('grading accepts grouping spaces, checks canonical notation and rejects invalid formats',()=>{
  const t={ans:'12050',hint:'Разряды'};
  for(const answer of ['12 050','12\u00a0050','12\u202f050'])assert.equal(practice.grade(t,{answer}).ok,true);
  for(const answer of ['','  ','12.05','-1','1e4','12050 тг','Infinity'])assert.equal(practice.grade(t,{answer}).empty,true);
  assert.equal(practice.grade(t,{answer:'1250'}).ok,false);
  assert.equal(practice.grade(t,{answer:'0012050'}).ok,false);
  assert.equal(practice.grade({ans:'0'},{answer:'0'}).ok,true);
});
test('zero, parity, currency and place-value tasks agree with their scenarios',()=>{
  const {config}=loadLesson('topic-5-1-1.html');
  for(let n=0;n<1000;n++){
    const pairs=config.G[1](),p=rightValues(pairs),count=Number(pairs.html.match(/<strong>(\d+)<\/strong>/)[1]);
    assert.equal(Number(p.pairs)*2+Number(p.left),count);assert.equal(count%2,1);assert.equal(p.parity,'odd');
    const even=config.G[2](),ev=Number(even.html.match(/<strong>(\d+)<\/strong>/)[1]);assert.equal(ev%2,0);
    const cheque=config.G[6](),amounts=[...cheque.html.matchAll(/<strong>([\d\s\u00a0]+) тг<\/strong>/g)].map(m=>Number(m[1].replace(/\s/g,'')));
    assert.equal(Number(rightValues(cheque).sum),amounts[0]);assert.notEqual(amounts[0],amounts[1]);
    const views=config.G[7]();assert.ok(!views.html.includes('стадион'));assert.ok(Number(views.ans)<=100000);
  }
});
test('unit conversion and coordinate-versus-distance feedback use correct quantities',()=>{
  const {config}=loadLesson('topic-5-1-2.html');
  for(let n=0;n<1000;n++){
    const t=config.G[1](),v=rightValues(t),nums=[...t.html.matchAll(/<strong>(\d+)(?: см)?<\/strong>/g)].map(m=>Number(m[1]));
    assert.equal(Number(v.length),nums[0]*nums[1]);assert.equal(Number(v.coordinate),nums[1]);
    const sensor=config.G[5](),a=[...sensor.html.matchAll(/<strong>(\d+) м<\/strong>/g)].map(m=>Number(m[1]));
    assert.equal(Number(rightValues(sensor).coordinate),a[1]/a[0]);
    const wrong=practice.grade(sensor,{...rightValues(sensor),coordinate:String(a[1])});assert.equal(wrong.ok,false);assert.match(wrong.message,/метры/);
  }
});
test('ray construction checks origin, direction, unit and point independently',()=>{
  for(let unit=1;unit<=2;unit++)for(let coord=2;coord<=6;coord++)for(let origin=0;origin<=4;origin++){
    const task={unit,coord,name:'A'},correct={origin,one:origin+unit,point:origin+unit*coord,direction:'right'};
    assert.equal(widgets.checkBuild(correct,task).ok,true);
    for(const bad of [{direction:'left'},{one:origin+unit+1},{point:origin+unit*coord+1},{origin:''},{one:-1},{point:21},{point:2.5}])assert.equal(widgets.checkBuild({...correct,...bad},task).ok,false);
  }
  assert.equal(widgets.checkBuild({origin:5,one:7,point:11,direction:'right'},{unit:2,coord:3,name:'A'}).ok,false);
  assert.equal(widgets.checkBuild({origin:'',one:2,point:6,direction:'right'},{unit:2,coord:3,name:'A'}).empty,true);
  assert.equal(widgets.checkBuild({origin:0,one:2,point:2.5,direction:'right'},{unit:2,coord:3,name:'A'}).empty,true);
});
test('evidence records distinguish support and do not reward a repeated variant',()=>{
  const r={};assert.equal(practice.addEvidence(r,'parity','one',false),true);
  assert.equal(practice.addEvidence(r,'parity','one',true),false);
  assert.equal(practice.addEvidence(r,'parity','two',true),true);
  assert.deepEqual(r.parity,{independent:['two'],supported:['one']});
  assert.equal(practice.addEvidence(r,'build','one',true),true);
  assert.equal(practice.addEvidence({parity:7},'parity','one',true),true);
});
test('number reading preserves zero place holders in displayed examples',()=>{
  const {context}=loadLesson('topic-5-1-1.html');
  assert.equal(vm.runInContext('words(12050)',context),'двенадцать тысяч пятьдесят');
  assert.equal(vm.runInContext('words(0)',context),'нуль');
  assert.equal(vm.runInContext('words(1000001)',context),'один миллион один');
});
