(()=>{
const qs=(s,r=document)=>r.querySelector(s), all=(s,r=document)=>[...r.querySelectorAll(s)];
const C=qs('#robot-canvas'), button=qs('#autospin'), title=qs('#model-title'), speed=.5, reduce=matchMedia('(prefers-reduced-motion: reduce)');
const fallback=qs('#no-3d'), file=qs('#glb-file'), hint=qs('#angle'), names={base:'Колёсная база EV3',arm:'Манипулятор EV3',plot:'Робот-чертёжник EV3'};
let playing=!reduce.matches,key='base',angle=-.63,tilt=.56,from=null,frame=0,last=0,lastLabel=-1;
const gl=C.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:false});
const ctx=!gl?C.getContext('2d',{alpha:true}):null;
if(!gl&&!ctx){fallback.hidden=false;C.hidden=true;button.disabled=true;}
let program,uni, attr, count=0, vbo, cpu=null;
function shader(type,source){const o=gl.createShader(type);gl.shaderSource(o,source);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(o));return o;}
function start(){
 program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,`
 attribute vec3 pos;attribute vec3 norm;attribute vec3 rgb;
 uniform float t,p,aspect;uniform vec3 center;uniform float size;
 varying vec3 color;
 void main(){
  vec3 a=(pos-center)*size;
  float co=cos(t),si=sin(t),cp=cos(p),sp=sin(p);
  vec3 q=vec3(co*a.x-si*a.y,si*a.x+co*a.y,a.z);
  vec3 n=vec3(co*norm.x-si*norm.y,si*norm.x+co*norm.y,norm.z);
  float L=.67+.32*max(0.,dot(n,normalize(vec3(-.55,-.7,1.0))));
  color=rgb*L;
  float d=7.+q.y*cp-q.z*sp;
  gl_Position=vec4(q.x*3.65/aspect,(q.z*cp+q.y*sp)*3.65,d*1.064516-1.032258,d);
 }`));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec3 color;void main(){gl_FragColor=vec4(color,1.0);}`));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 uni=Object.fromEntries(['t','p','aspect','center','size'].map(n=>[n,gl.getUniformLocation(program,n)]));
 attr=Object.fromEntries(['pos','norm','rgb'].map(n=>[n,gl.getAttribLocation(program,n)]));
 vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
 for(const [i,a] of ['pos','norm','rgb'].entries()){gl.enableVertexAttribArray(attr[a]);gl.vertexAttribPointer(attr[a],3,gl.FLOAT,false,36,i*12)}
}
function geometry(){
 const m=globalThis.EV3_MODELS[key],low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity],data=[];
 for(const [color,pts] of m){
 const c=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);
 for(let i=0;i<pts.length;i+=9){
  const p=pts.slice(i,i+3),q=pts.slice(i+3,i+6),r=pts.slice(i+6,i+9),u=q.map((x,j)=>x-p[j]),v=r.map((x,j)=>x-p[j]);
  const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1;
  const normal=n.map(x=>x/l);
  for(const point of [p,q,r]){point.forEach((x,j)=>{low[j]=Math.min(low[j],x);high[j]=Math.max(high[j],x)});data.push(...point,...normal,...c);}
 }}
 const dims=high.map((x,i)=>x-low[i]),center=high.map((x,i)=>(low[i]+x)/2);
 const scale=3.65/Math.max(...dims);
 count=data.length/9;
 if(gl&&program){
  gl.uniform3fv(uni.center,center);gl.uniform1f(uni.size,scale);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
 }else if(ctx){
  const values=new Float32Array(data);
  for(let i=0;i<values.length;i+=9)for(let j=0;j<3;j++)values[i+j]=(values[i+j]-center[j])*scale;
  cpu={values,coords:new Float32Array(count*3)};
 }
}
function draw2(w,h){
 if(!cpu)return;
 const {values,coords}=cpu,co=Math.cos(angle),si=Math.sin(angle),cp=Math.cos(tilt),sp=Math.sin(tilt),k=h*1.825;
 if(!cpu.img||cpu.img.width!==w||cpu.img.height!==h){cpu.img=ctx.createImageData(w,h);cpu.pixels=new Uint32Array(cpu.img.data.buffer);cpu.depth=new Float32Array(w*h);}
 const {pixels,depth}=cpu;pixels.fill(0);depth.fill(-Infinity);
 for(let i=0,j=0;i<values.length;i+=9,j+=3){
  const x=co*values[i]-si*values[i+1],y=si*values[i]+co*values[i+1],z=values[i+2],inv=1/(7+y*cp-z*sp);
  coords[j]=w/2+k*x*inv;coords[j+1]=h/2-k*(z*cp+y*sp)*inv;coords[j+2]=inv;
 }
 for(let i=0,j=0;i<values.length;i+=27,j+=9){
  const x0=coords[j],y0=coords[j+1],x1=coords[j+3],y1=coords[j+4],x2=coords[j+6],y2=coords[j+7];
  const dx1=x1-x0,dy1=y1-y0,dx2=x2-x0,dy2=y2-y0,den=dx1*dy2-dx2*dy1;
  if(Math.abs(den)<.0001)continue;
  const xmin=Math.max(0,Math.min(x0,x1,x2)|0),xmax=Math.min(w-1,Math.ceil(Math.max(x0,x1,x2)));
  const ymin=Math.max(0,Math.min(y0,y1,y2)|0),ymax=Math.min(h-1,Math.ceil(Math.max(y0,y1,y2)));
  const nx=co*values[i+3]-si*values[i+4],ny=si*values[i+3]+co*values[i+4],nz=values[i+5];
  const light=.67+.32*Math.max(0,(-.43*nx-.54*ny+.76*nz)),r=Math.round(values[i+6]*light*255),g=Math.round(values[i+7]*light*255),b=Math.round(values[i+8]*light*255);
  const color=(255<<24)|(b<<16)|(g<<8)|r;
  const z0=coords[j+2],d1=coords[j+5]-z0,d2=coords[j+8]-z0;
  for(let y=ymin;y<=ymax;y++){
   const yy=y+.5-y0,idx=y*w;
   for(let x=xmin;x<=xmax;x++){
    const xx=x+.5-x0,u=(xx*dy2-yy*dx2)/den,v=(dx1*yy-dy1*xx)/den;
    if(u<-.00002||v<-.00002||u+v>1.00002)continue;
    const z=z0+d1*u+d2*v,p=idx+x;
    if(z>depth[p]){depth[p]=z;pixels[p]=color}
   }
  }
 }
 ctx.putImageData(cpu.img,0,0);
}
function draw(){
 if(!(gl&&program)&&!ctx)return;
 const ratio=ctx?Math.min(1.35,620/Math.max(C.clientWidth,1)):Math.min(devicePixelRatio||1,2),w=Math.round(C.clientWidth*ratio),h=Math.round(C.clientHeight*ratio);
 if(!w||!h)return;
 if(C.width!==w||C.height!==h){C.width=w;C.height=h;}
 if(gl&&program){
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.viewport(0,0,w,h);gl.uniform1f(uni.aspect,w/h);
  gl.uniform1f(uni.t,angle);gl.uniform1f(uni.p,tilt);gl.drawArrays(gl.TRIANGLES,0,count);
 }else draw2(w,h);
 const a=Math.round((angle*180/Math.PI%360+360)%360);
 if(lastLabel!==a){hint.textContent=a+'°';lastLabel=a}
}
function tick(now){
 frame=0;
 if(!playing||document.hidden){last=0;return}
 if(ctx&&last&&now-last<33){frame=requestAnimationFrame(tick);return}
 if(last)angle+=Math.min(now-last,120)*.001*speed;
 last=now;draw();frame=requestAnimationFrame(tick);
}
function sync(){
 button.setAttribute('aria-pressed',String(playing));button.textContent=playing?'Пауза вращения':'Включить вращение';button.disabled=!(gl&&program)&&!ctx;
 if(playing&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(tick)}
 if(!playing&&frame){cancelAnimationFrame(frame);frame=0;last=0;draw()}
}
function setModel(id){
 key=id;angle=-.63;tilt=.56;
 all('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===id)));
 title.textContent=names[id];C.setAttribute('aria-label',names[id]+': 3D-модель. Мышь, свайп или клавиши со стрелками.');
 file.href='ev3-'+id+'.glb';file.download='ev3-'+id+'.glb';
 const guides={
  base:'https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltc8481dd2666822ff/5f8801e3f4f4cf0fa39d2fef/ev3-rem-driving-base.pdf?locale=en-us',
  arm:'https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt1462fd6a67d57cc5/5f8801e9722f2a15c7ba2511/ev3-model-core-set-robot-arm-h25.pdf?locale=en-us',
  plot:'https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt059a44808fe6e15d/5f88047cc3d3c30be7c15232/plot-bot.pdf?locale=en-us'
 };
 qs('#model-guide').href=guides[id];
 if((gl&&program)||ctx){geometry();draw()}
}
try{if(gl)start()}catch(err){fallback.hidden=false;C.hidden=true;program=null;console.error('EV3 viewer:',err.message)}
all('[data-model]').forEach(b=>b.addEventListener('click',()=>setModel(b.dataset.model)));
button.addEventListener('click',()=>{playing=!playing;sync()});
qs('#reset-view').addEventListener('click',()=>{angle=-.63;tilt=.56;draw()});
C.addEventListener('pointerdown',e=>{playing=false;sync();from=[e.clientX,e.clientY];C.setPointerCapture(e.pointerId)});
C.addEventListener('pointermove',e=>{if(!from)return;angle+=(e.clientX-from[0])*.012;tilt=Math.max(-.35,Math.min(1.15,tilt+(e.clientY-from[1])*.009));from=[e.clientX,e.clientY];draw()});
for(const t of ['pointerup','pointercancel','lostpointercapture'])C.addEventListener(t,()=>{from=null});
C.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();playing=false;sync();if(e.key==='ArrowLeft')angle-=.15;if(e.key==='ArrowRight')angle+=.15;if(e.key==='ArrowUp')tilt=Math.min(1.15,tilt+.10);if(e.key==='ArrowDown')tilt=Math.max(-.35,tilt-.10);draw()});
reduce.addEventListener?.('change',e=>{if(e.matches){playing=false;sync()}});
window.addEventListener('resize',draw);document.addEventListener('visibilitychange',sync);
setModel('base');sync();
})();
