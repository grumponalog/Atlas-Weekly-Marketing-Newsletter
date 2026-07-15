/* ------------------------------------------------------------------
   ATLAS — homepage hero globe motion
   The primary mark (wireframe globe + side shadows) sits assembled on
   the right of the hero, comes apart through the first half of the
   scroll, then reassembles into the bottom-right corner at the bottom.
   Color runs light (paper) at the top → ink by the time it locks in.
   Disabled under 900px, honors prefers-reduced-motion.
   ------------------------------------------------------------------ */
(function(){
  var svg = document.getElementById('heromark');
  if(!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* defs — side-shadow mask (full circle minus inner ellipse = the two crescents) */
  var defs = document.createElementNS(NS,'defs');
  var mask = document.createElementNS(NS,'mask');
  mask.setAttribute('id','heroShadowMask');
  mask.setAttribute('maskUnits','userSpaceOnUse');
  mask.setAttribute('x','-60'); mask.setAttribute('y','-60');
  mask.setAttribute('width','120'); mask.setAttribute('height','120');
  var mC = document.createElementNS(NS,'circle');
  mC.setAttribute('cx',0); mC.setAttribute('cy',0); mC.setAttribute('r',45); mC.setAttribute('fill','#fff');
  var mE = document.createElementNS(NS,'ellipse');
  mE.setAttribute('cx',0); mE.setAttribute('cy',0); mE.setAttribute('rx',39); mE.setAttribute('ry',45); mE.setAttribute('fill','#000');
  mask.appendChild(mC); mask.appendChild(mE);
  defs.appendChild(mask); svg.appendChild(defs);

  var g = document.createElementNS(NS,'g'); svg.appendChild(g);

  function el(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);g.appendChild(e);return e;}

  /* side shadows — filled, masked; sits behind the wireframe */
  var shadow = el('circle',{cx:0,cy:0,r:45,stroke:'none',mask:'url(#heroShadowMask)'});
  var shadowVec = {sx:62,sy:-6,rot:8,cxp:0,cyp:0};

  /* wireframe strokes */
  function stroke(e){e.style.fill='none';e.style.strokeWidth=3;return e;}
  var parts=[
   {el:stroke(el('circle',{cx:0,cy:0,r:45})),                 sx:-58,sy:-48,rot:-28,cxp:0,cyp:0},
   {el:stroke(el('ellipse',{cx:0,cy:0,rx:14,ry:45})),         sx:66, sy:16, rot:44, cxp:0,cyp:0},
   {el:stroke(el('ellipse',{cx:0,cy:0,rx:37,ry:8})),          sx:-78,sy:6,  rot:16, cxp:0,cyp:0},
   {el:stroke(el('ellipse',{cx:0,cy:-18,rx:34,ry:8})),        sx:6,  sy:-74,rot:-14,cxp:0,cyp:-18},
   {el:stroke(el('ellipse',{cx:0,cy:18,rx:34,ry:8})),         sx:-6, sy:76, rot:14, cxp:0,cyp:18}
  ];

  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function lerpCol(f){
    var r=Math.round(251+(20-251)*f), gg=Math.round(250+(20-250)*f), b=Math.round(247+(20-247)*f);
    return 'rgb('+r+','+gg+','+b+')';
  }
  function progress(){
    var m=document.documentElement.scrollHeight-window.innerHeight;
    return m<=0?0:Math.min(1,Math.max(0,window.scrollY/m));
  }

  var ticking=false;
  function render(){
    var W=window.innerWidth, H=window.innerHeight;
    if(W<900) return;
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    var p=reduce?1:progress(), e=ease(p), d=p<0.5?p/0.5:(1-p)/0.5, de=ease(d);
    var heroCx=W*0.72, heroCy=H*0.32, cornerCx=W-64, cornerCy=H-64;
    var heroR=Math.min(W,H)*0.26, cornerR=44;
    var cx=heroCx+(cornerCx-heroCx)*e, cy=heroCy+(cornerCy-heroCy)*e, R=heroR+(cornerR-heroR)*e, s=R/45;
    g.setAttribute('transform','translate('+cx.toFixed(1)+','+cy.toFixed(1)+') scale('+s.toFixed(3)+') rotate('+(de*-16).toFixed(1)+')');
    var col=lerpCol(reduce?1:e);
    // shadow
    shadow.style.fill=col;
    shadow.setAttribute('transform','translate('+(shadowVec.sx*de).toFixed(1)+','+(shadowVec.sy*de).toFixed(1)+') rotate('+(shadowVec.rot*de).toFixed(1)+' '+shadowVec.cxp+' '+shadowVec.cyp+')');
    shadow.setAttribute('opacity',(1-0.4*de).toFixed(2));
    // strokes
    parts.forEach(function(o){
      o.el.style.stroke=col;
      o.el.setAttribute('transform','translate('+(o.sx*de).toFixed(1)+','+(o.sy*de).toFixed(1)+') rotate('+(o.rot*de).toFixed(1)+' '+o.cxp+' '+o.cyp+')');
      o.el.setAttribute('opacity',(1-0.35*de).toFixed(2));
    });
    ticking=false;
  }

  render();
  if(!reduce){
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(render);}},{passive:true});
  }
  window.addEventListener('resize',render);
})();
