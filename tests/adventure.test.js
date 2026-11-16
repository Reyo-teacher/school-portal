const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const game=require('../lesson-adventure.js');

test('both routes have six distinct steps and three answerable variants',()=>{
  for(const kind of ['naturals','ray'])for(let round=0;round<3;round++){
    const steps=game.makeSteps(kind,round);
    assert.equal(steps.length,6);assert.equal(new Set(steps.map(s=>s.id)).size,6);
    for(const step of steps){
      assert.ok(step.prompt&&step.note&&step.hint&&step.success);
      if(step.options){
        assert.ok(step.options.length<=3);assert.equal(new Set(step.options.map(o=>o[0])).size,step.options.length);
        assert.equal(step.options.filter(o=>game.isCorrect(step,o[0])).length,1);
        assert.ok(step.options.some(o=>o[0]===step.answer));
      }else{
        assert.ok(Number.isInteger(step.target)&&step.target>=0&&step.target<=step.max);
        assert.equal(game.isCorrect(step,step.target),true);
        assert.equal(game.isCorrect(step,step.target+1),false);
      }
    }
  }
});
test('natural-number entry route stays small and correctly connects pairs to parity',()=>{
  for(let round=0;round<3;round++){
    const [count,zero,even,odd,last,exit]=game.makeSteps('naturals',round);
    assert.ok(count.count>=1&&count.count<=9);assert.equal(Number(count.answer),count.count);
    assert.equal(zero.count,0);assert.equal(zero.answer,'0');
    assert.equal(even.count%2,0);assert.equal(even.answer,'even');
    assert.equal(odd.count%2,1);assert.equal(odd.answer,'odd');
    assert.ok(last.count<=20);assert.equal(last.count%2,0);assert.equal(last.answer,'even');
    assert.equal(exit.count%2,1);assert.equal(exit.answer,'one');assert.notEqual(exit.count,odd.count);
  }
});
test('pair actions never duplicate a participant and leave exactly the correct remainder',()=>{
  for(let count=4;count<=9;count++){
    let state={paired:[],pending:null};
    state=game.pairClick(count,state.paired,state.pending,0);
    assert.equal(state.pending,0);
    state=game.pairClick(count,state.paired,state.pending,0);
    assert.equal(state.pending,null);assert.deepEqual(state.paired,[]);
    for(let i=0;i<count-count%2;i++)state=game.pairClick(count,state.paired,state.pending,i);
    assert.equal(state.paired.length,Math.floor(count/2)*2);
    assert.equal(new Set(state.paired).size,state.paired.length);
    assert.equal(count-state.paired.length,count%2);
    assert.equal(state.pending,null);
    assert.deepEqual(game.pairClick(count,state.paired,state.pending,0),state);
    assert.deepEqual(game.pairClick(count,state.paired,state.pending,-1),state);
    assert.deepEqual(game.pairClick(count,state.paired,state.pending,count),state);
  }
});
test('coordinate tasks distinguish cell positions, coordinates and centimetres',()=>{
  for(let round=0;round<3;round++){
    const [start,walk,read,build,length,exit]=game.makeSteps('ray',round);
    assert.equal(start.target,0);assert.equal(start.unit,1);
    assert.ok(walk.target<=5);assert.equal(read.answer,String(read.marker));
    assert.equal(build.unit,1);assert.ok(build.target>=3);
    assert.equal(Number(length.answer),length.marker*2);
    assert.equal(game.isCorrect(length,String(length.marker)),false);
    assert.equal(exit.unit,2);assert.equal(exit.target%2,0);assert.ok(exit.target<=exit.max);
    assert.equal(game.isCorrect(exit,exit.target/2),false);
  }
});
test('saved progress resumes a valid prefix and ignores corrupt, foreign or future data',()=>{
  const ids=game.makeSteps('naturals',1).map(s=>s.id);
  const saved={version:1,kind:'naturals',round:1,done:ids.slice(0,3).map((id,i)=>({id,supported:i===1}))};
  assert.deepEqual(game.restore('naturals',saved),saved);
  assert.equal(game.restore('naturals',{...saved,done:[...saved.done,{id:'wrong-step',supported:false}]}).done.length,3);
  assert.equal(game.restore('naturals',{...saved,done:[{id:ids[0],supported:'false'}]}).done.length,0);
  assert.equal(game.restore('ray',saved).done.length,0);
  assert.equal(game.restore('naturals',{...saved,version:2}).done.length,0);
  for(const value of [null,[],{},7,'broken'])assert.equal(game.restore('naturals',value).done.length,0);
  const complete={...saved,done:ids.map(id=>({id,supported:false}))};
  assert.equal(game.restore('naturals',complete).done.length,6);
});
test('replay changes the concrete examples without changing the lesson goals',()=>{
  for(const kind of ['naturals','ray']){
    const first=game.makeSteps(kind,0),next=game.makeSteps(kind,1);
    assert.deepEqual(first.map(s=>s.id),next.map(s=>s.id));
    assert.notDeepEqual(first,next);
    assert.deepEqual(game.makeSteps(kind,3),first);
  }
});
test('first view places the game before closed reference and extended-practice drawers',()=>{
  for(const [file,kind] of [['topic-5-1-1.html','naturals'],['topic-5-1-2.html','ray']]){
    const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
    const gameAt=html.indexOf('data-lesson-adventure'),referenceAt=html.indexOf('id="lesson-reference"'),extraAt=html.indexOf('id="extra-practice"');
    assert.ok(gameAt>0&&referenceAt>gameAt&&extraAt>referenceAt);
    assert.match(html,new RegExp('data-lesson="'+kind+'"'));
    for(const id of ['lesson-reference','extra-practice']){
      const tag=html.match(new RegExp('<details[^>]+id="'+id+'"[^>]*>'))[0];
      assert.ok(!/\bopen\b/.test(tag));
    }
    assert.match(html,/<script src="lesson-adventure.js" defer><\/script>/);
    assert.match(html,/<div id="trainer"><\/div>/);
  }
});

// A small DOM boundary tests event/state wiring; it does not test browser layout.
function controller(kind){
  const body={innerHTML:'',querySelector(){return {focus(){}};}};
  const feedback={textContent:'',className:''};let handler;
  const el={dataset:{lesson:kind},innerHTML:'',contains:()=>true,querySelector:s=>s==='.adventure-body'?body:feedback,addEventListener:(_,fn)=>{handler=fn;}};
  game.mount(el);
  return {body,feedback,click(attribute,value){
    const tag=[...body.innerHTML.matchAll(/<button\b([^>]*)>/g)].map(m=>m[1]).find(s=>s.includes(`${attribute}="${value}"`));
    assert.ok(tag,`Missing button ${attribute}=${value}`);
    const attrs=Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
    const dataset=Object.fromEntries(Object.entries(attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));
    const button={dataset,disabled:/\bdisabled\b/.test(tag),hasAttribute:k=>k in attrs};button.closest=()=>button;
    handler({target:button});
  }};
}
test('controller completes both routes, saves once, retries, replays and resumes',()=>{
  const before=global.localStorage,store=new Map();
  global.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
  try{
    for(const kind of ['naturals','ray']){
      const key='portal_adventure_'+kind+'_v1',ui=controller(kind),steps=game.makeSteps(kind);
      assert.ok(!ui.body.innerHTML.includes('adventure-stage'));
      ui.click('data-action','start');
      for(let i=0;i<steps.length;i++){
        const step=steps[i];assert.ok(ui.body.innerHTML.includes(step.title));
        if(step.type==='choice'){
          const wrong=step.options.find(o=>o[0]!==step.answer)[0];
          ui.click('data-answer',wrong);assert.ok(ui.feedback.textContent);assert.ok(!ui.body.innerHTML.includes('data-action="next"'));
          ui.click('data-action','hint');assert.match(ui.body.innerHTML,/aria-expanded="true"/);
          ui.click('data-answer',step.answer);
          ui.click('data-answer',step.answer); // disabled: must not add another completion
        }else if(step.type==='pairs'){
          assert.ok(!ui.body.innerHTML.includes('data-answer='));
          for(let n=0;n<step.count-step.count%2;n++)ui.click('data-person',String(n));
          ui.click('data-answer',step.answer);
        }else if(step.type==='walk'){
          for(let n=0;n<step.target;n++)ui.click('data-move','1');
        }else{
          if(step.type==='build'){
            ui.click('data-point',String(step.target));assert.ok(!ui.body.innerHTML.includes('data-action="next"'));
            ui.click('data-point','1');assert.match(ui.feedback.textContent,/отрезок выбран/);
          }
          ui.click('data-point',String(step.target));
        }
        assert.equal(JSON.parse(store.get(key)).done.length,i+1);
        assert.match(ui.feedback.className,/is-success/);
        ui.click('data-action','next');
      }
      assert.match(ui.body.innerHTML,/Маршрут завершён/);
      const replay=controller(kind);replay.click('data-action','start');assert.match(replay.body.innerHTML,/Маршрут завершён/);
      replay.click('data-action','replay');
      assert.equal(JSON.parse(store.get(key)).round,1);assert.equal(JSON.parse(store.get(key)).done.length,0);
      const first=game.makeSteps(kind,1)[0];
      replay.click(first.type==='choice'?'data-answer':'data-point',String(first.answer??first.target));
      const resume=controller(kind);assert.match(resume.body.innerHTML,/Продолжить · шаг 2/);
      resume.click('data-action','start');assert.ok(resume.body.innerHTML.includes(game.makeSteps(kind,1)[1].title));
    }
  }finally{if(before===undefined)delete global.localStorage;else global.localStorage=before;}
});
