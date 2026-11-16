/* Russian text-to-speech for the learning route. No microphone or audio recording. */
(function(root){
  'use strict';
  const KEY='portal_owl_voice_v1';
  function wordForm(n,forms){const d=n%10,m=n%100;return forms[m>=11&&m<=19?2:d===1?0:d>=2&&d<=4?1:2];}
  function speechText(text){
    return String(text||'')
      .replace(/\b([AOB])\((\d+)\)/g,(_,p,n)=>({A:'А',O:'О',B:'Бэ'}[p])+' с координатой '+(n==='0'?'нуль':n))
      .replace(/\bOA\b/g,'О А').replace(/\bO[–−-]1\b/g,'О — один')
      .replace(/\b[ABO]\b/g,p=>({A:'А',B:'Бэ',O:'О'}[p]))
      .replace(/(\d+)\s*см(?![а-яё])/gi,(_,n)=>n+' '+wordForm(Number(n),['сантиметр','сантиметра','сантиметров']))
      .replace(/\sсм(?![а-яё])/gi,' сантиметров')
      .replace(/\+/g,' плюс ').replace(/=/g,' равно ').replace(/→/g,' вправо ')
      .replace(/[🦉🔊💡★✓]/gu,'').replace(/\s+/g,' ').trim();
  }
  function stepText(step,state={}){
    if(state.solved)return speechText(step.success);
    if(state.hint)return speechText('Подсказка. '+step.hint);
    if(step.type==='pairs'&&state.pairsReady)return speechText((step.count%2?'Один участник остался без пары.':'У каждого есть пара.')+` ${step.count} — чётное или нечётное число?`);
    if(step.type==='build'&&state.oneSet)return speechText(`Единичный отрезок выбран. Теперь отметь A(${step.target}).`);
    let text=step.title+'. '+step.note+' '+step.prompt;
    if(step.options&&step.type!=='pairs')text+=' Варианты ответа: '+step.options.map(o=>o[1]).join('; ')+'.';
    if(step.type==='build')text+=' Сначала нажми, где будет точка один.';
    // Do not read image descriptions, coordinates hidden in diagrams, or answer keys.
    return speechText(text);
  }
  function chooseVoice(voices){
    return [...voices].filter(v=>/^ru(?:[-_]|$)/i.test(v.lang||''))
      .sort((a,b)=>(Number(!!b.localService)*4+Number(!!b.default)*2+Number(/^ru[-_]RU$/i.test(b.lang)))-(Number(!!a.localService)*4+Number(!!a.default)*2+Number(/^ru[-_]RU$/i.test(a.lang))))[0]||null;
  }
  function preferences(value){
    return {auto:value&&typeof value.auto==='boolean'?value.auto:true,rate:value&&[0.8,0.95].includes(value.rate)?value.rate:0.95};
  }
  function createSpeaker(host,onChange=()=>{}){
    const synth=host.speechSynthesis,available=!!(synth&&typeof synth.speak==='function'&&typeof synth.cancel==='function'&&typeof host.SpeechSynthesisUtterance==='function');
    let generation=0,current=null,busy=false,error='';
    const voices=()=>{try{return synth?.getVoices?.()||[];}catch(_){return [];}};
    function snapshot(){const list=voices();return {available,busy,error,hasRussian:!!chooseVoice(list),voicesKnown:list.length>0};}
    const emit=()=>onChange(snapshot());
    function stop(){generation++;current=null;busy=false;if(available){try{synth.cancel();}catch(_){}}emit();}
    function speak(text,rate=0.95){
      stop();error='';
      if(!available){error='Озвучка недоступна в этом браузере. Задания можно выполнять по тексту.';emit();return false;}
      const clean=speechText(text);if(!clean){emit();return false;}
      const list=voices(),voice=chooseVoice(list);
      if(list.length&&!voice){error='Русский голос не найден. Включи русский голос в настройках устройства или открой игру в другом браузере.';emit();return false;}
      const token=generation;
      try{
        current=new host.SpeechSynthesisUtterance(clean);current.lang='ru-RU';current.rate=[0.8,0.95].includes(rate)?rate:0.95;current.pitch=1;current.volume=1;
        if(voice)current.voice=voice;
        current.onstart=()=>{if(token!==generation)return;busy=true;emit();};
        current.onend=()=>{if(token!==generation)return;current=null;busy=false;emit();};
        current.onerror=event=>{
          if(token!==generation)return;
          current=null;busy=false;
          if(!['canceled','interrupted'].includes(event.error))error=['language-unavailable','voice-unavailable'].includes(event.error)?'Русский голос недоступен. Проверь голосовые настройки устройства.':event.error==='not-allowed'?'Нажми «Послушать», чтобы браузер разрешил озвучку.':'Не удалось включить звук. Нажми «Послушать» ещё раз или продолжи по тексту.';
          emit();
        };
        busy=true;emit();synth.speak(current);return true;
      }catch(_){current=null;busy=false;error='Не удалось включить звук. Можно продолжить по тексту.';emit();return false;}
    }
    function changed(){if(chooseVoice(voices()))error='';emit();}
    if(available)synth.addEventListener?.('voiceschanged',changed);
    return {speak,stop,state:snapshot,destroy(){stop();synth?.removeEventListener?.('voiceschanged',changed);}};
  }
  function mount(panel,getText,host=root){
    let stored;try{stored=JSON.parse(host.localStorage.getItem(KEY));}catch(_){}
    const prefs=preferences(stored);
    panel.innerHTML='<div class="voice-controls"><span class="voice-owl" aria-hidden="true">🦉</span><button type="button" data-voice-action="listen" class="voice-button">🔊 Послушать</button><button type="button" data-voice-action="stop" class="voice-button" disabled>■ Стоп</button><label class="voice-auto"><input type="checkbox" data-voice-auto> Читать автоматически</label><label class="voice-rate">Темп<select data-voice-rate><option value="0.95">Обычный</option><option value="0.8">Медленнее</option></select></label></div><p class="voice-status" role="status" aria-live="polite"></p>';
    const listen=panel.querySelector('[data-voice-action="listen"]'),stop=panel.querySelector('[data-voice-action="stop"]'),auto=panel.querySelector('[data-voice-auto]'),rate=panel.querySelector('[data-voice-rate]'),status=panel.querySelector('.voice-status');
    auto.checked=prefs.auto;rate.value=String(prefs.rate);
    function update(state){
      listen.disabled=!state.available;stop.disabled=!state.busy;auto.disabled=!state.available;rate.disabled=!state.available;
      panel.classList.toggle('is-speaking',state.busy);
      status.textContent=state.error||(!state.available?'В этом браузере нет озвучки. Читай задания на экране.':state.busy?'Сова читает…':state.voicesKnown&&!state.hasRussian?'Русский голос не найден. Проверь голосовые настройки устройства.':prefs.auto?'Сова прочитает задание после нажатия «Начать игру» или «Дальше».':'Нажми «Послушать», когда захочешь услышать задание.');
    }
    const speaker=createSpeaker(host,update);
    function save(){try{host.localStorage.setItem(KEY,JSON.stringify(prefs));}catch(_){}}
    panel.addEventListener('click',event=>{
      const button=event.target.closest('[data-voice-action]');if(!button||button.disabled)return;
      if(button.dataset.voiceAction==='listen')speaker.speak(getText(),prefs.rate);
      if(button.dataset.voiceAction==='stop')speaker.stop();
    });
    panel.addEventListener('change',event=>{
      if(event.target===auto){prefs.auto=auto.checked;save();if(prefs.auto)speaker.speak(getText(),prefs.rate);else speaker.stop();update(speaker.state());}
      if(event.target===rate){prefs.rate=preferences({rate:Number(rate.value)}).rate;save();if(speaker.state().busy)speaker.speak(getText(),prefs.rate);}
    });
    const hide=()=>{if(host.document?.hidden)speaker.stop();};
    host.document?.addEventListener?.('visibilitychange',hide);
    const pagehide=()=>speaker.stop();
    host.addEventListener?.('pagehide',pagehide);
    update(speaker.state());
    return {stop:()=>speaker.stop(),read(text){if(prefs.auto)speaker.speak(text,prefs.rate);},destroy(){speaker.destroy();host.document?.removeEventListener?.('visibilitychange',hide);host.removeEventListener?.('pagehide',pagehide);}};
  }
  const api={speechText,stepText,chooseVoice,preferences,createSpeaker,mount};root.LessonVoice=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
