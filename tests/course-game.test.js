const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const game=require('../course-game.js');
const root=path.resolve(__dirname,'..');
const registry=JSON.parse(fs.readFileSync(path.join(root,'data/grade-5-games.json'))).lessons;
function load(n){const html=fs.readFileSync(path.join(root,`lesson-5-${String(n).padStart(3,'0')}.html`),'utf8');return JSON.parse(html.match(/<script id="course-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);}
test('every ready course lesson has three complete variants with distinct task IDs and valid answers',()=>{
 const ids=new Set();
 for(const n of registry.filter(n=>![4,5].includes(n))){const d=load(n);assert.equal(d.number,n);assert.equal(d.variants.length,3);assert.ok(d.notes.length>=2&&d.paper&&d.example.length===2);
  for(const variant of d.variants){assert.equal(variant.length,6);for(const t of variant){assert.ok(!ids.has(t.id));ids.add(t.id);assert.ok(t.prompt&&t.hint&&t.success&&t.note);const answer=t.type==='sequence'?Array.from({length:t.count},(_,i)=>t.start+(i+1)*3).join(' '):t.answer;assert.equal(game.grade(t,answer).ok,true,`${n}/${t.id}`);if(t.options)assert.equal(new Set(t.options).size,t.options.length);if(t.type==='choice')assert.ok(t.options.includes(t.answer));if(t.type==='number'){assert.ok(Number.isFinite(game.numeric(t.answer)));assert.ok(game.grade(t,{}).empty||game.grade(t,{}).format);}if(t.check){const [a,b]=t.check.args.map(game.numeric);const expected={'+':a+b,'−':a-b,'×':a*b,'÷':a/b}[t.check.op];assert.ok(Math.abs(expected-game.numeric(t.answer))<1e-9,t.id);}}}
 }
});
test('fraction and decimal input is equivalent while empty and malformed input cannot pass',()=>{
 for(const v of ['0,5','0.5','1/2','2/4'])assert.equal(game.grade({type:'number',answer:'1/2'},v).ok,true);
 assert.equal(game.numeric('1 1/2'),1.5);
 for(const v of ['', 'abc','1/0','NaN','2/3/4'])assert.equal(game.grade({type:'number',answer:'1'},v).empty,true);
 assert.equal(game.grade({type:'number',answer:'2'},'3').ok,false);
});
test('selection, ordering and invented sequences check the intended action',()=>{
 assert.equal(game.grade({type:'multi',answer:['2','4']},['4','2']).ok,true);
 assert.equal(game.grade({type:'multi',answer:['2','4']},['2']).ok,false);
 assert.equal(game.grade({type:'order',answer:['2','4']},['4','2']).ok,false);
 const t={type:'sequence',start:2,count:4};assert.equal(game.grade(t,'5 8 11 14').ok,true);assert.equal(game.grade(t,'4 6 8 10').ok,true);assert.equal(game.grade(t,'5 8 11 15').ok,false);assert.equal(game.grade(t,'2 2 2 2').ok,false);
});
test('course data contains no duplicate copies of the same lesson across repeated hours',()=>{
 const seen=new Map();for(const n of registry.filter(n=>![4,5].includes(n))){const d=load(n);const signature=JSON.stringify(d.variants[0].map(t=>[t.prompt,t.answer]));assert.ok(!seen.has(signature),`${n} duplicates ${seen.get(signature)}`);seen.set(signature,n);}
});

test('cube nets accept folds and reject overlaps, wrong counts and disconnected cells',()=>{
 const valid=['1,0','0,1','1,1','2,1','3,1','1,2'];
 assert.equal(game.cubeNet(valid),true);
 assert.equal(game.cubeNet(valid.map(c=>{const [x,y]=c.split(',').map(Number);return `${3-y},${x}`;})),true);
 assert.equal(game.cubeNet(['0,0','1,0','2,0','0,1','1,1','2,1']),false);
 assert.equal(game.cubeNet(['0,0','1,0','2,0','3,0','4,0','5,0']),false);
 assert.equal(game.cubeNet(['0,0','1,0','2,0','3,0','4,0','9,9']),false);
 assert.equal(game.cubeNet(valid.slice(1)),false);
 assert.equal(game.cubeNet([...valid.slice(1),valid[1]]),false);
});
test('decimal sequences accept decimal commas and reject a changing step',()=>{
 const t={type:'sequence',decimal:true,start:0.1,count:4};
 assert.equal(game.grade(t,'0,2; 0,3; 0,4; 0,5').ok,true);
 assert.equal(game.grade(t,'0,3; 0,5; 0,7; 0,9').ok,true);
 assert.equal(game.grade(t,'0,2; 0,4; 0,6; 0,8').ok,false);
 assert.equal(game.grade(t,'; ; ;').empty,true);
});
test('diagrams render every declared model and keep obtuse-angle endpoints in view',()=>{
 for(const n of registry.filter(n=>![4,5].includes(n))){const d=load(n);for(const t of [...d.variants.flat(),...(d.practice||[])]){if(t.model){const html=game.model(t.model);assert.ok(html.includes('<'),`${n}: ${t.model.type}`);assert.ok(!html.includes('NaN'),t.id);}}}
 const obtuse=game.model({type:'angle',degrees:160,protractor:true});assert.ok(!/L-\d/.test(obtuse));assert.match(obtuse,/180/);
 assert.match(game.model({type:'fraction',n:20,d:100}),/hundred-grid/);
});

test('conversion exercises require the requested representation',()=>{
 assert.equal(game.grade({type:'number',format:'fraction',answer:'3/2'},'1 1/2').format,true);
 assert.equal(game.grade({type:'number',format:'fraction',answer:'3/2'},'1,5').format,true);
 assert.equal(game.grade({type:'number',format:'fraction',answer:'3/2'},'3/2').ok,true);
 assert.equal(game.grade({type:'number',format:'decimal',answer:'0,5'},'1/2').format,true);
 assert.equal(game.grade({type:'number',format:'decimal',answer:'0,5'},'0.5').ok,true);
});
