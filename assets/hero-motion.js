/* ------------------------------------------------------------------
   ATLAS — homepage hero globe motion
   The globe sits in the hero lockup (beside ATLAS). On scroll it hands
   off to a fixed overlay that breaks apart, travels to the bottom-right
   corner, and reassembles there — darkening paper -> ink along the way.
   At the very top the static lockup globe shows (so it's correct with
   JS off / reduced motion). Disabled under 900px.
   ------------------------------------------------------------------ */
(function(){
  var src = document.querySelector('.hero .hero-mark');
  if(!src) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS,'svg');
  svg.setAttribute('aria-hidden','true');
  svg.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;display:none';

  var defs = document.createElementNS(NS,'defs');
  var mask = document.createElementNS(NS,'mask');
  mask.setAttribute('id','heroMotionShadow');
  mask.setAttribute('maskUnits','userSpaceOnUse');
  mask.setAttribute('x','-60'); mask.setAttribute('y','-60');
  mask.setAttribute('width','120'); mask.setAttribute('height','120');
  var mC=document.createElementNS(NS,'circle'); mC.setAttribute('cx',0);mC.setAttribute('cy',0);mC.setAttribute('r',45);mC.setAttribute('fill','#fff');
  var mE=document.createElementNS(NS,'ellipse'); mE.setAttribute('cx',0);mE.setAttribute('cy',0);mE.setAttribute('rx',39);mE.setAttribute('ry',45);mE.setAttribute('fill','#000');
  mask.appendChild(mC); mask.appendChild(mE); defs.appendChild(mask); svg.appendChild(defs);

  var g = document.createElementNS(NS,'g'); svg.appendChild(g);
  function el(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);g.appendChild(e);return e;}

  var shadow = el('circle',{cx:0,cy:0,r:45,stroke:'none',mask:'url(#heroMotionShadow)'});
  var sVec = {sx:62,sy:-6,rot:8,cxp:0,cyp:0,ord:4};
  function stroke(e){e.style.fill='none';e.style.strokeWidth=3;return e;}
  /* ord = detach order: small rings peel first, meridian, shadow, outer circle LAST */
  var parts=[
   {el:stroke(el('circle',{cx:0,cy:0,r:45})),          sx:-58,sy:-48,rot:-28,cxp:0,cyp:0,  ord:5},
   {el:stroke(el('ellipse',{cx:0,cy:0,rx:14,ry:45})),  sx:66, sy:16, rot:44, cxp:0,cyp:0,  ord:3},
   {el:stroke(el('ellipse',{cx:0,cy:0,rx:37,ry:8})),   sx:-78,sy:6,  rot:16, cxp:0,cyp:0,  ord:1},
   {el:stroke(el('ellipse',{cx:0,cy:-18,rx:34,ry:8})), sx:6,  sy:-74,rot:-14,cxp:0,cyp:-18, ord:0},
   {el:stroke(el('ellipse',{cx:0,cy:18,rx:34,ry:8})),  sx:-6, sy:76, rot:14, cxp:0,cyp:18,  ord:2}
  ];
  var NORD=6, STAG=0.13, WIN=1-STAG*(NORD-1);
  function clamp01(x){return x<0?0:(x>1?1:x);}
  document.body.appendChild(svg);

  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function lerp(a,b,t){return a+(b-a)*t;}
  function lerpCol(f){var r=Math.round(251+(20-251)*f),gg=Math.round(250+(20-250)*f),b=Math.round(247+(20-247)*f);return 'rgb('+r+','+gg+','+b+')';}
  function progress(){var m=document.documentElement.scrollHeight-window.innerHeight;return m<=0?0:Math.min(1,Math.max(0,window.scrollY/m));}

  var start=null;
  function measure(){
    var r=src.getBoundingClientRect();
    var hero=document.querySelector('.hero');
    start={ cx:r.left+r.width/2, cy:r.top+window.scrollY+r.height/2, R:r.height*0.46875,
            heroBottom: hero ? hero.getBoundingClientRect().bottom+window.scrollY : window.innerHeight*0.4 };
  }

  var ticking=false;
  function render(){
    var W=window.innerWidth, H=window.innerHeight;
    if(W<900){ svg.style.display='none'; src.style.opacity=''; ticking=false; return; }
    if(!start) measure();
    var p=progress();
    /* The globe IS the pinned overlay: fixed to its spot, never scrolls with the page. */
    src.style.opacity='0'; svg.style.display='block';
    svg.setAttribute('viewBox','0 0 '+W+' '+H);

    /* Phase timeline: [0..a] disassemble in place, [a..b] pieces travel down, [b..1] reassemble at bottom */
    var a=0.30, b=0.72, SPREAD=1.35;
    var A, tRaw;
    if(p<a){ A=p/a; tRaw=0; }
    else if(p<b){ A=1; tRaw=(p-a)/(b-a); }
    else { A=(1-p)/(1-b); tRaw=1; }
    var t=ease(tRaw);
    /* per-piece apartness: each ord detaches in sequence, reassembles in reverse */
    function pa(ord){return ease(clamp01((A-ord*STAG)/WIN));}

    /* Pinned x + size; travels straight down to reassemble at the bottom of the screen */
    var cx=start.cx, cy=lerp(start.cy, H-70, t), s=start.R/45;
    g.setAttribute('transform','translate('+cx.toFixed(1)+','+cy.toFixed(1)+') scale('+s.toFixed(3)+')');
    var col=lerpCol(clamp01(window.scrollY/Math.max(start.heroBottom-start.cy,1)));
    var ds=pa(sVec.ord);
    shadow.style.fill=col;
    shadow.setAttribute('transform','translate('+(sVec.sx*SPREAD*ds).toFixed(1)+','+(sVec.sy*SPREAD*ds).toFixed(1)+') rotate('+(sVec.rot*ds).toFixed(1)+' '+sVec.cxp+' '+sVec.cyp+')');
    shadow.setAttribute('opacity',(1-0.45*ds).toFixed(2));
    parts.forEach(function(o){
      var dp=pa(o.ord);
      o.el.style.stroke=col;
      o.el.setAttribute('transform','translate('+(o.sx*SPREAD*dp).toFixed(1)+','+(o.sy*SPREAD*dp).toFixed(1)+') rotate('+(o.rot*dp).toFixed(1)+' '+o.cxp+' '+o.cyp+')');
      o.el.setAttribute('opacity',(1-0.35*dp).toFixed(2));
    });
    ticking=false;
  }

  render();
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(render);}},{passive:true});
  window.addEventListener('resize',function(){measure();render();});
})();
