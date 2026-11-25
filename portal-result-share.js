(function (root) {
  "use strict";
  function message({subject,title,score,max,topics=[],blank=0}) {
    const clean = v => String(v).replace(/\s+/g, " ").trim();
    const names=[...new Set(topics.map(clean).filter(Boolean))];
    const lines=[clean(subject)+" · ЕНТ",clean(title),"Результат: "+score+" из "+max+" баллов."];
    if(blank) lines.push("Без ответа: "+blank+".");
    lines.push(names.length ? "Стоит повторить: "+names.join("; ")+"."
                           : "Все задания решены верно.");
    return lines.join("\n");
  }
  function mount(host, result) {
    const text=message(result);
    const element=(tag,label,parent)=>{
      const node=document.createElement(tag);
      if(label!==undefined)node.textContent=label;
      if(parent)parent.appendChild(node);
      return node;
    };
    const box=element("details");
    box.className="portal-result-share";
    element("summary","Поделиться результатом",box);
    element("p","Проверь текст перед отправкой. Получателя выбираешь ты.",box);
    const preview=element("textarea",undefined,box);
    preview.value=text;
    preview.readOnly=true;
    preview.rows=5;
    preview.setAttribute("aria-label","Текст результата для отправки");
    const actions=element("div",undefined,box);
    actions.className="portal-share-actions";
    const whatsapp=element("a","Открыть WhatsApp",actions);
    whatsapp.href="https://wa.me/?text="+encodeURIComponent(text);
    whatsapp.target="_blank";
    whatsapp.rel="noopener noreferrer";
    const copy=element("button","Скопировать текст",actions);
    copy.type="button";
    const status=element("p","",box);
    status.className="portal-share-status";
    status.setAttribute("role","status");
    copy.addEventListener("click",async ()=>{
      try{
        if(!navigator.clipboard)throw new Error("Clipboard API unavailable");
        await navigator.clipboard.writeText(text);
        status.textContent="Текст скопирован.";
      }catch{
        preview.focus();
        preview.select();
        status.textContent="Текст выделен. Нажми Ctrl+C или выбери «Копировать».";
      }
    });
    host.appendChild(box);
  }
  if(typeof module==="object") module.exports={mount,message};
  else root.PortalResultShare={mount,message};
})(typeof window==="undefined"?null:window);
