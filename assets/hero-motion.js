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
  var PAPER=[251,250,247];
  function inkRGB(){var v=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim().replace('#','');
    if(v.length===3)v=v[0]+v[0]+v[1]+v[1]+v[2]+v[2];
    return v.length>=6?[parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)]:[20,20,20];}
  /* Globe starts light over the always-dark hero, ends on --ink so it lands correctly on light OR dark content. */
  function lerpCol(f){var k=inkRGB();var r=Math.round(PAPER[0]+(k[0]-PAPER[0])*f),gg=Math.round(PAPER[1]+(k[1]-PAPER[1])*f),b=Math.round(PAPER[2]+(k[2]-PAPER[2])*f);return 'rgb('+r+','+gg+','+b+')';}
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
    src.style.opacity='0'; svg.style.display='block';
    svg.setAttribute('viewBox','0 0 '+W+' '+H);

    var S=window.scrollY, SPREAD=1.35, cornerR=42;
    var u=clamp01(S/Math.max(H,1));          /* whole animation over ~one viewport of scroll */
    var te=ease(u);

    /* apartness: disassemble early, hold apart, reassemble as it lands in the corner */
    var A;
    if(u<0.40) A=u/0.40;
    else if(u<0.75) A=1;
    else A=1-(u-0.75)/0.25;
    A=clamp01(A);
    function pa(ord){return ease(clamp01((A-ord*STAG)/WIN));}

    /* Position: anchored in the hero (scrolls up with the page) while it disassembles,
       then blends to the fixed bottom-right corner as it reassembles. */
    var srcY=start.cy - S;
    var cx=lerp(start.cx, W-64, te), cy=lerp(srcY, H-64, te), R=lerp(start.R, cornerR, te), s=R/45;
    g.setAttribute('transform','translate('+cx.toFixed(1)+','+cy.toFixed(1)+') scale('+s.toFixed(3)+')');
    var col=lerpCol(clamp01(S/Math.max(start.heroBottom-start.cy,1)));
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

/* Lock the hero tagline "MOVE THE WORLD" to the exact width of the ATLAS wordmark
   by distributing letter-spacing evenly (mirrors SVG lengthAdjust="spacing"). */
(function(){
  function fitTagline(){
    var tags=document.querySelectorAll('.hero-tagline');
    for(var i=0;i<tags.length;i++){
      var tag=tags[i], lock=tag.closest('.hero-lockup');
      if(!lock) continue;
      var wm=lock.querySelector('.hero-title');
      if(!wm) continue;
      var wmR=wm.getBoundingClientRect(), W=wmR.width;
      tag.style.letterSpacing='0px'; tag.style.marginRight='0px'; tag.style.marginTop='0px'; tag.style.width='auto';
      var w=tag.getBoundingClientRect().width;
      var chars=tag.textContent.length;
      if(chars<1||W<=0||w<=0) continue;
      var ls=(W-w)/chars;
      tag.style.letterSpacing=ls+'px';
      tag.style.width=W+'px';
      tag.style.marginRight=(-ls)+'px';
      var g0=tag.getBoundingClientRect().top-wmR.bottom;
      tag.style.marginTop=(wmR.height*0.22-g0)+'px';
    }
  }
  window.addEventListener('load',fitTagline);
  window.addEventListener('resize',fitTagline);
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(fitTagline);}
})();
