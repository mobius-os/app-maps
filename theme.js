export const CSS = `
  * { box-sizing: border-box; }
  button, a { -webkit-tap-highlight-color: transparent; }
  button { font: inherit; }

  .mb-root {
    --mb-ink: #18322d;
    --mb-forest: #234f45;
    --mb-mint: #dff3e8;
    --mb-coral: #f4745f;
    --mb-sand: #f4efe5;
    min-height: 100%;
    height: 100%;
    overflow: hidden;
    color: var(--text);
    background:
      radial-gradient(circle at 90% -10%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 34%),
      var(--bg);
    font-family: var(--font);
  }

  .mb-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 22px 16px;
  }
  .mb-detail {
    height: 100%;
    overflow-y: auto;
  }
  .mb-detail-header { justify-content: flex-start; }
  .mb-detail-title { min-width: 0; flex: 1; }
  .mb-back {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    flex: none;
    margin-top: 3px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 13px;
    color: var(--text);
    background: color-mix(in srgb, var(--surface) 88%, transparent);
    cursor: pointer;
  }
  .mb-back:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 40%, transparent);
    outline-offset: 2px;
  }
  .mb-header h1 {
    margin: 2px 0 3px;
    font-size: clamp(25px, 4vw, 38px);
    line-height: 1.02;
    letter-spacing: -0.045em;
    color: var(--text);
  }
  .mb-header > div > p:last-child {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
  }
  .mb-kicker {
    margin: 0;
    color: var(--accent);
    font-size: 11px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
  .mb-source-chip {
    flex: none;
    margin-top: 4px;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text);
    background: color-mix(in srgb, var(--surface) 88%, transparent);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }
  .mb-source-chip svg { color: var(--accent); }
  .mb-source-chip:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 40%, transparent);
    outline-offset: 2px;
  }
  .mb-source-chip:disabled { opacity: .45; cursor: default; }

  .mb-library {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .mb-library-header {
    min-height: 76px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex: none;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg) 94%, transparent);
    backdrop-filter: blur(18px);
  }
  .mb-library-mark {
    width: 44px;
    height: 44px;
    flex: none;
  }
  .mb-library-mark img { width: 100%; height: 100%; object-fit: contain; }
  .mb-library-header h1 {
    margin: 0;
    color: var(--text);
    font-size: 21px;
    line-height: 1.1;
    letter-spacing: -.035em;
  }
  .mb-library-header p {
    margin: 3px 0 0;
    color: var(--muted);
    font-size: 12px;
  }
  .mb-library-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
  }
  .mb-library-page {
    width: min(760px, 100%);
    margin: 0 auto;
    padding: 22px 18px 40px;
  }

  .mb-skill-note {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin: 0 0 20px;
    padding: 12px;
    border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border));
    border-radius: 14px;
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 7%, var(--surface));
  }
  .mb-skill-note-icon {
    width: 36px;
    height: 36px;
    object-fit: contain;
    flex: none;
  }
  .mb-skill-note strong, .mb-skill-note span { display: block; }
  .mb-skill-note strong { font-size: 13px; line-height: 1.3; }
  .mb-skill-note div > span {
    margin-top: 3px;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.45;
  }

  .mb-map-history {
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 25px;
  }
  .mb-date-group { min-width: 0; }
  .mb-date-group h2 {
    margin: 0 0 9px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 850;
    letter-spacing: .09em;
    text-transform: uppercase;
  }
  .mb-date-list {
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 9px;
  }

  .mb-card-preview {
    position: relative;
    display: block;
    width: 100%;
    height: 152px;
    overflow: hidden;
    border-bottom: 1px solid var(--border);
    background: #e9e5d9;
    isolation: isolate;
  }
  .mb-preview-fallback {
    position: absolute;
    inset: 0;
    background-color: #e9e5d9;
    background-image:
      radial-gradient(circle at 26% 38%, rgba(65, 115, 91, .13), transparent 24%),
      linear-gradient(28deg, transparent 45%, rgba(255,255,255,.58) 46%, rgba(255,255,255,.58) 48%, transparent 49%),
      linear-gradient(116deg, transparent 46%, rgba(255,255,255,.5) 47%, rgba(255,255,255,.5) 49%, transparent 50%);
    background-size: auto, 68px 68px, 84px 84px;
  }
  .mb-preview-tile {
    position: absolute;
    z-index: 1;
    width: 256px;
    height: 256px;
    max-width: none;
    pointer-events: none;
  }
  .mb-preview-pin {
    position: absolute;
    z-index: 3;
    width: 11px;
    height: 11px;
    margin: -6px 0 0 -6px;
    border: 2px solid white;
    border-radius: 50%;
    background: var(--mb-coral);
    box-shadow: 0 2px 6px rgba(24, 50, 45, .35);
  }
  .mb-preview-count,
  .mb-preview-credit {
    position: absolute;
    z-index: 4;
    line-height: 1;
  }
  .mb-preview-count {
    left: 10px;
    top: 10px;
    padding: 6px 8px;
    border-radius: 999px;
    color: #17332d;
    background: rgba(255,255,255,.9);
    box-shadow: 0 3px 10px rgba(24, 50, 45, .12);
    font-size: 10px;
    font-weight: 850;
  }
  .mb-preview-credit {
    right: 6px;
    bottom: 5px;
    padding: 3px 4px;
    border-radius: 4px;
    color: #344b45;
    background: rgba(255,255,255,.78);
    font-size: 8px;
  }

  .mb-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(290px, .8fr);
    gap: 16px;
    padding: 0 18px 18px;
  }
  .mb-map-column, .mb-info-column { min-width: 0; }
  .mb-map-wrap {
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: 0 16px 40px rgba(15, 38, 31, .11);
  }
  .mb-map-frame {
    position: relative;
    height: clamp(380px, 62vh, 660px);
    overflow: hidden;
    background: #e7e5dc;
    isolation: isolate;
    touch-action: none;
    cursor: grab;
    user-select: none;
  }
  .mb-map-frame:active { cursor: grabbing; }
  .mb-map-frame:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 56%, transparent);
    outline-offset: -4px;
  }
  .mb-map-fallback {
    position: absolute;
    inset: 0;
    background-color: #e9e5d9;
    background-image:
      linear-gradient(rgba(255,255,255,.48) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.48) 1px, transparent 1px);
    background-size: 38px 38px;
  }
  .mb-tile {
    position: absolute;
    z-index: 1;
    width: 256px;
    height: 256px;
    max-width: none;
    user-select: none;
    pointer-events: none;
  }
  .mb-pin {
    position: absolute;
    z-index: 5;
    width: 38px;
    height: 38px;
    margin: -19px 0 0 -19px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50% 50% 50% 12px;
    color: white;
    background: var(--mb-forest);
    box-shadow: 0 7px 18px rgba(20, 51, 43, .34);
    transform: rotate(-45deg);
    cursor: pointer;
    transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
  }
  .mb-pin span {
    transform: rotate(45deg);
    font-size: 13px;
    font-weight: 900;
  }
  .mb-pin:hover, .mb-pin:focus-visible {
    transform: rotate(-45deg) scale(1.08);
    outline: 3px solid rgba(255,255,255,.95);
    outline-offset: 2px;
  }
  .mb-pin.is-selected {
    z-index: 7;
    background: var(--mb-coral);
    transform: rotate(-45deg) scale(1.18);
    box-shadow: 0 9px 22px rgba(198, 68, 45, .42);
  }
  .mb-station {
    position: absolute;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 7px;
    margin: -15px 0 0 -15px;
    pointer-events: none;
    white-space: nowrap;
  }
  .mb-station span {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border: 3px solid white;
    border-radius: 50%;
    color: white;
    background: #171e1c;
    box-shadow: 0 4px 12px rgba(0,0,0,.25);
  }
  .mb-station strong {
    padding: 4px 7px;
    border-radius: 6px;
    color: #14211e;
    background: rgba(255,255,255,.92);
    box-shadow: 0 3px 10px rgba(20, 38, 32, .15);
    font-size: 10px;
    letter-spacing: .02em;
  }
  .mb-attribution {
    position: absolute;
    z-index: 8;
    right: 8px;
    bottom: 6px;
    padding: 3px 5px;
    color: #344b45;
    background: rgba(255,255,255,.84);
    border-radius: 4px;
    font-size: 9px;
    text-decoration: none;
  }

  .mb-place-strip {
    display: flex;
    gap: 8px;
    margin-top: 11px;
    padding: 1px 1px 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .mb-place-strip::-webkit-scrollbar { display: none; }
  .mb-place-strip button {
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
    padding: 6px 11px 6px 7px;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--muted);
    background: var(--surface);
    cursor: pointer;
  }
  .mb-place-strip button span {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--mb-forest);
    background: var(--mb-mint);
    font-size: 11px;
    font-weight: 900;
  }
  .mb-place-strip button strong { font-size: 12px; }
  .mb-place-strip button.is-selected {
    border-color: color-mix(in srgb, var(--accent) 60%, var(--border));
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 9%, var(--surface));
  }
  .mb-place-strip button.is-selected span { color: white; background: var(--mb-coral); }

  .mb-info-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .mb-place-panel {
    border: 1px solid var(--border);
    border-radius: 22px;
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    box-shadow: 0 12px 30px rgba(15, 38, 31, .06);
  }
  .mb-place-panel { padding: 20px; }
  .mb-place-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .mb-place-number {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: white;
    background: var(--mb-coral);
    font-size: 13px;
    font-weight: 900;
  }
  .mb-walk {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }
  .mb-place-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .mb-place-heading h2 {
    margin: 5px 0 0;
    color: var(--text);
    font-size: clamp(22px, 3vw, 31px);
    line-height: 1.04;
    letter-spacing: -.04em;
  }
  .mb-price {
    flex: none;
    padding: 7px 9px;
    border-radius: 10px;
    color: var(--mb-forest);
    background: var(--mb-mint);
    font-size: 12px;
    font-weight: 850;
  }
  .mb-place-note {
    margin: 16px 0 13px;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.55;
  }
  .mb-address {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 0;
    color: var(--text);
    font-size: 12px;
    line-height: 1.45;
  }
  .mb-address svg { flex: none; margin-top: 1px; color: var(--accent); }
  .mb-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 22px;
  }
  .mb-primary, .mb-secondary {
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-radius: 13px;
    font-size: 12px;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
  }
  .mb-primary {
    border: 1px solid var(--mb-forest);
    color: white;
    background: var(--mb-forest);
  }
  .mb-secondary {
    border: 1px solid var(--border);
    color: var(--text);
    background: var(--surface-2);
  }
  .mb-primary:focus-visible, .mb-secondary:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 44%, transparent);
    outline-offset: 2px;
  }
  .mb-secondary:disabled { opacity: .5; cursor: default; }
  .mb-source-note {
    margin: 14px 0 0;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.4;
  }
  .mb-map-card {
    position: relative;
    width: 100%;
    min-height: 250px;
    display: block;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 18px;
    color: var(--text);
    background: color-mix(in srgb, var(--surface) 96%, transparent);
    text-align: left;
    cursor: pointer;
    touch-action: pan-y;
    contain: layout paint style;
    content-visibility: auto;
    contain-intrinsic-size: auto 250px;
  }
  .mb-map-card:hover {
    border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
    background: color-mix(in srgb, var(--accent) 5%, var(--surface));
  }
  .mb-map-card-copy {
    display: block;
    min-width: 0;
    padding: 13px 42px 14px 14px;
  }
  .mb-map-card-copy strong, .mb-map-card-copy > span, .mb-map-card-copy small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mb-map-card-copy strong { font-size: 14px; }
  .mb-map-card-copy > span {
    margin-top: 3px;
    color: var(--muted);
    font-size: 12px;
  }
  .mb-map-card-copy small { margin-top: 6px; color: var(--muted); font-size: 10px; }
  .mb-map-card > svg {
    position: absolute;
    right: 14px;
    bottom: 17px;
    color: var(--muted);
  }

  .mb-empty, .mb-loading {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    text-align: center;
  }
  .mb-empty-icon {
    width: 60px;
    height: 60px;
    display: grid;
    place-items: center;
    margin-bottom: 18px;
    border-radius: 19px;
    color: var(--mb-forest);
    background: var(--mb-mint);
    transform: rotate(-4deg);
  }
  .mb-empty h1 { margin: 6px 0 10px; font-size: 34px; letter-spacing: -.045em; }
  .mb-empty > p:not(.mb-kicker) {
    max-width: 390px;
    margin: 0 0 22px;
    color: var(--muted);
    line-height: 1.55;
  }
  .mb-loading { gap: 10px; color: var(--muted); font-size: 13px; }

  @media (max-width: 720px) {
    .mb-header { padding: 18px 16px 13px; }
    .mb-header h1 { font-size: 27px; }
    .mb-detail-header { gap: 9px; }
    .mb-source-chip {
      width: 38px;
      height: 38px;
      min-height: 38px;
      justify-content: center;
      padding: 0;
    }
    .mb-source-chip span { display: none; }
    .mb-library-header { min-height: 70px; padding: 12px 16px; }
    .mb-library-mark { width: 42px; height: 42px; }
    .mb-library-page { padding: 17px 12px 32px; }
    .mb-skill-note { margin-bottom: 20px; }
    .mb-map-history { gap: 22px; }
    .mb-map-card { min-height: 246px; }
    .mb-card-preview { height: 148px; }
    .mb-map-card-copy > span { font-size: 11px; }
    .mb-layout {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 0 12px 18px;
    }
    .mb-map-frame { height: min(43vh, 360px); min-height: 300px; }
    .mb-map-wrap { border-radius: 20px; }
    .mb-place-panel { padding: 17px; border-radius: 20px; }
    .mb-place-topline { margin-bottom: 16px; }
    .mb-place-heading h2 { font-size: 24px; }
    .mb-place-note { margin: 12px 0 10px; line-height: 1.45; }
    .mb-actions { margin-top: 16px; }
    .mb-source-note { margin-top: 10px; }
  }

  @media (min-width: 760px) {
    .mb-date-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .mb-pin { transition: none; }
  }
`
