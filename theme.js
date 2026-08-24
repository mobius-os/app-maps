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
    position: relative;
    overflow: hidden;
    color: var(--text);
    background:
      radial-gradient(circle at 90% -10%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 34%),
      var(--bg);
    font-family: var(--font);
  }

  .mb-detail {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
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
  .mb-share-notice {
    position: fixed;
    left: 50%;
    bottom: calc(18px + var(--mobius-safe-bottom, 0px));
    z-index: 200;
    max-width: calc(100% - 32px);
    padding: 10px 14px;
    border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--border));
    border-radius: 999px;
    color: var(--text);
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    box-shadow: 0 12px 32px color-mix(in srgb, #000 20%, transparent);
    font-size: 13px;
    font-weight: 750;
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, 8px);
    transition: opacity 160ms ease, transform 160ms ease;
  }
  .mb-share-notice.is-visible {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  .mb-share-scrim {
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, .5);
  }
  .mb-share-sheet {
    width: 100%;
    max-width: 560px;
    max-height: 85vh;
    overflow-y: auto;
    padding: 24px;
    padding-bottom: max(24px, env(safe-area-inset-bottom));
    border: 1px solid var(--border);
    border-radius: 16px 16px 0 0;
    color: var(--text);
    background: var(--surface);
    box-shadow: 0 -8px 32px rgba(0, 0, 0, .3);
  }
  .mb-share-handle {
    width: 42px;
    height: 4px;
    margin: -10px auto 18px;
    border-radius: 999px;
    background: var(--border);
  }
  .mb-share-sheet h3 {
    margin: 6px 0 8px;
    font-size: 22px;
    letter-spacing: -.025em;
  }
  .mb-share-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }
  .mb-share-close {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    flex: none;
    margin-top: -2px;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--muted);
    background: var(--surface-2);
    cursor: pointer;
  }
  .mb-share-close:hover { color: var(--text); border-color: var(--accent); }
  .mb-share-close:disabled { opacity: .5; cursor: default; }
  .mb-share-preview {
    width: 100%;
    aspect-ratio: 1200 / 630;
    display: block;
    margin: 10px 0 14px;
    object-fit: cover;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--surface-2);
    box-shadow: 0 12px 28px color-mix(in srgb, #000 16%, transparent);
  }
  .mb-share-sheet-body {
    margin: 0 0 16px;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.5;
  }
  .mb-share-url {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 16px 0 10px;
    padding: 5px;
    border: 1px solid var(--border);
    border-radius: 11px;
    background: var(--surface-2);
  }
  .mb-share-url input {
    min-width: 0;
    flex: 1;
    min-height: 44px;
    padding: 10px;
    border: 0;
    border-radius: 8px;
    outline: none;
    color: var(--text);
    background: transparent;
    font: 16px/1.5 var(--font);
  }
  .mb-share-url:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }
  .mb-share-url button {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    flex: none;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 9px;
    color: var(--text);
    background: var(--surface);
    cursor: pointer;
  }
  .mb-share-url button:hover { border-color: var(--accent); }
  .mb-share-url button:disabled { opacity: .5; cursor: default; }
  .mb-share-sheet-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
    margin-top: 18px;
  }
  .mb-share-sheet-actions > * { width: 100%; min-width: 0; }
  .mb-share-maintenance {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 8px;
    color: var(--muted);
    font-size: 12px;
  }
  .mb-share-maintenance button {
    min-height: 44px;
    padding: 8px;
    border: 0;
    border-radius: 8px;
    color: var(--muted);
    background: transparent;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .mb-share-maintenance button:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }
  .mb-share-maintenance button.is-danger { color: var(--danger); }
  .mb-share-maintenance button.is-danger:hover {
    background: color-mix(in srgb, var(--danger) 8%, transparent);
  }
  .mb-share-maintenance button:disabled { opacity: .5; cursor: default; }

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
    padding: 0;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg) 94%, transparent);
    backdrop-filter: blur(18px);
  }
  .mb-library-header-inner {
    width: 100%;
    max-width: 74rem;
    margin-inline: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
  }
  .mb-library-mark {
    width: 44px;
    height: 44px;
    flex: none;
  }
  .mb-library-mark img { width: 100%; height: 100%; object-fit: contain; }
  .mb-library-mark-fallback { width: 44px; height: 44px; place-items: center; border-radius: 11px;
    background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); font-weight: 750; }
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
    width: 100%;
    max-width: 74rem;
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
    color: var(--accent-fg);
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
    .mb-library-header { min-height: 70px; }
    .mb-library-header-inner { padding: 12px 16px; }
    .mb-library-mark { width: 42px; height: 42px; }
    .mb-library-page { padding: 17px 12px 32px; }
    .mb-skill-note { margin-bottom: 20px; }
    .mb-map-history { gap: 22px; }
    .mb-map-card { min-height: 246px; }
    .mb-card-preview { height: 148px; }
    .mb-map-card-copy > span { font-size: 11px; }
    .mb-share-scrim { padding: 0; }
    .mb-share-sheet { border-right: 0; border-bottom: 0; border-left: 0; }
  }

  @media (min-width: 760px) {
    .mb-date-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .mb-share-notice { transition: none; }
  }
`
