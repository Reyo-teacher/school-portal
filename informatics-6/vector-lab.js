/* Browser vector workshop, portal informatics lessons 9–16. */
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg", INK = "http://www.inkscape.org/namespaces/inkscape";
  const W = 480, H = 320;
  const make = (tag, text, cls) => {
    const x = document.createElement(tag);
    if (text != null) x.textContent = text;
    if (cls) x.className = cls;
    return x;
  };
  const svg = (tag, attrs = {}) => {
    const x = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) x.setAttribute(key, String(value));
    return x;
  };
  const add = (parent, tag, text, cls) => parent.appendChild(make(tag, text, cls));
  const button = (text, fn, style, label) => {
    const b = make("button", text, style);
    b.type = "button";
    if (label) b.setAttribute("aria-label", label);
    b.addEventListener("click", fn);
    return b;
  };
  const field = (p, label, tag, attrs = {}) => {
    const wrap = add(p, "label", null, "vl-field");
    add(wrap, "span", label);
    const x = add(wrap, tag);
    for (const [k, v] of Object.entries(attrs)) x.setAttribute(k, String(v));
    return x;
  };
  const check = (p, label) => {
    const wrap = add(p, "label", null, "vl-check");
    const ctrl = add(wrap, "input");
    ctrl.type = "checkbox"; add(wrap, "span", label); return ctrl;
  };
  const status = p => {
    const x = add(p, "p", "", "vl-hint");
    x.setAttribute("aria-live", "polite");
    return x;
  };
  const resultBox = p => {
    const x = add(p, "section", null, "vl-result");
    x.hidden = true; x.tabIndex = -1; x.setAttribute("aria-live", "polite");
    return x;
  };
  const score = (box, rows) => {
    box.replaceChildren(); box.hidden = false;
    const count = rows.filter(r => r[0]).length;
    add(box, "h4", count === rows.length ? "Работа проверена: все условия выполнены!" : "Выполнено: " + count + " из " + rows.length);
    const ul = add(box, "ul");
    rows.forEach(([ok, label, hint]) => add(ul, "li", (ok ? "✓ " : "→ ") + (ok ? label : hint), ok ? "vl-good" : "vl-todo"));
    box.focus();
  };
  const dirty = box => { if (!box.hidden) box.hidden = true; };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const point = (x, y) => ({x, y, smooth:false});
  function download(blob, name) {
    if (!blob) return;
    const url = URL.createObjectURL(blob), a = make("a");
    a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }
  const svgBlob = node => new Blob([new XMLSerializer().serializeToString(node)], {type:"image/svg+xml;charset=utf-8"});
  function logoVector() {
    const pic = svg("svg", {viewBox:"0 0 24 18", width:24, height:18, role:"img", "aria-label":"Эмблема, векторные формы"});
    pic.append(svg("rect",{width:24,height:18,fill:"#ffffff"}), svg("path",{d:"M2 15 L10 3 L16 11 L19 7 L23 15 Z", fill:"#2b6590"}));
    return pic;
  }
  function logoRaster() {
    const c = make("canvas");
    c.width = 24; c.height = 18; c.setAttribute("role", "img");
    c.setAttribute("aria-label", "Та же эмблема из 24 на 18 пикселей");
    const ctx = c.getContext("2d", {willReadFrequently:true});
    if (!ctx) return c;
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0,24,18);
    ctx.fillStyle = "#2b6590"; ctx.beginPath();
    ctx.moveTo(2,15); ctx.lineTo(10,3); ctx.lineTo(16,11); ctx.lineTo(19,7); ctx.lineTo(23,15); ctx.closePath(); ctx.fill();
    return c;
  }
  function photoRaster() {
    const c = make("canvas");
    c.width=96; c.height=64; c.setAttribute("role","img"); c.setAttribute("aria-label","Растровый учебный пейзаж с плавными переходами цвета");
    const ctx=c.getContext("2d");
    if (!ctx) return c;
    const sky=ctx.createLinearGradient(0,0,0,64);
    sky.addColorStop(0,"#2a3668"); sky.addColorStop(.5,"#f7a080"); sky.addColorStop(1,"#2e5865");
    ctx.fillStyle=sky; ctx.fillRect(0,0,96,64);
    const halo=ctx.createRadialGradient(65,27,3,65,27,23);
    halo.addColorStop(0,"#fff3b2");halo.addColorStop(1,"#fff3b200");
    ctx.fillStyle=halo; ctx.fillRect(0,0,96,64);
    ctx.fillStyle="#37576b"; ctx.beginPath(); ctx.moveTo(0,53);ctx.lineTo(25,36);ctx.lineTo(49,52);ctx.lineTo(76,40);ctx.lineTo(96,51);ctx.lineTo(96,64);ctx.lineTo(0,64);ctx.closePath();ctx.fill();
    return c;
  }
  function rasterZoom(root) {
    add(root,"h3","Один значок, два устройства изображения");
    add(root,"p","Увеличь обе копии. Поменяй цвет гор у векторной, затем поставь два оранжевых пикселя на растровой. Сравни, что именно изменилось.");
    const controls=add(root,"div",null,"vl-row");
    const zoom=field(controls,"Увеличение","input",{type:"range",min:1,max:8,step:1,value:1});
    const zoomLabel=add(controls,"output","1×");
    const color=field(controls,"Цвет векторных гор","input",{type:"color",value:"#2b6590"});
    const panels=add(root,"div",null,"vl-comparison");
    const a=add(panels,"div",null,"vl-panel"), b=add(panels,"div",null,"vl-panel");
    add(a,"h4","Растр: 24 × 18 пикселей");
    add(b,"h4","Вектор: контур из отрезков");
    const frameA=add(a,"div",null,"vl-sample"), frameB=add(b,"div",null,"vl-sample");
    const c=logoRaster(), v=logoVector();
    c.classList.add("vl-pixels"); frameA.append(c); frameB.append(v);
    const access=add(root,"div",null,"vl-row");
    const x=field(access,"Столбец (0–23)","input",{type:"number",min:0,max:23,value:4});
    const y=field(access,"Строка (0–17)","input",{type:"number",min:0,max:17,value:4});
    const note=status(root), result=resultBox(root);
    const ctx=c.getContext("2d");
    if (!ctx) { note.textContent="Браузер не смог открыть растровый холст."; return; }
    const before=ctx.getImageData(0,0,c.width,c.height).data;
    function paint(px,py) {
      const xi=clamp(Math.round(px || 0),0,23), yi=clamp(Math.round(py || 0),0,17);
      x.value=xi; y.value=yi;
      ctx.fillStyle="#ed7419"; ctx.fillRect(xi,yi,1,1);
      note.textContent="Изменён только пиксель: столбец "+xi+", строка "+yi+".";
      dirty(result);
    }
    access.append(button("Закрасить один пиксель",()=>paint(x.valueAsNumber,y.valueAsNumber)));
    c.addEventListener("click",e=>{
      const b=c.getBoundingClientRect();
      paint(Math.floor((e.clientX-b.left)*24/b.width),Math.floor((e.clientY-b.top)*18/b.height));
    });
    function setZoom() {
      const px=24*Number(zoom.value), py=18*Number(zoom.value);
      c.style.width=v.style.width=px+"px";c.style.height=v.style.height=py+"px";
      zoomLabel.textContent=zoom.value+"×"; dirty(result);
    }
    zoom.addEventListener("input",setZoom);setZoom();
    color.addEventListener("input",()=>{v.querySelector("path").setAttribute("fill",color.value);dirty(result);});
    const actions=add(root,"div",null,"vl-row");
    actions.append(button("Проверить работу",()=>{
      const now=ctx.getImageData(0,0,c.width,c.height).data;
      let changed=0; for(let i=0;i<now.length;i+=4)if(now[i]!==before[i]||now[i+1]!==before[i+1]||now[i+2]!==before[i+2])changed++;
      score(result,[
        [Number(zoom.value)>=4,"При увеличении у растра заметны квадратики, а векторный контур остаётся чётким.","Увеличь оба изображения до 4× или больше и сравни границы гор."],
        [changed>=2,"Изменены отдельные пиксели; остальная сетка не затронута.","Поставь две точки на разных пикселях холста или в разных координатах."],
        [color.value!=="#2b6590","Цвет всего векторного объекта изменён одним действием.","Выбери другой цвет гор у векторной копии, затем сравни её с растром."]
      ]);
    },"vl-main"));
    actions.append(button("Сбросить",()=>{ctx.putImageData(new ImageData(new Uint8ClampedArray(before),24,18),0,0);color.value="#2b6590";v.querySelector("path").setAttribute("fill",color.value);zoom.value=1;setZoom();note.textContent="Образцы восстановлены.";}));
    root.append(result);
  }
  function formatsLab(root) {
    add(root,"h3","Собери два файла для школьного проекта");
    add(root,"p","Эмблему будут печатать в разных размерах и менять её цвет. Учебный пейзаж сохранит плавные переходы, а сайт принимает PNG шириной 192 пикселя.");
    const grid=add(root,"div",null,"vl-comparison"), states=[];
    const result=resultBox(root);
    ["Эмблема для печати","Пейзаж для сайта"].forEach((title,i)=>{
      const p=add(grid,"div",null,"vl-panel"); add(p,"h4",title);
      const ctrl=field(p,"Формат результата","select");
      [["","Выбери формат"],["svg","SVG, вектор"],["png","PNG, растр"]].forEach(([v,t])=>{const o=add(ctrl,"option",t);o.value=v;});
      const conf=i===0 ? field(p,"Изменить цвет гор","input",{type:"color",value:"#2b6590"}) : field(p,"Ширина PNG (пиксели)","input",{type:"number",value:96,min:24,max:480});
      const pre=add(p,"div",null,"vl-sample"), msg=status(p);
      const state={format:"",color:null,width:null};
      states.push(state);
      let exportNode=null;
      const preview=()=>{
        const color=i===0?conf.value:null, sw=i===1?clamp(conf.valueAsNumber||96,24,480):null;
        let pic;
        switch(ctrl.value) {
          case "svg":
            pic=i===0?logoVector():svg("svg",{viewBox:"0 0 24 18",width:24,height:18,role:"img","aria-label":"Упрощённый векторный пейзаж без плавных переходов"});
            if(i===0) pic.querySelector("path").setAttribute("fill",color);
            else pic.append(svg("rect",{width:24,height:18,fill:"#edac82"}),svg("circle",{cx:16,cy:6,r:3,fill:"#fff3b2"}),svg("path",{d:"M0 16 L8 9 L12 14 L18 10 L24 14 L24 18 L0 18 Z",fill:"#37576b"}));
            break;
          case "png":
            if(!i) {
              pic=logoRaster(); pic.classList.add("vl-pixels");
            } else {
              pic=make("canvas"); pic.width=sw; pic.height=Math.round(sw*2/3);
              pic.setAttribute("role","img");pic.setAttribute("aria-label","Растровый учебный пейзаж");
              const ctx=pic.getContext("2d"); if(ctx)ctx.drawImage(photoRaster(),0,0,pic.width,pic.height);
            }
            break;
          default: msg.textContent="Сначала выбери формат.";return;
        }
        pic.style.width="100%";pic.style.maxWidth="192px";pic.style.height="auto";
        pre.replaceChildren(pic); exportNode=pic;
        Object.assign(state,{format:ctrl.value,color:ctrl.value==="svg"?color:null,width:!i?null:(ctrl.value==="png"?pic.width:null)});
        msg.textContent=i===0 ? (ctrl.value==="svg"?"Горы можно перекрасить как отдельный объект.":"PNG состоит из пикселей. Перекрашивание целого объекта здесь недоступно.") : (ctrl.value==="png"?pic.width+" × "+pic.height+" пикселей. Плавные переходы сохранены.":"Из простых фигур получился похожий силуэт, но плавных переходов нет.");
        save.disabled=false; dirty(result);
      };
      p.append(button("Собрать и посмотреть",preview,"vl-main"));
      const save=button("Скачать файл",()=>{
        if(!exportNode) return;
        const stem=i===0?"emblema":"peyzazh";
        if(exportNode.localName==="svg")download(svgBlob(exportNode),stem+".svg");
        else exportNode.toBlob(b=>download(b,stem+".png"));
      }); save.disabled=true;p.append(save);
    });
    root.append(button("Проверить работу",()=>{
      const [logo,photo]=states;
      score(result,[
        [logo.format==="svg","Эмблема собрана как масштабируемый контур.","Собери эмблему в SVG, чтобы она оставалась чёткой при разных размерах печати."],
        [logo.format==="svg"&&logo.color!=="#2b6590","Цвет самостоятельного объекта изменён.","У эмблемы выбери другой цвет гор и снова нажми «Собрать и посмотреть»."],
        [photo.format==="png"&&photo.width===192,"Растровый пейзаж собран в PNG шириной 192 пикселя.","Для сайта собери PNG. Задай ширину 192 и обнови образец."]
      ]);
    },"vl-main"));
    root.append(result);
  }
  const tools = {select:"Выбор",rect:"Прямоугольник",round:"Скруглённый",ellipse:"Эллипс",line:"Линия",poly:"Многоугольник",text:"Текст",pen:"Перо",node:"Узлы"};
  function pathData(nodes, closed) {
    if(!nodes.length)return "";
    let d="M "+nodes[0].x+" "+nodes[0].y;
    const n=nodes.length, next=(i,offset)=>nodes[closed?(i+offset+n)%n:clamp(i+offset,0,n-1)];
    for(let i=0;i<n-(closed?0:1);i++) {
      const a=nodes[i],b=next(i,1),p=next(i,-1),q=next(i,2);
      if(!a.smooth&&!b.smooth) d+=" L "+b.x+" "+b.y;
      else {
        const ax=a.x+(a.smooth?(b.x-p.x)/6:0),ay=a.y+(a.smooth?(b.y-p.y)/6:0);
        const bx=b.x-(b.smooth?(q.x-a.x)/6:0),by=b.y-(b.smooth?(q.y-a.y)/6:0);
        d+=" C "+ax+" "+ay+" "+bx+" "+by+" "+b.x+" "+b.y;
      }
    }
    return d+(closed?" Z":"");
  }
  function gfx(o, interactive=false) {
    let elem;
    const {x,y,w,h}=o;
    if(o.type==="rect"||o.type==="round")elem=svg("rect",{x,y,width:w,height:h,rx:o.type==="round"?Math.min(14,w/3,h/3):0});
    else if(o.type==="ellipse")elem=svg("ellipse",{cx:x+w/2,cy:y+h/2,rx:w/2,ry:h/2});
    else if(o.type==="line")elem=svg("line",{x1:x,y1:y,x2:o.x2,y2:o.y2});
    else if(o.type==="poly"){
      const coords=Array.from({length:o.sides},(_,i)=>{
        const a=i*2*Math.PI/o.sides-Math.PI/2;
        return [x+w/2*(1+Math.cos(a)),y+h/2*(1+Math.sin(a))].join(",");
      });
      elem=svg("polygon",{points:coords.join(" ")});
    } else if(o.type==="text") {
      elem=svg("text",{x,y,"font-family":"sans-serif","font-size":o.fs,"font-weight":"600"});
      elem.textContent=o.text;
    } else if(o.type==="pen")elem=svg("path",{d:pathData(o.nodes,o.closed)});
    if (!elem) return null;
    elem.setAttribute("fill",o.type==="line"||o.type==="pen"&&!o.closed?"none":o.fill);
    elem.setAttribute("stroke",o.stroke);elem.setAttribute("stroke-width",o.stroke==="none"?0:o.sw);
    elem.setAttribute("stroke-linecap","round");elem.setAttribute("stroke-linejoin","round");
    if(interactive){elem.dataset.vlId=o.id;elem.classList.add("vl-object");if(o.fill==="none"&&o.stroke==="none")elem.classList.add("vl-invisible");}
    return elem;
  }
  const titles = {
    11:["Собери робота из фигур","Создай корпус, голову или глаза и детали. Используй прямоугольник, скруглённый прямоугольник, эллипс, линию и многоугольник."],
    12:["Указатель в библиотеку","Сделай плашку, напиши «Библиотека» и нарисуй замкнутую стрелку «Пером». В редакторе текст можно менять и после создания."],
    13:["Один круг — три стиля","Три круга уже на холсте. Сделай у первого только заливку; у второго заливку и обводку; у третьего только обводку шириной не меньше 4."],
    14:["Измени лист узлами","Красный контур слева — исходный. У зелёного справа перемести верхний узел, сделай боковой узел плавным и добавь новый узел. Не передвигай весь объект."],
    15:["Собери эмблему и организуй слои","Круг, молния, фон и текст пока на одном слое. Сгруппируй круг и молнию. Вынеси фон на отдельный нижний слой и заблокируй его. Текст оставь вне группы. Скрой слой с эмблемой и снова покажи его."],
    16:["Открытый тренажёр: значок оранжереи","Это тренировка, не СОР. Создай фон, подпись и лист «Пером». Измени узел или сделай его плавным. Сгруппируй детали значка, а фон вынеси на отдельный слой."]
  };
  const options = {
    11:["select","rect","round","ellipse","line","poly"],
    12:["select","rect","round","line","text","pen"],
    13:["select","rect","round","ellipse","line","pen"],
    14:["select","pen","node"],
    15:["select","ellipse","pen","text","rect","round"],
    16:Object.keys(tools)
  };
  const defaultStyle = {fill:"#88d2bd",stroke:"#25476b",sw:3};
  const obj = (type, coords={}, info={}) => ({type,group:null, ...defaultStyle,...coords,...info});
  const theLeaf=(x,y)=>[point(x+55,y),point(x+105,y+45),point(x+55,y+135),point(x,y+75)];
  function initial(n) {
    const data={objects:[],layers:[{id:1,name:"Рисунок",visible:true,locked:false}],active:1,next:2};
    const put=(o,layer=1)=>data.objects.push({...o,id:data.next++,layer});
    if(n===13){
      [55,192,329].forEach((x,i)=>put(obj("ellipse",{x,y:111,w:96,h:96},{name:"Круг "+(i+1),fill:"none",sw:2})));
    }
    if(n===14) {
      data.layers.unshift({id:0,name:"Исходный образец",visible:true,locked:true});
      put(obj("pen",{nodes:theLeaf(52,70),closed:true},{name:"Образец",fill:"#ffd0c3",stroke:"#9c403e"}),0);
      put(obj("pen",{nodes:theLeaf(285,70),closed:true},{name:"Лист для правки",target:true}));
    }
    if(n===15) {
      put(obj("round",{x:44,y:46,w:390,h:228},{name:"Фон",role:"background",fill:"#eff6dc"}));
      put(obj("ellipse",{x:287,y:82,w:115,h:115},{name:"Круг",role:"circle",fill:"#ffe7a3"}));
      const zig=[[352,99],[316,148],[340,148],[327,185],[374,132],[350,132]].map(k=>point(...k));
      put(obj("pen",{nodes:zig,closed:true},{name:"Молния",role:"bolt",fill:"#e9934b"}));
      put(obj("text",{x:68,y:162,text:"Энергия идей",fs:26},{name:"Надпись",role:"label",fill:"#1f345c",stroke:"none",sw:0}));
    }
    return data;
  }
  const hasFill = o=>o.fill!=="none", hasStroke=o=>o.stroke!=="none"&&o.sw>0;
  const side=(x)=>Math.round(x);
  const on = (d, role)=>d.objects.find(o=>o.role===role);
  const clearPath = o => o.type==="pen"&&o.closed&&o.nodes.length>=3&&o.nodes.some((p,i)=>
    i>=2&&Math.abs((o.nodes[1].x-o.nodes[0].x)*(p.y-o.nodes[0].y)-(p.x-o.nodes[0].x)*(o.nodes[1].y-o.nodes[0].y))>=6);
  const sameGroup=(a,b)=>!!(a&&b&&a.group!=null&&a.group===b.group&&a.layer===b.layer);
  function grade(n,d){
    const visible=d.objects.filter(o=>d.layers.find(l=>l.id===o.layer)?.visible);
    const visual=visible.filter(o=>hasFill(o)||hasStroke(o));
    switch(n){
      case 11:return [
        [visual.some(o=>o.type==="rect"),"Есть прямоугольник.","Добавь видимый прямоугольник для корпуса."],
        [visual.some(o=>o.type==="round"),"Есть скруглённый прямоугольник.","Используй инструмент «Скруглённый», например для головы."],
        [visual.some(o=>o.type==="ellipse"),"Эллипс создан.","Добавь эллипс как глаз или колесо."],
        [visual.some(o=>o.type==="line"&&hasStroke(o))&&visual.some(o=>o.type==="poly"),"Линия и многоугольник тоже на холсте.","Добавь видимую линию и многоугольник, например антенну и треугольную кнопку."]
      ];
      case 12:return [
        [visual.some(o=>o.type==="rect"||o.type==="round"),"Плашка сделана отдельной фигурой.","Нарисуй прямоугольник или скруглённый прямоугольник для плашки."],
        [visual.some(o=>o.type==="text"&&/библиотек/i.test(o.text)), "Указатель подписан редактируемым текстовым объектом.","Добавь текст «Библиотека» или «В библиотеку»."],
        [visual.some(clearPath),"Есть замкнутый контур «Пером».","Поставь «Пером» не меньше трёх разных точек и нажми «Замкнуть контур»."]
      ];
      case 13:{
        const [a,b,c]=d.objects.filter(o=>/^Круг [123]$/.test(o.name||""));
        return [
          [a&&visible.includes(a)&&hasFill(a)&&!hasStroke(a),"Круг 1: только заливка.","У первого круга включи заливку и отключи обводку."],
          [b&&visible.includes(b)&&hasFill(b)&&hasStroke(b)&&b.fill!==b.stroke,"Круг 2: видна заливка и обводка другого цвета.","У второго круга включи оба свойства и выбери для обводки цвет, отличный от заливки."],
          [c&&visible.includes(c)&&!hasFill(c)&&hasStroke(c)&&c.sw>=4,"Круг 3: только заметная обводка.","Отключи заливку третьего круга и задай обводку шириной от 4."]
        ];
      }
      case 14:{
        const o=visible.find(o=>o.target), nodes=o?.nodes||[];
        const top=nodes.find(v=>v.original===0);
        return [
          [top&&top.edited&&top.y<=55,"Верхний узел листа поднят.","Выбери «Лист для правки», включи «Узлы» и подними верхний узел хотя бы на 15 единиц."],
          [nodes.some(v=>v.smooth&&[1,3].includes(v.original)),"Боковой узел стал плавным, контур изгибается.","Выбери один из двух исходных боковых узлов и нажми «Сделать плавным»."],
          [nodes.length>4&&nodes.some(v=>v.original==null),"В контур добавлен новый узел.","Выбери узел и нажми «Добавить после узла»."]
        ];
      }
      case 15:{
        const a=on(d,"circle"),b=on(d,"bolt"),bg=on(d,"background"),label=on(d,"label");
        const layer=d.layers.find(l=>l.id===bg?.layer), emblemLayer=d.layers.find(l=>l.id===a?.layer);
        return [
          [sameGroup(a,b)&&!sameGroup(a,label),"Круг и молния в одной группе, текст отдельно.","Отметь галочками «Круг» и «Молния» в списке и сгруппируй их. Не включай надпись."],
          [bg&&visible.includes(bg)&&a&&bg.layer!==a.layer&&d.layers.indexOf(layer)<d.layers.findIndex(l=>l.id===a.layer)&&layer.locked,"Фон находится на отдельном нижнем, заблокированном слое.","Добавь слой, перенеси на него фон, опусти слой ниже рисунка и заблокируй."],
          [label&&visible.includes(label)&&a&&visible.includes(a)&&b&&visible.includes(b)&&emblemLayer?.seenHidden,"Эмблема была скрыта, но объекты не удалились. Теперь и эмблема, и текст снова видны.","Сними галочку видимости у слоя с эмблемой, посмотри на результат и включи видимость снова."]
        ];
      }
      case 16:{
        const leaf=visual.find(clearPath),other=leaf&&visual.find(o=>o.id!==leaf.id&&o.type!=="text"&&sameGroup(leaf,o));
        const bg=leaf&&visual.find(o=>(o.type==="round"||o.type==="rect")&&d.layers.findIndex(l=>l.id===o.layer)<d.layers.findIndex(l=>l.id===leaf.layer));
        return [
          [bg&&visual.some(o=>o.type==="text"&&o.text.trim().length>=3),"Есть фон на нижнем слое и редактируемая подпись.","Нарисуй отдельный фон, помести его на слой ниже листа и добавь подпись."],
          [leaf&&hasFill(leaf)&&hasStroke(leaf)&&leaf.fill!==leaf.stroke,"У замкнутого листа видны раздельные заливка и обводка.","Замкни контур листа «Пером». Включи заливку и обводку разных цветов."],
          [leaf&&leaf.nodes.some(p=>p.smooth||p.edited),"Форма листа отредактирована узлами.","Выбери узел листа, передвинь его или сделай плавным."],
          [other,"Лист и ещё одна его деталь сгруппированы.","Добавь к листу жилку или другую деталь; отметь оба объекта и сгруппируй."]
        ];
      }
    }
    return [];
  }
  function vectorEditor(root,n) {
    const [title,brief]=titles[n];
    add(root,"h3",title);add(root,"p",brief);
    const toolbar=add(root,"div",null,"vl-row vl-tools");
    toolbar.setAttribute("role","group");toolbar.setAttribute("aria-label","Инструменты рисования");
    const tip=add(root,"p",null,"vl-hint");
    const split=add(root,"div",null,"vl-editor");
    const work=add(split,"div",null,"vl-work");
    const art=svg("svg",{viewBox:"0 0 "+W+" "+H,role:"img","aria-label":"Холст векторного редактора"});
    art.classList.add("vl-scene");work.append(art);
    const panel=add(split,"aside",null,"vl-sidebar");
    const info=status(root), result=resultBox(root);
    let d=initial(n), current=options[n][0], sel=null, nodeId=null, pen=[], drag=null, history=[], marked=new Set();
    let polygonSides=3;
    if(n===14) d.objects.find(o=>o.target).nodes.forEach((p,i)=>p.original=i);
    const src=()=>d.objects.find(o=>o.id===sel);
    const layerOf=o=>d.layers.find(l=>l.id===o?.layer);
    const canEdit=o=>!!o&&layerOf(o)?.visible&&!layerOf(o)?.locked;
    const activeLayer=()=>d.layers.find(l=>l.id===d.active);
    const canAdd=()=>activeLayer()?.visible&&!activeLayer()?.locked;
    const remember=()=>{history.push(JSON.stringify(d));if(history.length>40)history.shift();};
    const change=()=>{dirty(result);};
    function msg(t){info.textContent=t;}
    function pick(id) {sel=id;nodeId=null;sync();}

    const toolButtons={};
    for (const id of options[n]) {
      toolButtons[id]=button(tools[id],()=>activate(id));
      toolButtons[id].dataset.tool=id;toolbar.append(toolButtons[id]);
    }
    const descriptions={
      select:"Щёлкни по объекту или выбери его в списке. Чтобы передвинуть, потяни за объект; группы двигаются целиком.",
      rect:"Протяни от одного угла к другому. Можно также ввести координаты и размеры ниже.",
      round:"Протяни по холсту, как прямоугольник. Углы скруглятся сами.",
      ellipse:"Протяни по холсту, чтобы задать ширину и высоту. Для круга сделай их одинаковыми.",
      line:"Протяни от начала к концу линии. Для линии видна только обводка.",
      poly:"Укажи число сторон и протяни по холсту, чтобы задать размер.",
      text:"Набери подпись ниже и щёлкни по нужному месту на холсте. Начальная точка текста лежит на линии букв.",
      pen:"Поставь точки щелчками или по координатам. Для замкнутой фигуры нажми «Замкнуть контур», для линии — «Оставить открытым».",
      node:"Выбери контур «Пером», а затем его узел. Тяни узел мышью или меняй координаты; кнопками можно сгладить изгиб или добавить точку."
    };
    const coordPanel=add(work,"div",null,"vl-controls");
    add(coordPanel,"h4","Точные координаты и клавиатура");
    const controls=add(coordPanel,"div",null,"vl-row");
    const xInput=field(controls,"X","input",{type:"number",value:80,min:0,max:W}), yInput=field(controls,"Y","input",{type:"number",value:80,min:0,max:H});
    const wInput=field(controls,"Ширина","input",{type:"number",value:96,min:-480,max:W}), hInput=field(controls,"Высота","input",{type:"number",value:60,min:-320,max:H});
    const sides=field(controls,"Сторон","input",{type:"number",value:3,min:3,max:8});
    sides.addEventListener("input",()=>{polygonSides=clamp(sides.valueAsNumber||3,3,8)|0;});
    const textInput=field(controls,"Подпись","input",{type:"text",value:n===12?"Библиотека":n===16?"Оранжерея":"Энергия идей",maxlength:44});
    const values=()=>[clamp(xInput.valueAsNumber||0,0,W),clamp(yInput.valueAsNumber||0,0,H)].map(side);
    const direct=button("Добавить по координатам",()=>{
      const [x,y]=values(); addAt(current,point(x,y),point(x+(wInput.valueAsNumber||0),y+(hInput.valueAsNumber||0)));
    });
    const setAt=button("Переместить в X, Y",()=>{
      const o=src(), [x,y]=values();
      if(!canEdit(o))return msg("Выбери объект на открытом незаблокированном слое.");
      if(current==="node") {
        const p=o.nodes?.[nodeId];if(!p)return msg("Выбери узел в списке или на холсте.");
        if(x===p.x&&y===p.y)return;
        remember();Object.assign(p,{x,y,edited:true});sync();change();
      } else {const home=anchor(o);const dx=x-home.x,dy=y-home.y;if(dx||dy){remember();translate(o,dx,dy);sync();change();}}
    });
    controls.append(direct,setAt);
    const penActions=add(work,"div",null,"vl-row");
    const closer=button("Замкнуть контур",()=>endPen(true)), opener=button("Оставить открытым",()=>endPen(false));
    penActions.append(closer,opener,button("Отменить точку",()=>{pen.pop();renderScene();}));
    const nodeActions=add(work,"div",null,"vl-row");
    const nodeList=field(nodeActions,"Активный узел","select");
    nodeList.addEventListener("change",()=>{nodeId=nodeList.value!==""?Number(nodeList.value):null;updateNode(false);renderScene();});
    const smooth=button("Сделать плавным",()=>toggleSmooth(true)), corner=button("Сделать угловым",()=>toggleSmooth(false));
    const insert=button("Добавить после узла",()=>{
      const o=src(), p=o?.nodes?.[nodeId];if(!canEdit(o)||!p)return;
      const ends=o.nodes.length, next=o.nodes[(nodeId+1)%ends];if(nodeId===ends-1&&!o.closed)return msg("У открытого контура после последней точки нет участка. Выбери предыдущую.");
      remember();o.nodes.splice(nodeId+1,0,point(side((p.x+next.x)/2),side((p.y+next.y)/2)));nodeId+=1;
      change();sync();msg("Новый узел добавлен между соседними точками.");
    });
    nodeActions.append(smooth,corner,insert);
    function toggleSmooth(next) {
      const o=src(), p=o?.nodes?.[nodeId];if(!canEdit(o)||!p||p.smooth===next)return;
      remember();p.smooth=next;change();sync();msg(next?"Выбранный узел стал плавным.":"Выбранный узел стал угловым.");
    }

    add(panel,"h4","Объекты");
    const objList=add(panel,"div",null,"vl-object-list");
    const objActions=add(panel,"div",null,"vl-row");
    const del=button("Удалить выбранное",()=>{
      const o=src();if(!canEdit(o))return;remember();
      d.objects=d.objects.filter(x=>x.id!==o.id);marked.delete(o.id);sel=null;nodeId=null;sync();change();
    });
    objActions.append(del);
    const groups=add(panel,"div",null,"vl-row");
    const groupBtn=button("Сгруппировать отмеченные",()=>{
      const xs=d.objects.filter(o=>marked.has(o.id)&&canEdit(o));
      if(xs.length<2)return msg("Отметь в списке не меньше двух доступных объектов.");
      if(!xs.every(o=>o.layer===xs[0].layer))return msg("Чтобы сгруппировать объекты, сначала вынеси их на один слой.");
      remember();const g=d.next++;for(const o of xs)o.group=g;
      marked.clear();sel=xs[0].id;sync();change();msg("Готово: части группы теперь перемещаются вместе.");
    });
    const ungroup=button("Разгруппировать",()=>{
      const o=src();if(!canEdit(o)||o.group==null)return;
      remember();const g=o.group;d.objects.forEach(x=>{if(x.group===g)x.group=null;});sync();change();msg("Детали снова можно передвигать отдельно.");
    });
    groups.append(groupBtn,ungroup);
    if(n<15)groups.hidden=true;
    const prop=add(panel,"div",null,"vl-properties");
    add(prop,"h4","Стиль выбранного объекта");
    const fillOn=check(prop,"Есть заливка");
    const fillColor=field(prop,"Цвет заливки","input",{type:"color",value:defaultStyle.fill});
    const strokeOn=check(prop,"Есть обводка");
    const strokeColor=field(prop,"Цвет обводки","input",{type:"color",value:defaultStyle.stroke});
    const strokeW=field(prop,"Ширина обводки","input",{type:"number",min:1,max:20,value:3});
    const updateText=field(prop,"Изменить текст","input",{type:"text",maxlength:44});
    const applyText=button("Сохранить надпись",()=>{
      const o=src(); const value=updateText.value.trim();if(o?.type!=="text"||!canEdit(o)||!value||o.text===value)return;
      remember();o.text=value;change();sync();msg("Текст изменён. Он остаётся отдельным объектом.");
    });
    prop.append(applyText);
    const applyStyle=button("Применить стиль",()=>{
      const o=src(); if(!canEdit(o))return msg("Сначала выбери объект на доступном слое.");
      const fill=fillOn.checked && o.type!=="line" && !(o.type==="pen"&&!o.closed)?fillColor.value:"none";
      const stroke=strokeOn.checked?strokeColor.value:"none", sw=clamp(strokeW.valueAsNumber||1,1,20);
      if(fill===o.fill&&stroke===o.stroke&&sw===o.sw)return;
      remember();Object.assign(o,{fill,stroke,sw});sync();change();msg("Стиль изменён у "+objectName(o)+".");
    },"vl-main");
    prop.append(applyStyle);

    const lp=add(panel,"div",null,"vl-layers");
    add(lp,"h4","Слои: снизу вверх");
    const layerList=add(lp,"div",null,"vl-layer-list");
    const layerControl=add(lp,"div",null,"vl-row");
    const layerName=field(layerControl,"Имя нового слоя","input",{type:"text",maxlength:24,placeholder:"Например, Фон"});
    layerControl.append(button("Добавить слой",()=>{
      const name=layerName.value.trim();if(!name)return msg("Впиши короткое имя нового слоя.");
      if(d.layers.some(l=>l.name===name))return msg("Слой с таким именем уже есть.");
      remember();d.active=d.next++;d.layers.push({id:d.active,name,visible:true,locked:false});
      layerName.value="";sync();change();msg("Новый слой активен. Следующий объект попадёт на него.");
    }));
    const assign=button("Перенести выбранное на активный слой",()=>{
      const o=src(), lay=activeLayer();
      if(!canEdit(o)||!lay||lay.locked||!lay.visible)return msg("Выбери доступный объект и открытый незаблокированный слой.");
      if(o.layer===d.active)return msg("Выбранное уже на активном слое.");
      remember();const g=o.group;d.objects.forEach(x=>{if(x.id===o.id||(g!=null&&x.group===g))x.layer=d.active;});sync();change();msg("Выбранное перенесено на слой «"+lay.name+"».");
    });
    const lower=button("Опустить активный слой ниже",()=>{
      const j=d.layers.findIndex(l=>l.id===d.active);
      if(j<1)return msg("Этот слой уже самый нижний.");
      remember();[d.layers[j-1],d.layers[j]]=[d.layers[j],d.layers[j-1]];sync();change();
    });
    layerControl.append(assign,lower);
    if(n<15)lp.hidden=true;

    const edits=add(root,"div",null,"vl-row");
    const undo=button("Вернуть действие",()=>{
      if(!history.length) return;
      d=JSON.parse(history.pop());sel=null;nodeId=null;pen=[];marked.clear();sync();change();msg("Предыдущее состояние восстановлено.");
    });
    edits.append(button("Проверить работу",()=>score(result,grade(n,d)),"vl-main"),undo);
    const reset=button("Начать заново",()=>{
      if(history.length&&!window.confirm("Сбросить текущий рисунок и начать заново?"))return;
      d=initial(n);if(n===14)d.objects.find(o=>o.target).nodes.forEach((p,i)=>p.original=i);
      pen=[];history=[];marked.clear();activate(options[n][0]);sel=null;nodeId=null;sync();change();msg("Исходная сцена восстановлена.");
    });
    const exportBtn=button("Скачать рисунок SVG",()=>{
      const out=svg("svg",{viewBox:"0 0 "+W+" "+H,width:W,height:H});
      out.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:inkscape",INK);
      paintScene(out,false);download(svgBlob(out),"informatika-6-"+n+".svg");
      msg("Готов SVG с объектами, группами и слоями. Его можно открыть в Inkscape.");
    });
    edits.append(exportBtn,reset);root.append(result);

    function objectName(o){return o.name||tools[o.type]+" "+o.id;}
    function refreshObjects() {
      objList.replaceChildren();
      if(!d.objects.length){add(objList,"p","Пока нет объектов. Выбери инструмент и начни рисовать.","vl-hint");return;}
      for(const o of d.objects) {
        const row=add(objList,"div",null,"vl-object-line"), layer=layerOf(o);
        const select=button(objectName(o)+(o.group!=null?" · группа":""),()=>pick(o.id));
        select.setAttribute("aria-pressed",String(o.id===sel));select.dataset.pickId=o.id;row.append(select);
        if(n>=15){const box=check(row,"В группу: "+objectName(o));box.checked=marked.has(o.id);box.disabled=!canEdit(o);
          box.addEventListener("change",()=>box.checked?marked.add(o.id):marked.delete(o.id));}
        if(layer?.locked||!layer?.visible) add(row,"small",layer?.locked?"Закрыт":"Скрыт");
      }
    }
    function refreshLayers(){
      layerList.replaceChildren();
      for(const lay of d.layers){
        const row=add(layerList,"div",null,"vl-layer");
        const b=button(lay.name,()=>{d.active=lay.id;refreshLayers();msg("Активный слой: "+lay.name+".");});
        b.setAttribute("aria-pressed",String(lay.id===d.active));row.append(b);
        const eye=check(row,"Виден: "+lay.name);eye.checked=lay.visible;
        const lock=check(row,"Закрыт: "+lay.name);lock.checked=lay.locked;
        eye.addEventListener("change",()=>{remember();lay.visible=eye.checked;if(!lay.visible)lay.seenHidden=true;sync();change();});
        lock.addEventListener("change",()=>{remember();lay.locked=lock.checked;sync();change();});
      }
    }
    function updateNode(full=true) {
      const o=src(), nodes=o?.nodes;
      if(full){
        nodeList.replaceChildren();
        const hint=add(nodeList,"option","Выбери узел");hint.value="";
        nodes?.forEach((_,i)=>{const opt=add(nodeList,"option","Узел "+(i+1));opt.value=i;});
        nodeList.value=nodeId??"";
      }
      smooth.disabled=corner.disabled=insert.disabled=!(nodes?.[nodeId]&&canEdit(o));
      if(nodes?.[nodeId]){xInput.value=nodes[nodeId].x;yInput.value=nodes[nodeId].y;}
    }
    function anchor(o){return o.nodes?.[0]||point(o.x,o.y);}
    function refreshProperties(){
      const o=src();const disabled=!canEdit(o);
      const open=o&&(o.type==="line"||(o.type==="pen"&&!o.closed));
      fillOn.disabled=fillColor.disabled=disabled||open;strokeOn.disabled=strokeColor.disabled=strokeW.disabled=applyStyle.disabled=del.disabled=disabled;
      fillOn.checked=!!o&&hasFill(o)&&!open;fillColor.value=o&&hasFill(o)?o.fill:defaultStyle.fill;
      strokeOn.checked=!!o&&hasStroke(o);strokeColor.value=o&&hasStroke(o)?o.stroke:defaultStyle.stroke;strokeW.value=o?.sw||3;
      updateText.parentNode.hidden=applyText.hidden=o?.type!=="text";
      updateText.disabled=applyText.disabled=disabled;
      if(o?.type==="text")updateText.value=o.text;
      if(o&&current==="select"){const at=anchor(o);xInput.value=at.x;yInput.value=at.y;}
      ungroup.disabled=disabled||o?.group==null;
      undo.disabled=!history.length;
    }
    function sync() {refreshObjects();refreshLayers();refreshProperties();updateNode();renderScene();}
    function activate(id){
      current=id;pen=[];drag=null;nodeId=null;
      for(const [key,b] of Object.entries(toolButtons))b.setAttribute("aria-pressed",String(key===id));
      tip.textContent=descriptions[id];
      art.classList.toggle("vl-draw",id!=="select"&&id!=="node");
      penActions.hidden=id!=="pen";nodeActions.hidden=id!=="node";
      direct.hidden=id==="select"||id==="node";setAt.hidden=id!=="select"&&id!=="node";
      wInput.parentNode.hidden=hInput.parentNode.hidden=["select","node","pen","text"].includes(id);
      sides.parentNode.hidden=id!=="poly";textInput.parentNode.hidden=id!=="text";
      sync();
    }

    function paintScene(target,local) {
      for(const lay of d.layers){
        if(local&&!lay.visible)continue;
        const g=svg("g",{id:"layer-"+lay.id});
        if(!local) {
          g.setAttributeNS(INK,"inkscape:groupmode","layer");g.setAttributeNS(INK,"inkscape:label",lay.name);
          if(!lay.visible)g.setAttribute("display","none");
          if(lay.locked)g.setAttributeNS("http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd","sodipodi:insensitive","true");
        }
        const groups=new Map();
        for(const o of d.objects.filter(o=>o.layer===lay.id)){
          const elem=gfx(o,local);
          if(!elem)continue;
          if(local){
            if(o.id===sel)elem.classList.add("vl-selected");
            if(lay.locked)elem.classList.add("vl-locked");
          }
          if(o.group==null)g.append(elem);
          else {
            if(!groups.has(o.group)){const body=svg("g",{id:"group-"+o.group});groups.set(o.group,body);g.append(body);}
            groups.get(o.group).append(elem);
          }
        }
        target.append(g);
      }
    }
    function renderScene(){
      art.replaceChildren();paintScene(art,true);
      const o=src();if(current==="node"&&canEdit(o))o.nodes?.forEach((p,i)=>{
        const dot=svg("circle",{cx:p.x,cy:p.y,r:i===nodeId?7:5,"data-vl-node":i});
        dot.classList.add("vl-node");if(p.smooth)dot.classList.add("vl-smooth");if(i===nodeId)dot.classList.add("vl-active-node");art.append(dot);
      });
      if(current==="pen"&&pen.length){
        const sketch=svg("path",{d:pathData(pen,false)});sketch.classList.add("vl-sketch");art.append(sketch);
        pen.forEach((p,i)=>{const dot=svg("circle",{cx:p.x,cy:p.y,r:i?4:7,"data-vl-start":i===0?"yes":"no"});dot.classList.add("vl-node");art.append(dot);});
      }
      if(drag?.mode==="draw"&&drag.last){
        const preview=shapeFrom(current,drag.start,drag.last);
        if(preview){const elem=gfx(preview);elem.classList.add("vl-preview");art.append(elem);}
      }
    }
    function shapeFrom(id,a,b){
      if(!["rect","round","ellipse","line","poly"].includes(id))return null;
      const x=clamp(Math.min(a.x,b.x),0,W-4),y=clamp(Math.min(a.y,b.y),0,H-4);
      const w=clamp(Math.abs(a.x-b.x),4,W-x),h=clamp(Math.abs(a.y-b.y),4,H-y);
      if(id==="line"){
        let x2=clamp(b.x,0,W),y2=clamp(b.y,0,H);
        if(a.x===x2&&a.y===y2)x2=a.x<=W-8?a.x+8:a.x-8;
        return obj(id,{x:a.x,y:a.y,x2,y2},{fill:"none"});
      }
      return obj(id,{x,y,w,h,sides:polygonSides});
    }
    function saveNew(o){
      if(!o)return;
      remember();o.id=d.next++;o.layer=d.active;d.objects.push(o);
      sel=o.id;nodeId=null;change();sync();msg(objectName(o)+" добавлен на слой «"+activeLayer().name+"».");
    }
    function addAt(id,a,b) {
      if(!canAdd())return msg("Для рисования выбери видимый незаблокированный слой.");
      if(id==="pen"){
        if(pen.length>=60)return msg("Для одного контура достаточно 60 узлов. Закончи его и начни следующий.");
        const prev=pen.at(-1);
        if(prev&&prev.x===a.x&&prev.y===a.y)return msg("Задай другую точку: предыдущий узел уже здесь.");
        pen.push(point(a.x,a.y));renderScene();msg("Точек в незавершённом контуре: "+pen.length+".");return;
      }
      if(id==="text"){
        const value=textInput.value.trim();if(!value)return msg("Введи подпись до размещения текста.");
        return saveNew(obj(id,{x:a.x,y:a.y,text:value,fs:24},{fill:"#1f345c",stroke:"none",sw:0}));
      }
      saveNew(shapeFrom(id,a,b));
    }
    function endPen(closed){
      if(!canAdd())return msg("Выбери видимый незаблокированный слой, чтобы закончить контур.");
      const min=closed?3:2;
      if(new Set(pen.map(p=>p.x+","+p.y)).size<min)return msg("Поставь не меньше "+min+" разных точек.");
      const o=obj("pen",{nodes:pen.slice(),closed},{...(closed?{}:{fill:"none"})});
      if(closed&&!clearPath(o))return msg("Замкнутой фигуре нужна площадь. Добавь точку не на линии между первыми двумя.");
      pen=[];saveNew(o);
    }
    const crew=o=>d.objects.filter(x=>x.id===o.id||(o.group!=null&&x.group===o.group));
    function translate(o,dx,dy) {
      const xs=crew(o), at=anchor(o);
      dx=clamp(dx,-at.x,W-at.x);dy=clamp(dy,-at.y,H-at.y);
      for(const x of xs){
        if(x.nodes) x.nodes.forEach(p=>{p.x+=dx;p.y+=dy;});
        else{x.x+=dx;x.y+=dy;if(x.type==="line"){x.x2+=dx;x.y2+=dy;}}
      }
    }
    function pos(event){
      const r=art.getBoundingClientRect();
      return point(side(clamp((event.clientX-r.left)*W/r.width,0,W)),side(clamp((event.clientY-r.top)*H/r.height,0,H)));
    }
    art.addEventListener("pointerdown",e=>{
      if(e.button!==0||drag)return;
      const a=pos(e), node=e.target.getAttribute("data-vl-node"), first=e.target.getAttribute("data-vl-start");
      if(current==="pen"){
        if(first==="yes"&&pen.length>=3)endPen(true);else addAt("pen",a);
        return;
      }
      if(current==="text"){addAt("text",a);return;}
      const found=d.objects.find(o=>o.id===Number(e.target.getAttribute("data-vl-id")));
      if(current==="node"){
        if(node==null){if(found?.nodes)pick(found.id);return;}
        nodeId=Number(node);updateNode();
        if(!canEdit(src()))return;
        drag={mode:"node",prev:a,changed:false};
      } else if(current==="select"){
        if(!canEdit(found)){if(found)msg("Этот объект на заблокированном слое.");else pick(null);return;}
        pick(found.id);drag={mode:"move",prev:a,changed:false};
      } else {
        if(!canAdd())return msg("Для рисования нужен видимый незаблокированный слой.");
        drag={mode:"draw",start:a,last:a};
      }
      art.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    art.addEventListener("pointermove",e=>{
      if(!drag)return;
      const b=pos(e);
      if(drag.mode==="draw"){drag.last=b;renderScene();return;}
      const dx=b.x-drag.prev.x,dy=b.y-drag.prev.y;
      if(!dx&&!dy)return;
      if(!drag.changed){remember();drag.changed=true;}
      if(drag.mode==="node"){
        const p=src()?.nodes?.[nodeId];if(!p)return;
        p.x=clamp(p.x+dx,0,W);p.y=clamp(p.y+dy,0,H);p.edited=true;
      } else if(src()) translate(src(),dx,dy);
      drag.prev=b;change();renderScene();
    });
    art.addEventListener("pointerup",e=>{
      if(!drag)return;
      const work=drag;drag=null;
      if(work.mode==="draw"){
        const end=pos(e), x=Math.abs(end.x-work.start.x),y=Math.abs(end.y-work.start.y);
        if(x+y>=5) addAt(current,work.start,end);
        else {renderScene();msg("Для фигуры протяни от начала к концу или используй координаты.");}
      } else sync();
    });
    art.addEventListener("pointercancel",()=>{drag=null;sync();});
    activate(current);
  }

  function init(){
    for(const box of document.querySelectorAll("[data-lab][data-lesson]")){
      const n=Number(box.dataset.lesson);
      if(!Number.isInteger(n)||n<9||n>16||box.dataset.vectorReady)continue;
      box.dataset.vectorReady="1";box.classList.add("vl-lab");
      if(n===9)rasterZoom(box);else if(n===10)formatsLab(box);else vectorEditor(box,n);
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
