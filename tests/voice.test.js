const test=require('node:test');
const assert=require('node:assert/strict');
const voice=require('../lesson-voice.js');
const game=require('../lesson-adventure.js');
const fs=require('node:fs');
const path=require('node:path');
function fakeHost(){
  const spoken=[],events={},documentEvents={},storage=new Map();let canceled=0;
  const host={
    SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},
    speechSynthesis:{list:[{name:'English',lang:'en-US',default:true,localService:true},{name:'Русский',lang:'ru-RU',localService:true}],getVoices(){return this.list;},speak(u){spoken.push(u);u.onstart?.();},cancel(){canceled++;},addEventListener:(name,fn)=>events[name]=fn,removeEventListener:name=>delete events[name]},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    addEventListener:(name,fn)=>events[name]=fn,removeEventListener:name=>delete events[name],
    document:{hidden:false,addEventListener:(name,fn)=>documentEvents[name]=fn,removeEventListener:name=>delete documentEvents[name]}
  };
  return {host,spoken,events,documentEvents,storage,canceled:()=>canceled};
}
function fakePanel(){
  const elements={},handlers={};
  const panel={innerHTML:'',classList:{toggle(){}},querySelector:s=>elements[s]||(elements[s]={value:'',checked:false,disabled:false,textContent:''}),addEventListener:(name,fn)=>handlers[name]=fn};
  return {panel,elements,change(selector,value){const target=elements[selector];if(typeof value==='boolean')target.checked=value;else target.value=value;handlers.change({target});},click(action){const button=elements[`[data-voice-action="${action}"]`];button.dataset={voiceAction:action};button.closest=()=>button;handlers.click({target:button});}};
}
test('speech reads mathematical notation in Russian instead of letter codes and abbreviations',()=>{
  assert.equal(voice.speechText('O(0), A(3), B(2). OA = 6 см.'),'О с координатой нуль, А с координатой 3, Бэ с координатой 2. О А равно 6 сантиметров.');
  assert.equal(voice.speechText('1 см, 2 см, 12 см, 21 см. 2 + 2 + 2 см.'),'1 сантиметр, 2 сантиметра, 12 сантиметров, 21 сантиметр. 2 плюс 2 плюс 2 сантиметра.');
  assert.match(voice.speechText('Отрезок O–1. От O до A.'),/О — один/);
});
test('all variants narrate instructions and choices without revealing diagram answers or unopened hints',()=>{
  for(const kind of ['naturals','ray'])for(let round=0;round<3;round++)for(const step of game.makeSteps(kind,round)){
    const text=voice.stepText(step);assert.ok(text.length>20&&text.length<700);
    assert.ok(!text.includes('undefined'));assert.ok(!text.includes('<svg'));
    assert.notEqual(text,voice.speechText(step.success));
    if(step.options&&step.type!=='pairs')for(const option of step.options)assert.ok(text.includes(voice.speechText(option[1])));
    assert.equal(voice.stepText(step,{solved:true}),voice.speechText(step.success));
    assert.equal(voice.stepText(step,{hint:true}),voice.speechText('Подсказка. '+step.hint));
    if(step.id==='count')assert.ok(!text.includes(`В корзине ${step.count} яблок`));
    if(step.id==='read')assert.ok(!text.includes(`От О до А — ${step.marker}`));
  }
  const build=game.makeSteps('ray')[3];assert.match(voice.stepText(build,{oneSet:true}),/Теперь отметь А с координатой 3/);
});
test('Russian voice selection prefers installed Russian voices and never chooses English',()=>{
  const list=[{lang:'en-US',default:true,localService:true},{lang:'ru-RU',name:'Remote',localService:false},{lang:'ru_RU',name:'Local',localService:true}];
  assert.equal(voice.chooseVoice(list).name,'Local');assert.equal(voice.chooseVoice([list[0]]),null);
  assert.equal(voice.chooseVoice([]),null);
});
test('a new utterance cancels old speech and ignores stale completion or error events',()=>{
  const env=fakeHost(),speaker=voice.createSpeaker(env.host);
  assert.equal(speaker.speak('Первый шаг'),true);const old=env.spoken[0];
  assert.equal(old.lang,'ru-RU');assert.equal(old.voice.lang,'ru-RU');assert.equal(speaker.state().busy,true);
  speaker.speak('Второй шаг',0.8);const next=env.spoken[1];assert.equal(next.rate,0.8);assert.ok(env.canceled()>=2);
  old.onend();old.onerror({error:'interrupted'});assert.equal(speaker.state().busy,true);assert.equal(speaker.state().error,'');
  next.onend();assert.equal(speaker.state().busy,false);
  speaker.speak('Третий шаг');speaker.stop();assert.equal(speaker.state().busy,false);
  env.spoken[2].onerror({error:'canceled'});assert.equal(speaker.state().error,'');
});
test('missing support or Russian voices leaves a readable fallback and handles late voices',()=>{
  const missing=voice.createSpeaker({});assert.equal(missing.speak('Привет'),false);assert.equal(missing.state().available,false);
  const env=fakeHost();env.host.speechSynthesis.list=[{lang:'en-US'}];const speaker=voice.createSpeaker(env.host);
  assert.equal(speaker.speak('Привет'),false);assert.equal(env.spoken.length,0);assert.match(speaker.state().error,/Русский голос/);
  env.host.speechSynthesis.list=[{lang:'ru-RU'}];env.events.voiceschanged();assert.equal(speaker.state().error,'');assert.equal(speaker.speak('Привет'),true);
  env.spoken[0].onerror({error:'not-allowed'});assert.equal(speaker.state().busy,false);assert.match(speaker.state().error,/Послушать/);
  speaker.destroy();assert.ok(!env.events.voiceschanged);
  const loading=fakeHost();loading.host.speechSynthesis.list=[];const waiting=voice.createSpeaker(loading.host);assert.equal(waiting.speak('Привет'),true);assert.equal(loading.spoken[0].lang,'ru-RU');
});
test('controls are silent on load, persist auto mode and tempo, permit manual replay and stop on page hide',()=>{
  const env=fakeHost(),ui=fakePanel();let text='Первое задание';
  const reader=voice.mount(ui.panel,()=>text,env.host);
  assert.equal(env.spoken.length,0);reader.read(text);assert.equal(env.spoken.length,1);
  ui.change('[data-voice-auto]',false);assert.equal(env.spoken.length,1);assert.equal(ui.elements['[data-voice-action="stop"]'].disabled,true);
  reader.read('Не читать автоматически');assert.equal(env.spoken.length,1);
  text='Новое задание';ui.click('listen');assert.equal(env.spoken.at(-1).text,text);
  ui.change('[data-voice-rate]','0.8');assert.equal(env.spoken.at(-1).rate,0.8);
  ui.click('stop');assert.equal(ui.elements['[data-voice-action="stop"]'].disabled,true);
  const p=JSON.parse(env.storage.get('portal_owl_voice_v1'));assert.deepEqual(p,{auto:false,rate:0.8});
  const other=fakePanel();const second=voice.mount(other.panel,()=>text,env.host);assert.equal(other.elements['[data-voice-auto]'].checked,false);assert.equal(other.elements['[data-voice-rate]'].value,'0.8');
  second.destroy();ui.change('[data-voice-auto]',true);ui.click('listen');
  // Recreate the listener owner after testing the second mount.
  reader.destroy();const last=voice.mount(ui.panel,()=>text,env.host);ui.click('listen');
  env.host.document.hidden=true;env.documentEvents.visibilitychange();assert.equal(ui.elements['[data-voice-action="stop"]'].disabled,true);
  env.events.pagehide();last.destroy();assert.ok(!env.events.pagehide);assert.ok(!env.documentEvents.visibilitychange);
});
test('audio preferences are bounded and the voice script loads before the game on both pages',()=>{
  assert.deepEqual(voice.preferences({rate:99,auto:'yes'}),{auto:true,rate:0.95});
  for(const file of ['topic-5-1-1.html','topic-5-1-2.html']){
    const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
    assert.ok(html.indexOf('src="lesson-voice.js"')<html.indexOf('src="lesson-adventure.js"'));
    assert.match(html,/<script src="lesson-voice.js" defer><\/script>/);
  }
});
