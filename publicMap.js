const TILE_SIZE = 256

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

export function mapPublicationProjectId(mapId) {
  const raw = String(mapId || 'map')
  let hash = 2166136261
  for (let index = 0; index < raw.length; index += 1) {
    hash ^= raw.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  const stem = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44) || 'map'
  return `map-${stem}-${(hash >>> 0).toString(36)}`
}

export function buildPublicMapHtml(record) {
  const title = escapeHtml(record.title)
  const subtitle = escapeHtml(record.subtitle || `${record.places.length} places in ${record.area}`)
  const data = safeJson({
    title: record.title,
    subtitle: record.subtitle || '',
    area: record.area || '',
    center: record.center,
    zoom: Math.max(13, Math.min(18, Number(record.zoom) || 15)),
    places: record.places,
  })

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#101514">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${subtitle}">
  <title>${title} · Möbius Maps</title>
  <style>
    @font-face{font-family:Inter;src:url("/vendor/fonts/inter-400.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
    @font-face{font-family:Inter;src:url("/vendor/fonts/inter-700.woff2") format("woff2");font-weight:700 900;font-style:normal;font-display:swap}
    *{box-sizing:border-box}
    :root{color-scheme:dark;--bg:#101514;--surface:#171d1b;--surface2:#202825;--text:#f4f7f5;--muted:#a5b0ab;--line:#303a36;--accent:#9b7cff;--coral:#ff735f;--mint:#d9f4e7;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}
    body{background:radial-gradient(circle at 84% -10%,rgba(155,124,255,.18),transparent 30rem),var(--bg)}
    button,a{font:inherit;-webkit-tap-highlight-color:transparent}
    button:focus-visible,a:focus-visible{outline:3px solid rgba(155,124,255,.58);outline-offset:3px}
    .page{width:min(1180px,100%);margin:0 auto;padding:clamp(18px,4vw,38px) clamp(14px,3vw,28px) calc(28px + env(safe-area-inset-bottom))}
    .brand{display:flex;align-items:center;gap:9px;margin-bottom:20px;color:var(--muted);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
    .brand-mark{width:29px;height:29px;display:grid;place-items:center;border-radius:10px;background:linear-gradient(145deg,var(--accent),#6945da);color:white;font-size:16px;box-shadow:0 8px 22px rgba(91,59,187,.28)}
    .hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:20px}
    .kicker{margin:0 0 7px;color:var(--accent);font-size:11px;font-weight:850;letter-spacing:.15em;text-transform:uppercase}
    h1{max-width:780px;margin:0;font-size:clamp(32px,6vw,58px);line-height:.98;letter-spacing:-.052em}
    .subtitle{max-width:680px;margin:10px 0 0;color:var(--muted);font-size:clamp(15px,2vw,18px);line-height:1.45}
    .count{flex:none;padding:8px 12px;border:1px solid var(--line);border-radius:999px;background:rgba(23,29,27,.75);color:var(--muted);font-size:12px;font-weight:750}
    .layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,.8fr);gap:16px;align-items:start}
    .map-card,.detail{border:1px solid var(--line);border-radius:24px;background:var(--surface);box-shadow:0 22px 50px rgba(0,0,0,.2);overflow:hidden}
    .map{position:relative;height:min(67vh,690px);min-height:470px;overflow:hidden;background:#d9e2db;touch-action:none;cursor:grab;isolation:isolate}
    .map.is-dragging{cursor:grabbing}
    .tiles,.pins{position:absolute;inset:0}
    .tile{position:absolute;max-width:none;user-select:none;-webkit-user-drag:none}
    .pin{position:absolute;width:42px;height:42px;display:grid;place-items:center;padding:0;border:4px solid rgba(255,255,255,.9);border-radius:50% 50% 50% 11px;background:var(--coral);color:#fff;font-weight:900;box-shadow:0 8px 22px rgba(25,45,39,.34);transform:translate(-50%,-95%) rotate(-45deg);cursor:pointer;transition:transform .16s ease,background .16s ease}
    .pin span{transform:rotate(45deg)}
    .pin:hover,.pin.is-selected{z-index:3;background:#26594e;transform:translate(-50%,-100%) rotate(-45deg) scale(1.12)}
    .zoom{position:absolute;top:14px;right:14px;z-index:5;display:grid;gap:7px}
    .zoom button{width:44px;height:44px;padding:0;border:1px solid rgba(24,44,38,.16);border-radius:14px;background:rgba(255,255,255,.94);color:#18332d;font-size:22px;font-weight:700;box-shadow:0 8px 20px rgba(25,45,39,.2);cursor:pointer}
    .credit{position:absolute;right:8px;bottom:7px;z-index:4;padding:3px 6px;border-radius:6px;background:rgba(255,255,255,.82);color:#29453e;font-size:10px;text-decoration:none}
    .place-strip{display:flex;gap:8px;padding:12px;overflow-x:auto;border-top:1px solid var(--line);scrollbar-width:none}
    .place-strip::-webkit-scrollbar{display:none}
    .place-tab{min-height:44px;display:inline-flex;align-items:center;gap:8px;flex:none;padding:6px 12px 6px 7px;border:1px solid var(--line);border-radius:999px;background:var(--surface2);color:var(--muted);font-size:12px;font-weight:780;cursor:pointer}
    .place-tab span{width:29px;height:29px;display:grid;place-items:center;border-radius:50%;background:var(--mint);color:#245246}
    .place-tab.is-selected{border-color:rgba(155,124,255,.7);color:var(--text);background:rgba(155,124,255,.12)}
    .place-tab.is-selected span{background:var(--coral);color:#fff}
    .detail{position:sticky;top:18px;padding:22px}
    .detail-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}
    .number{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:var(--coral);color:#fff;font-weight:900}
    .walk{color:var(--muted);font-size:12px;font-weight:760}
    .best{margin:0 0 7px;color:var(--accent);font-size:10px;font-weight:850;letter-spacing:.14em;text-transform:uppercase}
    h2{margin:0;font-size:clamp(25px,3vw,34px);line-height:1.02;letter-spacing:-.04em}
    .price{display:inline-flex;margin-top:12px;padding:6px 10px;border-radius:10px;background:var(--mint);color:#265347;font-size:12px;font-weight:850}
    .note{margin:18px 0 15px;color:#c3cbc7;line-height:1.58}
    .address{display:flex;gap:8px;margin:0;color:var(--muted);font-size:13px;line-height:1.45}
    .address:before{content:"•";color:var(--accent);font-size:20px;line-height:.7;font-weight:900}
    .details{display:grid;gap:8px;margin-top:17px;padding-top:16px;border-top:1px solid var(--line)}
    .detail-row{min-width:0;display:flex;align-items:center;gap:9px;color:var(--muted);font-size:12px;line-height:1.4;text-decoration:none}
    .detail-row:hover{color:var(--text)}.detail-row .icon{width:30px;color:var(--accent);font-size:9px;font-weight:900;letter-spacing:.06em;text-align:left;flex:none}.detail-row .out{margin-left:auto;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.06em}
    .detail-row.rating{color:var(--text);font-weight:800}.detail-row.rating .icon{color:#e4a82e}.detail-row small{margin-left:auto;color:var(--muted);font-weight:500}
    .directions{min-height:48px;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:18px;border-radius:14px;background:#286153;color:white;font-weight:850;text-decoration:none}
    .foot{margin:18px 4px 0;color:#77827d;font-size:11px}
    @media(max-width:760px){
      .page{padding-top:18px}.brand{margin-bottom:16px}.hero{align-items:flex-start}.count{display:none}
      .layout{display:flex;flex-direction:column}.map-card,.detail{width:100%;border-radius:20px}
      .map{height:48vh;min-height:350px}.detail{position:static;padding:19px}.place-strip{padding:10px}
    }
    @media(prefers-reduced-motion:reduce){.pin{transition:none}}
  </style>
</head>
<body>
  <main class="page">
    <div class="brand"><span class="brand-mark">M</span><span>Shared from Möbius Maps</span></div>
    <header class="hero">
      <div><p class="kicker" id="area"></p><h1 id="title"></h1><p class="subtitle" id="subtitle"></p></div>
      <span class="count" id="count"></span>
    </header>
    <div class="layout">
      <section class="map-card" aria-label="Interactive map">
        <div class="map" id="map" tabindex="0" aria-label="Drag to move the map. Pinch, use two fingers on a trackpad, double-tap, or use plus and minus to zoom.">
          <div class="tiles" id="tiles" aria-hidden="true"></div>
          <div class="pins" id="pins"></div>
          <div class="zoom"><button id="zoom-in" type="button" aria-label="Zoom in">+</button><button id="zoom-out" type="button" aria-label="Zoom out">−</button></div>
          <a class="credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
        </div>
        <div class="place-strip" id="place-strip" aria-label="Places"></div>
      </section>
      <aside class="detail" aria-live="polite">
        <div class="detail-top"><span class="number" id="number"></span><span class="walk" id="walk"></span></div>
        <p class="best" id="best"></p><h2 id="place-name"></h2><span class="price" id="price"></span>
        <p class="note" id="note"></p><p class="address" id="address"></p>
        <div class="details" id="details" aria-label="Place details"></div>
        <a class="directions" id="directions" target="_blank" rel="noreferrer">Open directions</a>
        <p class="foot">Details were recorded when this map was created and may change.</p>
      </aside>
    </div>
  </main>
  <script id="map-data" type="application/json">${data}</script>
  <script>
  (function(){
    'use strict';
    var data=JSON.parse(document.getElementById('map-data').textContent);
    var map=document.getElementById('map'),tiles=document.getElementById('tiles'),pins=document.getElementById('pins');
    var strip=document.getElementById('place-strip'),details=document.getElementById('details');
    var view={center:data.center,zoom:data.zoom},selected=0,tileNodes={},drawFrame=null,pointers={};
    var gesture={drag:null,pinch:null,doubleDrag:null,moved:false,lastTap:null};
    var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
    function world(p,z){var scale=${TILE_SIZE}*Math.pow(2,z),lat=clamp(p.lat,-85.05112878,85.05112878),sin=Math.sin(lat*Math.PI/180);return{x:(p.lon+180)/360*scale,y:(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*scale}}
    function point(pixel,z){var scale=${TILE_SIZE}*Math.pow(2,z),lon=pixel.x/scale*360-180,n=Math.PI-2*Math.PI*pixel.y/scale;return{lat:180/Math.PI*Math.atan(Math.sinh(n)),lon:lon}}
    function pixel(p){var a=world(p,view.zoom),b=world(view.center,view.zoom);return{x:a.x-b.x+map.clientWidth/2,y:a.y-b.y+map.clientHeight/2}}
    function pan(center,dx,dy,zoom){var origin=world(center,zoom);return point({x:origin.x-dx,y:origin.y-dy},zoom)}
    function zoomCenterAt(center,local,zoom,nextZoom){
      var origin=world(center,zoom),target=point({x:origin.x+local.x-map.clientWidth/2,y:origin.y+local.y-map.clientHeight/2},zoom),next=world(target,nextZoom);
      return point({x:next.x-local.x+map.clientWidth/2,y:next.y-local.y+map.clientHeight/2},nextZoom)
    }
    function draw(){
      var z=Math.floor(view.zoom),scale=Math.pow(2,view.zoom-z),center=world(view.center,view.zoom),halfW=map.clientWidth/2,halfH=map.clientHeight/2,n=Math.pow(2,z),tileSize=${TILE_SIZE}*scale,needed={};
      var minX=Math.floor((center.x-halfW)/tileSize),maxX=Math.floor((center.x+halfW)/tileSize);
      var minY=Math.max(0,Math.floor((center.y-halfH)/tileSize)),maxY=Math.min(n-1,Math.floor((center.y+halfH)/tileSize));
      for(var x=minX;x<=maxX;x++){for(var y=minY;y<=maxY;y++){
        var wrapped=((x%n)+n)%n,key=z+'/'+wrapped+'/'+y,img=tileNodes[key];needed[key]=true;
        if(!img){img=document.createElement('img');img.className='tile';img.alt='';img.draggable=false;img.referrerPolicy='no-referrer';img.src='https://tile.openstreetmap.org/'+key+'.png';tileNodes[key]=img;tiles.appendChild(img)}
        img.style.left=(x*tileSize-center.x+halfW)+'px';img.style.top=(y*tileSize-center.y+halfH)+'px';img.style.width=tileSize+'px';img.style.height=tileSize+'px';
      }}
      Object.keys(tileNodes).forEach(function(key){if(!needed[key]){tileNodes[key].remove();delete tileNodes[key]}});
      Array.prototype.forEach.call(pins.children,function(pin,index){var p=pixel(data.places[index]);pin.style.left=p.x+'px';pin.style.top=p.y+'px'});
    }
    function scheduleDraw(){if(drawFrame!==null)return;drawFrame=requestAnimationFrame(function(){drawFrame=null;draw()})}
    function local(clientX,clientY){var rect=map.getBoundingClientRect();return{x:clientX-rect.left,y:clientY-rect.top}}
    function zoomAt(localPoint,nextZoom){nextZoom=clamp(nextZoom,13,18);if(nextZoom===view.zoom)return;view={zoom:nextZoom,center:zoomCenterAt(view.center,localPoint,view.zoom,nextZoom)};scheduleDraw()}
    function setText(id,value){document.getElementById(id).textContent=value||''}
    function addDetail(icon,label,href,className,tail){
      var node=document.createElement(href?'a':'span');node.className='detail-row'+(className?' '+className:'');
      if(href){node.href=href;if(!href.startsWith('tel:')){node.target='_blank';node.rel='noreferrer'}}
      var iconNode=document.createElement('span');iconNode.className='icon';iconNode.textContent=icon;var labelNode=document.createElement('span');labelNode.textContent=label;node.appendChild(iconNode);node.appendChild(labelNode);
      if(tail){var tailNode=document.createElement('small');tailNode.className='out';tailNode.textContent=tail;node.appendChild(tailNode)}details.appendChild(node)
    }
    function coordinateOnlyMapsSearch(value){try{var query=new URL(value).searchParams.get('query')||'';return /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(query)}catch(error){return false}}
    function googleMapsUrl(value){try{var url=new URL(value),host=url.hostname.toLowerCase(),googleHost=host==='google.com'||host.endsWith('.google.com')||/^(?:www|maps)\.google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(host)||host==='goo.gl'||host.endsWith('.goo.gl');return url.protocol==='https:'&&googleHost}catch(error){return false}}
    function mapsUrl(place){var saved=String(place.google_maps_url||place.maps_url||'').trim();if(saved&&googleMapsUrl(saved)&&!coordinateOnlyMapsSearch(saved))return saved;var query=[place.name,place.address].map(function(value){return String(value||'').trim()}).filter(Boolean).join(', ')||(place.lat+','+place.lon);return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query)}
    function websiteUrl(value){value=String(value);return value.startsWith('http://')||value.startsWith('https://')?value:'https://'+value}
    function websiteLabel(value){try{var host=new URL(websiteUrl(value)).hostname;return host.startsWith('www.')?host.slice(4):host}catch(error){return 'Website'}}
    function select(index){
      selected=index;var place=data.places[index];
      Array.prototype.forEach.call(pins.children,function(node,i){node.classList.toggle('is-selected',i===index);node.setAttribute('aria-pressed',String(i===index))});
      Array.prototype.forEach.call(strip.children,function(node,i){node.classList.toggle('is-selected',i===index)});
      setText('number',String(index+1));setText('walk',place.walk);setText('best',place.best_for);setText('place-name',place.name);
      setText('price',place.price);setText('note',place.note);setText('address',place.address);details.textContent='';
      var rating=Number(place.rating),reviewCount=Number(place.review_count);
      if(Number.isFinite(rating)){var summary=rating.toFixed(1)+(Number.isFinite(reviewCount)&&reviewCount>0?' · '+reviewCount.toLocaleString()+' reviews':'');addDetail('★',summary,'','rating',place.rating_source||'')}
      if(place.hours)addDetail('HRS',place.hours);
      if(place.website)addDetail('WEB',websiteLabel(place.website),websiteUrl(place.website),'','Open');
      if(place.phone)addDetail('TEL',place.phone,'tel:'+String(place.phone).replace(/[^0-9+]/g,''));
      addDetail('MAP','Google Maps',mapsUrl(place),'','Open');
      document.getElementById('directions').href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(place.lat+','+place.lon);
    }
    setText('area',data.area);setText('title',data.title);setText('subtitle',data.subtitle);setText('count',data.places.length+' places');
    data.places.forEach(function(place,index){
      var pin=document.createElement('button');pin.type='button';pin.className='pin';pin.innerHTML='<span>'+(index+1)+'</span>';pin.setAttribute('aria-label',place.name);pin.onclick=function(){select(index)};pins.appendChild(pin);
      var tab=document.createElement('button');tab.type='button';tab.className='place-tab';var badge=document.createElement('span');badge.textContent=index+1;var label=document.createElement('strong');label.textContent=place.short_name||place.name;tab.appendChild(badge);tab.appendChild(label);tab.onclick=function(){select(index);tab.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})};strip.appendChild(tab);
    });
    function centerPoint(){return{x:map.clientWidth/2,y:map.clientHeight/2}}
    document.getElementById('zoom-in').onclick=function(){zoomAt(centerPoint(),view.zoom+1)};document.getElementById('zoom-out').onclick=function(){zoomAt(centerPoint(),view.zoom-1)};
    function wheelDelta(event){var pixels=event.deltaMode===1?event.deltaY*16:event.deltaMode===2?event.deltaY*800:event.deltaY;return clamp(-pixels/160,-0.5,0.5)}
    map.addEventListener('wheel',function(event){event.preventDefault();zoomAt(local(event.clientX,event.clientY),view.zoom+wheelDelta(event))},{passive:false});
    map.addEventListener('keydown',function(event){
      if(event.key==='+'||event.key==='='){event.preventDefault();zoomAt(centerPoint(),view.zoom+1)}
      else if(event.key==='-'||event.key==='_'){event.preventDefault();zoomAt(centerPoint(),view.zoom-1)}
      else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].indexOf(event.key)>=0){event.preventDefault();var dx=event.key==='ArrowLeft'?44:event.key==='ArrowRight'?-44:0,dy=event.key==='ArrowUp'?44:event.key==='ArrowDown'?-44:0;view={center:pan(view.center,dx,dy,view.zoom),zoom:view.zoom};scheduleDraw()}
    });
    function pointerList(){return Object.keys(pointers).map(function(key){return pointers[key]})}
    function resetDrag(pointer){gesture.drag=pointer?{x:pointer.x,y:pointer.y,center:view.center,zoom:view.zoom}:null;gesture.moved=false}
    map.addEventListener('pointerdown',function(event){
      if(event.target.closest('.pin,.zoom,.credit'))return;map.setPointerCapture(event.pointerId);pointers[event.pointerId]={x:event.clientX,y:event.clientY};var list=pointerList();map.classList.add('is-dragging');
      if(list.length===1){var localPoint=local(event.clientX,event.clientY),last=gesture.lastTap;if(last&&Date.now()-last.time<350&&Math.hypot(localPoint.x-last.x,localPoint.y-last.y)<36){gesture.doubleDrag={pointerId:event.pointerId,startY:event.clientY,startZoom:view.zoom,startCenter:view.center,point:localPoint};gesture.drag=null;gesture.moved=true}else resetDrag(list[0])}
      else if(list.length===2){gesture.pinch={distance:Math.hypot(list[0].x-list[1].x,list[0].y-list[1].y),startZoom:view.zoom,startCenter:view.center,point:local((list[0].x+list[1].x)/2,(list[0].y+list[1].y)/2)};gesture.doubleDrag=null;gesture.drag=null;gesture.moved=true}
    });
    map.addEventListener('pointermove',function(event){
      if(!pointers[event.pointerId])return;pointers[event.pointerId]={x:event.clientX,y:event.clientY};
      if(gesture.doubleDrag&&gesture.doubleDrag.pointerId===event.pointerId){var dd=gesture.doubleDrag,next=clamp(dd.startZoom+(event.clientY-dd.startY)/110,13,18);view={zoom:next,center:zoomCenterAt(dd.startCenter,dd.point,dd.startZoom,next)};scheduleDraw();return}
      var list=pointerList();if(list.length>=2&&gesture.pinch){var pinch=gesture.pinch,distance=Math.hypot(list[0].x-list[1].x,list[0].y-list[1].y),nextZoom=clamp(pinch.startZoom+Math.log2(distance/Math.max(1,pinch.distance)),13,18);view={zoom:nextZoom,center:zoomCenterAt(pinch.startCenter,pinch.point,pinch.startZoom,nextZoom)};scheduleDraw();return}
      if(!gesture.drag||!list.length)return;var dx=list[0].x-gesture.drag.x,dy=list[0].y-gesture.drag.y;if(Math.hypot(dx,dy)>4)gesture.moved=true;view={zoom:gesture.drag.zoom,center:pan(gesture.drag.center,dx,dy,gesture.drag.zoom)};scheduleDraw()
    });
    function end(event){
      if(!pointers[event.pointerId])return;var pointer=pointers[event.pointerId];delete pointers[event.pointerId];var remaining=pointerList(),dd=gesture.doubleDrag;
      if(dd&&dd.pointerId===event.pointerId){if(Math.abs(event.clientY-dd.startY)<10)zoomAt(dd.point,view.zoom+1);gesture.doubleDrag=null;gesture.lastTap=null}
      else if(!remaining.length&&!gesture.moved){var tap=local(pointer.x,pointer.y);gesture.lastTap={x:tap.x,y:tap.y,time:Date.now()}}
      gesture.pinch=null;resetDrag(remaining[0]);if(!remaining.length)map.classList.remove('is-dragging')
    }
    map.addEventListener('pointerup',end);map.addEventListener('pointercancel',end);
    new ResizeObserver(scheduleDraw).observe(map);select(0);draw();
  })();
  </script>
</body>
</html>`
}
