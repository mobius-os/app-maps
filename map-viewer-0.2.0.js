(function registerMobiusMapViewer(global) {
  'use strict'

  if (global.customElements.get('mobius-map-viewer')) return

  var TILE_TEMPLATE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  var STYLE_ID = 'mobius-map-viewer-0-2-0'

  var ICONS = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15a4 4 0 0 1-4 4H8l-4 2 1.3-4.3A7 7 0 0 1 4 12c0-4 3.6-7 8-7s8 3 8 7v3Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-2-2 2c-3.6-1.3-6.7-4.4-8-8l2-2-2-4Z"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/></svg>',
    directions: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 4 6 6-6 6M20 10H9a5 5 0 0 0-5 5v5"/></svg>',
    external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6m0-6-9 9M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  }

  var CSS = [
    'mobius-map-viewer{display:block;min-height:100%;color:var(--text,#f4f7f5);font-family:var(--font,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}',
    'mobius-map-viewer *{box-sizing:border-box}',
    'mobius-map-viewer [hidden]{display:none!important}',
    'mobius-map-viewer button,mobius-map-viewer a{font:inherit;-webkit-tap-highlight-color:transparent}',
    '.mv-root{--mv-forest:#234f45;--mv-mint:#dff3e8;--mv-coral:#f4745f;min-height:100%;overflow-x:hidden;background:radial-gradient(circle at 90% -10%,color-mix(in srgb,var(--accent,#9b7cff) 14%,transparent),transparent 34%),var(--bg,#101514)}',
    '.mv-page{width:min(1240px,100%);min-height:100%;margin:0 auto;padding-bottom:18px}',
    '.mv-header{display:flex;align-items:flex-start;gap:18px;padding:22px 22px 16px}',
    '.mv-back{width:40px;height:40px;display:grid;place-items:center;flex:none;margin-top:3px;padding:0;border:1px solid var(--border,#303a36);border-radius:13px;color:var(--text,#f4f7f5);background:color-mix(in srgb,var(--surface,#171d1b) 88%,transparent);cursor:pointer}',
    '.mv-back svg,.mv-chip svg,.mv-row svg,.mv-primary svg,.mv-secondary svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    '.mv-title{min-width:0;flex:1}',
    '.mv-kicker{margin:0;color:var(--accent,#9b7cff);font-size:11px;line-height:1.2;font-weight:800;letter-spacing:.14em;text-transform:uppercase}',
    '.mv-title h1{margin:2px 0 3px;color:var(--text,#f4f7f5);font-size:clamp(25px,4vw,38px);line-height:1.02;letter-spacing:-.045em}',
    '.mv-subtitle{margin:0;color:var(--muted,#a5b0ab);font-size:14px;line-height:1.4}',
    '.mv-actions{display:flex;align-items:center;gap:8px;flex:none;margin-top:4px}',
    '.mv-chip{min-height:40px;display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid var(--border,#303a36);border-radius:999px;color:var(--text,#f4f7f5);background:color-mix(in srgb,var(--surface,#171d1b) 88%,transparent);font-size:12px;font-weight:800;cursor:pointer}',
    '.mv-chip svg{color:var(--accent,#9b7cff)}',
    '.mv-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(290px,.8fr);gap:16px;padding:0 18px 18px}',
    '.mv-map-column,.mv-info-column{min-width:0}',
    '.mv-map-card{overflow:hidden;border:1px solid var(--border,#303a36);border-radius:24px;background:#e7e5dc;box-shadow:0 16px 40px rgba(15,38,31,.11)}',
    '.mv-map{position:relative;height:clamp(380px,62vh,660px);overflow:hidden;background:#e7e5dc;isolation:isolate}',
    '.mv-map:focus-visible,.mv-back:focus-visible,.mv-chip:focus-visible,.mv-tab:focus-visible,.mv-primary:focus-visible,.mv-secondary:focus-visible{outline:3px solid color-mix(in srgb,var(--accent,#9b7cff) 50%,transparent);outline-offset:2px}',
    '.mv-attribution{position:absolute;right:6px;bottom:5px;z-index:800;padding:3px 5px;border-radius:4px;color:#344b45;background:rgba(255,255,255,.86);font-size:9px;text-decoration:none}',
    '.mv-map .leaflet-control-zoom{margin:14px 14px 0 0;border:0;box-shadow:none}',
    '.mv-map .leaflet-control-zoom a{width:42px;height:42px;line-height:40px;border:1px solid rgba(24,44,38,.14);border-radius:12px!important;background:rgba(255,255,255,.94);color:#18332d;box-shadow:0 8px 20px rgba(25,45,39,.16)}',
    '.mv-map .leaflet-control-zoom a+a{margin-top:7px}',
    '.mv-pin-shell,.mv-origin-shell{border:0!important;background:transparent!important}',
    '.mv-pin{width:38px;height:38px;display:grid;place-items:center;border:0;border-radius:50% 50% 50% 12px;color:#fff;background:var(--mv-forest);box-shadow:0 7px 18px rgba(20,51,43,.34);transform:rotate(-45deg);transition:transform .18s ease,background .18s ease,box-shadow .18s ease}',
    '.mv-pin span{transform:rotate(45deg);font-size:13px;font-weight:900}',
    '.mv-pin.is-selected{background:var(--mv-coral);transform:rotate(-45deg) scale(1.18);box-shadow:0 9px 24px rgba(244,116,95,.42)}',
    '.mv-origin{display:flex;align-items:center;gap:7px;white-space:nowrap;transform:translate(-15px,-15px)}',
    '.mv-origin-dot{width:30px;height:30px;display:grid;place-items:center;border:3px solid #fff;border-radius:50%;color:#fff;background:#101514;box-shadow:0 4px 12px rgba(0,0,0,.24);font-size:14px}',
    '.mv-origin strong{padding:5px 8px;border-radius:7px;color:#243833;background:rgba(255,255,255,.92);box-shadow:0 3px 10px rgba(0,0,0,.12);font-size:10px}',
    '.mv-strip{display:flex;gap:8px;margin-top:11px;padding:1px 1px 4px;overflow-x:auto;scrollbar-width:none}',
    '.mv-strip::-webkit-scrollbar{display:none}',
    '.mv-tab{min-height:44px;display:flex;align-items:center;gap:8px;flex:none;padding:6px 11px 6px 7px;border:1px solid var(--border,#303a36);border-radius:999px;color:var(--muted,#a5b0ab);background:var(--surface,#171d1b);cursor:pointer}',
    '.mv-tab span{width:28px;height:28px;display:grid;place-items:center;border-radius:50%;color:var(--mv-forest);background:var(--mv-mint);font-size:11px;font-weight:900}',
    '.mv-tab strong{font-size:12px}',
    '.mv-tab.is-selected{border-color:color-mix(in srgb,var(--accent,#9b7cff) 60%,var(--border,#303a36));color:var(--text,#f4f7f5);background:color-mix(in srgb,var(--accent,#9b7cff) 9%,var(--surface,#171d1b))}',
    '.mv-tab.is-selected span{color:#fff;background:var(--mv-coral)}',
    '.mv-panel{min-width:0;padding:20px;border:1px solid var(--border,#303a36);border-radius:22px;background:color-mix(in srgb,var(--surface,#171d1b) 94%,transparent);box-shadow:0 12px 30px rgba(15,38,31,.06)}',
    '.mv-topline{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}',
    '.mv-number{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;color:#fff;background:var(--mv-coral);font-size:13px;font-weight:900}',
    '.mv-walk{color:var(--muted,#a5b0ab);font-size:12px;font-weight:700}',
    '.mv-heading{min-width:0;display:grid;grid-template-columns:minmax(0,1fr);gap:10px}',
    '.mv-heading h2{margin:5px 0 0;color:var(--text,#f4f7f5);font-size:clamp(22px,3vw,31px);line-height:1.04;letter-spacing:-.04em}',
    '.mv-price{min-width:0;max-width:100%;justify-self:start;padding:7px 9px;border-radius:10px;color:var(--mv-forest);background:var(--mv-mint);font-size:12px;line-height:1.3;font-weight:850;overflow-wrap:anywhere}',
    '.mv-note{margin:16px 0 13px;color:var(--muted,#a5b0ab);font-size:14px;line-height:1.55}',
    '.mv-address{display:flex;align-items:flex-start;gap:7px;margin:0;color:var(--text,#f4f7f5);font-size:12px;line-height:1.45}',
    '.mv-address svg{width:15px;height:15px;flex:none;margin-top:1px;fill:none;stroke:var(--accent,#9b7cff);stroke-width:1.8}',
    '.mv-details{display:grid;gap:7px;margin-top:16px;padding-top:15px;border-top:1px solid var(--border,#303a36)}',
    '.mv-row{min-width:0;display:flex;align-items:center;gap:8px;color:var(--muted,#a5b0ab);font-size:12px;line-height:1.35;text-decoration:none}',
    '.mv-row>svg:first-child{flex:none;color:var(--accent,#9b7cff)}',
    '.mv-row>svg:last-child{flex:none;margin-left:auto;opacity:.7}',
    '.mv-row span{min-width:0;overflow-wrap:anywhere}',
    '.mv-row:hover{color:var(--text,#f4f7f5)}',
    '.mv-rating{color:var(--text,#f4f7f5)}.mv-rating>svg:first-child{color:#e4a82e;fill:currentColor}.mv-rating small{margin-left:auto;color:var(--muted,#a5b0ab);font-size:10px}',
    '.mv-panel-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}',
    '.mv-primary,.mv-secondary{min-height:46px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:13px;font-size:12px;font-weight:800;text-decoration:none;cursor:pointer}',
    '.mv-primary{border:1px solid var(--mv-forest);color:#fff;background:var(--mv-forest)}',
    '.mv-secondary{border:1px solid var(--border,#303a36);color:var(--text,#f4f7f5);background:var(--surface-2,#202825)}',
    '.mv-source-note{margin:14px 0 0;color:var(--muted,#a5b0ab);font-size:10px;line-height:1.4}',
    '.mv-status{position:fixed;left:50%;bottom:18px;z-index:1000;max-width:calc(100% - 32px);padding:10px 14px;border:1px solid color-mix(in srgb,var(--accent,#9b7cff) 30%,var(--border,#303a36));border-radius:999px;color:var(--text,#f4f7f5);background:color-mix(in srgb,var(--surface,#171d1b) 94%,transparent);box-shadow:0 12px 32px rgba(0,0,0,.2);font-size:13px;font-weight:750;opacity:0;pointer-events:none;transform:translate(-50%,8px);transition:opacity .16s ease,transform .16s ease}',
    '.mv-status.is-visible{opacity:1;transform:translate(-50%,0)}',
    '.mv-loading{min-height:420px;display:grid;place-items:center;color:var(--muted,#a5b0ab);font-size:13px}',
    '@media(max-width:720px){.mv-page{padding-bottom:0}.mv-header{gap:10px;padding:16px 16px 13px}.mv-header .mv-chip span{display:none}.mv-chip{width:40px;justify-content:center;padding:0}.mv-title h1{font-size:clamp(25px,8vw,34px)}.mv-subtitle{font-size:13px}.mv-layout{display:flex;flex-direction:column;padding:0 12px 16px}.mv-map{height:min(43vh,360px);min-height:300px}.mv-map-card{border-radius:20px}.mv-panel{padding:18px;border-radius:20px}.mv-topline{margin-bottom:22px}.mv-panel-actions{grid-template-columns:1fr 1fr}}',
    '@media(max-width:420px){.mv-header{align-items:flex-start}.mv-actions{gap:6px}.mv-layout{padding-inline:10px}.mv-panel-actions{grid-template-columns:1fr}.mv-title h1{font-size:27px}}',
    '@media(prefers-reduced-motion:reduce){.mv-pin,.mv-status{transition:none}}',
  ].join('')

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return
    var style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = CSS
    document.head.appendChild(style)
  }

  function safeHttpUrl(value) {
    try {
      var url = new URL(String(value || ''), global.location.href)
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
    } catch (_error) {
      return ''
    }
  }

  function websiteLabel(value) {
    try {
      return new URL(safeHttpUrl(value)).hostname.replace(/^www\./, '')
    } catch (_error) {
      return 'Website'
    }
  }

  function googleMapsUrl(place) {
    var saved = safeHttpUrl(place.google_maps_url || place.maps_url)
    if (saved) {
      try {
        var parsed = new URL(saved)
        var host = parsed.hostname.toLowerCase()
        var googleHost = host === 'google.com'
          || host.endsWith('.google.com')
          || /^(?:www|maps)\.google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(host)
          || host === 'goo.gl'
          || host.endsWith('.goo.gl')
        var query = parsed.searchParams.get('query') || ''
        var coordinatesOnly = /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(query)
        if (parsed.protocol === 'https:' && googleHost && !coordinatesOnly) return saved
      } catch (_error) {}
    }
    var queryText = [place.name, place.address].filter(Boolean).join(', ')
      || (place.lat + ',' + place.lon)
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(queryText)
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader()
      reader.onload = function () { resolve(reader.result) }
      reader.onerror = function () { reject(reader.error) }
      reader.readAsDataURL(blob)
    })
  }

  function makeProxyTileLayer(token, tileTemplate) {
    var controllers = new Set()
    var ProxyLayer = global.L.GridLayer.extend({
      createTile: function createTile(coords, done) {
        var image = document.createElement('img')
        image.alt = ''
        image.setAttribute('role', 'presentation')
        var controller = new AbortController()
        controllers.add(controller)
        var remote = tileTemplate
          .replace('{z}', coords.z)
          .replace('{x}', coords.x)
          .replace('{y}', coords.y)
        fetch('/api/proxy?url=' + encodeURIComponent(remote), {
          headers: { Authorization: 'Bearer ' + token },
          signal: controller.signal,
        }).then(function (response) {
          if (!response.ok) throw new Error('Map tile ' + response.status)
          return response.blob()
        }).then(blobToDataUrl).then(function (url) {
          image.onload = function () { controllers.delete(controller); done(null, image) }
          image.onerror = function (error) { controllers.delete(controller); done(error, image) }
          image.src = url
        }).catch(function (error) {
          controllers.delete(controller)
          if (error && error.name === 'AbortError') return
          done(error, image)
        })
        return image
      },
    })
    var layer = new ProxyLayer({
      minZoom: 4,
      maxZoom: 19,
      keepBuffer: 2,
      updateWhenZooming: true,
      updateWhenIdle: false,
    })
    layer.abortPending = function () {
      controllers.forEach(function (controller) { controller.abort() })
      controllers.clear()
    }
    return layer
  }

  function addText(parent, tag, className, value) {
    if (value == null || value === '') return null
    var node = document.createElement(tag)
    if (className) node.className = className
    node.textContent = String(value)
    parent.appendChild(node)
    return node
  }

  function addDetailRow(parent, icon, label, href, extraClass, tail) {
    var node = document.createElement(href ? 'a' : 'span')
    node.className = 'mv-row' + (extraClass ? ' ' + extraClass : '')
    if (href) {
      node.href = href
      if (!href.startsWith('tel:')) {
        node.target = '_blank'
        node.rel = 'noreferrer'
      }
    }
    node.innerHTML = icon
    addText(node, 'span', '', label)
    if (tail) addText(node, 'small', '', tail)
    if (href && !href.startsWith('tel:')) node.insertAdjacentHTML('beforeend', ICONS.external)
    parent.appendChild(node)
    return node
  }

  function pinIcon(number, selected) {
    return global.L.divIcon({
      className: 'mv-pin-shell',
      html: '<div class="mv-pin' + (selected ? ' is-selected' : '') + '"><span>'
        + number + '</span></div>',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    })
  }

  function originIcon(label) {
    var wrapper = document.createElement('div')
    wrapper.className = 'mv-origin'
    var dot = document.createElement('span')
    dot.className = 'mv-origin-dot'
    dot.textContent = '◎'
    var text = document.createElement('strong')
    text.textContent = label
    wrapper.appendChild(dot)
    wrapper.appendChild(text)
    return global.L.divIcon({
      className: 'mv-origin-shell',
      html: wrapper.outerHTML,
      iconSize: [180, 30],
      iconAnchor: [15, 15],
    })
  }

  function skeleton() {
    return [
      '<div class="mv-root"><div class="mv-page">',
      '<header class="mv-header">',
      '<button class="mv-back" type="button" data-action="back" aria-label="Back to all maps">' + ICONS.back + '</button>',
      '<div class="mv-title"><p class="mv-kicker">Maps</p><h1 data-role="title"></h1><p class="mv-subtitle" data-role="subtitle"></p></div>',
      '<div class="mv-actions">',
      '<button class="mv-chip" type="button" data-action="share" aria-label="Share this map">' + ICONS.share + '<span>Share</span></button>',
      '<button class="mv-chip" type="button" data-action="source" aria-label="Source chat">' + ICONS.chat + '<span>Source chat</span></button>',
      '</div></header>',
      '<div class="mv-layout">',
      '<section class="mv-map-column"><div class="mv-map-card"><div class="mv-map" data-role="map" tabindex="0" aria-label="Interactive map"></div></div><div class="mv-strip" data-role="strip" aria-label="Places"></div></section>',
      '<section class="mv-info-column"><aside class="mv-panel">',
      '<div class="mv-topline"><span class="mv-number" data-role="number"></span><span class="mv-walk" data-role="walk"></span></div>',
      '<div class="mv-heading"><div><p class="mv-kicker" data-role="best"></p><h2 data-role="place-name"></h2></div><span class="mv-price" data-role="price"></span></div>',
      '<p class="mv-note" data-role="note"></p><p class="mv-address" data-role="address">' + ICONS.pin + '<span></span></p>',
      '<div class="mv-details" data-role="details" aria-label="Place details"></div>',
      '<div class="mv-panel-actions"><a class="mv-primary" data-role="directions" target="_blank" rel="noreferrer">' + ICONS.directions + '<span>Directions</span>' + ICONS.external + '</a><button class="mv-secondary" type="button" data-action="source">' + ICONS.chat + '<span>Source chat</span></button></div>',
      '<p class="mv-source-note">Prices and details were recorded when this map was created and may change.</p>',
      '</aside></section></div></div>',
      '<div class="mv-status" data-role="status" role="status" aria-live="polite"></div>',
      '</div>',
    ].join('')
  }

  class MobiusMapViewer extends HTMLElement {}

  MobiusMapViewer.prototype.connectedCallback = function connectedCallback() {
    ensureStyle()
  }

  MobiusMapViewer.prototype.configure = function configure(options) {
    this.destroy()
    ensureStyle()
    this._options = options || {}
    this._record = this._options.record
    if (!this._record || !Array.isArray(this._record.places) || !this._record.places.length) {
      this.innerHTML = '<div class="mv-loading">This map has no places to show.</div>'
      return
    }
    this.innerHTML = skeleton()
    this._selected = 0
    this._markers = []
    this._tabs = []
    this._abortLayer = null
    this._statusTimer = null
    this.querySelector('[data-role="title"]').textContent = this._record.title || 'Map'
    this.querySelector('[data-role="subtitle"]').textContent = this._record.subtitle || ''

    var publicMode = this._options.mode === 'public'
    var back = this.querySelector('[data-action="back"]')
    var sourceButtons = this.querySelectorAll('[data-action="source"]')
    if (publicMode) {
      back.hidden = true
      sourceButtons.forEach(function (node) { node.hidden = true })
    } else if (!this._record.source_chat || !this._record.source_chat.id) {
      sourceButtons.forEach(function (node) { node.disabled = true })
    }

    var self = this
    this._onClick = function (event) {
      var action = event.target.closest('[data-action]')
      if (!action) return
      var name = action.getAttribute('data-action')
      if (name === 'share' && publicMode) {
        self.sharePublicLink()
        return
      }
      self.dispatchEvent(new CustomEvent('map-action', {
        bubbles: true,
        detail: { action: name },
      }))
    }
    this.addEventListener('click', this._onClick)

    this.buildTabs()
    this.selectPlace(0)
    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(function () { self.buildMap() })
    })
  }

  MobiusMapViewer.prototype.buildTabs = function buildTabs() {
    var self = this
    var strip = this.querySelector('[data-role="strip"]')
    this._record.places.forEach(function (place, index) {
      var button = document.createElement('button')
      button.type = 'button'
      button.className = 'mv-tab'
      button.setAttribute('aria-label', (index + 1) + ' ' + place.name)
      addText(button, 'span', '', index + 1)
      addText(button, 'strong', '', place.short_name || place.name)
      button.addEventListener('click', function () {
        self.selectPlace(index)
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      })
      strip.appendChild(button)
      self._tabs.push(button)
    })
  }

  MobiusMapViewer.prototype.buildMap = function buildMap() {
    if (!this.isConnected || !global.L || this._map) return
    var record = this._record
    var mapNode = this.querySelector('[data-role="map"]')
    this._map = global.L.map(mapNode, {
      minZoom: 4,
      maxZoom: 19,
      zoomControl: true,
      attributionControl: false,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
    }).setView([record.center.lat, record.center.lon], Number(record.zoom) || 15)

    var tileTemplate = this._options.tileTemplate || TILE_TEMPLATE
    if (this._options.tileMode === 'proxy') {
      this._tileLayer = makeProxyTileLayer(this._options.token, tileTemplate)
      this._abortLayer = this._tileLayer
    } else {
      this._tileLayer = global.L.tileLayer(tileTemplate, {
        minZoom: 4,
        maxZoom: 19,
        keepBuffer: 2,
        updateWhenZooming: true,
      })
    }
    this._tileLayer.addTo(this._map)

    var attribution = document.createElement('a')
    attribution.className = 'mv-attribution'
    attribution.href = 'https://www.openstreetmap.org/copyright'
    attribution.target = '_blank'
    attribution.rel = 'noreferrer'
    attribution.textContent = '© OpenStreetMap contributors'
    mapNode.appendChild(attribution)

    if (record.origin && Number.isFinite(record.origin.lat) && Number.isFinite(record.origin.lon)) {
      global.L.marker([record.origin.lat, record.origin.lon], {
        icon: originIcon(record.origin.label || 'Origin'),
        keyboard: false,
        interactive: false,
      }).addTo(this._map)
    }

    var self = this
    record.places.forEach(function (place, index) {
      var marker = global.L.marker([place.lat, place.lon], {
        icon: pinIcon(index + 1, index === self._selected),
        title: place.name,
        alt: place.name,
        keyboard: true,
      }).addTo(self._map)
      marker.on('click', function () { self.selectPlace(index) })
      self._markers.push(marker)
    })

    this._resizeObserver = new ResizeObserver(function () {
      if (self._map) self._map.invalidateSize({ animate: false })
    })
    this._resizeObserver.observe(mapNode)
  }

  MobiusMapViewer.prototype.selectPlace = function selectPlace(index) {
    var place = this._record.places[index]
    if (!place) return
    this._selected = index
    this._tabs.forEach(function (button, itemIndex) {
      button.classList.toggle('is-selected', itemIndex === index)
      button.setAttribute('aria-pressed', String(itemIndex === index))
    })
    this._markers.forEach(function (marker, itemIndex) {
      marker.setIcon(pinIcon(itemIndex + 1, itemIndex === index))
    })

    this.querySelector('[data-role="number"]').textContent = String(index + 1)
    var walk = this.querySelector('[data-role="walk"]')
    walk.textContent = place.walk || ''
    walk.hidden = !place.walk
    this.querySelector('[data-role="best"]').textContent = place.best_for || ''
    this.querySelector('[data-role="place-name"]').textContent = place.name || ''
    var price = this.querySelector('[data-role="price"]')
    price.textContent = place.price || ''
    price.hidden = !place.price
    this.querySelector('[data-role="note"]').textContent = place.note || ''
    this.querySelector('[data-role="address"] span').textContent = place.address || ''

    var details = this.querySelector('[data-role="details"]')
    details.textContent = ''
    var rating = Number(place.rating)
    var count = Number(place.review_count)
    if (Number.isFinite(rating)) {
      var summary = rating.toFixed(1)
      if (Number.isFinite(count) && count > 0) {
        summary += ' · ' + new Intl.NumberFormat('en-GB').format(count) + ' reviews'
      }
      addDetailRow(details, ICONS.star, summary, '', 'mv-rating', place.rating_source || '')
    }
    if (place.hours) addDetailRow(details, ICONS.clock, place.hours)
    var website = safeHttpUrl(place.website)
    if (website) addDetailRow(details, ICONS.globe, websiteLabel(website), website)
    if (place.phone) {
      addDetailRow(
        details,
        ICONS.phone,
        place.phone,
        'tel:' + String(place.phone).replace(/[^0-9+]/g, ''),
      )
    }
    addDetailRow(details, ICONS.map, 'Google Maps', googleMapsUrl(place))

    var directions = this.querySelector('[data-role="directions"]')
    directions.href = 'https://www.google.com/maps/dir/?api=1&destination='
      + encodeURIComponent(place.lat + ',' + place.lon)

    this.dispatchEvent(new CustomEvent('map-place-change', {
      bubbles: true,
      detail: { placeId: place.id, index: index },
    }))
  }

  MobiusMapViewer.prototype.showStatus = function showStatus(message) {
    var status = this.querySelector('[data-role="status"]')
    if (!status) return
    status.textContent = message
    status.classList.add('is-visible')
    global.clearTimeout(this._statusTimer)
    this._statusTimer = global.setTimeout(function () {
      status.classList.remove('is-visible')
    }, 2200)
  }

  MobiusMapViewer.prototype.sharePublicLink = function sharePublicLink() {
    var self = this
    var payload = { title: this._record.title, url: global.location.href }
    if (navigator.share) {
      navigator.share(payload).catch(function (error) {
        if (!error || error.name !== 'AbortError') self.showStatus('Couldn’t share this link')
      })
      return
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(global.location.href).then(
        function () { self.showStatus('Public link copied') },
        function () { self.showStatus('Copy this page’s address to share it') },
      )
      return
    }
    self.showStatus('Copy this page’s address to share it')
  }

  MobiusMapViewer.prototype.destroy = function destroy() {
    if (this._onClick) this.removeEventListener('click', this._onClick)
    this._onClick = null
    if (this._resizeObserver) this._resizeObserver.disconnect()
    this._resizeObserver = null
    if (this._abortLayer) this._abortLayer.abortPending()
    this._abortLayer = null
    if (this._map) this._map.remove()
    this._map = null
    this._tileLayer = null
    this._markers = []
    this._tabs = []
    global.clearTimeout(this._statusTimer)
  }

  MobiusMapViewer.prototype.disconnectedCallback = function disconnectedCallback() {
    this.destroy()
  }

  global.customElements.define('mobius-map-viewer', MobiusMapViewer)
})(window)
