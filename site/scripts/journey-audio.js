/* Shared soundscape for the atlas and chapter openings. */
(() => {
  'use strict';
  // The book transition loads a hidden destination iframe for its snapshot.
  if (window.top !== window) return;

  const assetBase = new URL('../assets/sound/', document.currentScript.src);
  const preferenceKey = 'bittersweet-journey:sound-enabled';
  const entranceKey = 'bittersweet-journey:entrance-sound';
  const tracks = {
    ambient: 'bittersweet_map_bgm_ambient_loop.wav',
    click: 'sfx_Q_btn_click.wav',
    page: 'sfx_W_page_turn.wav',
    complete: 'sfx_E_chapter_complete.wav',
    stamp: 'sfx_R_seal_stamp.wav',
    close: 'sfx_T_dialog_close.wav',
    bell: 'bittersweet_sfx_1_bell_temple.wav',
    guqin: 'bittersweet_sfx_2_guqin_solitary.wav',
    dunes: 'bittersweet_sfx_3_dune_wind.wav',
    stone: 'bittersweet_sfx_4_stone_chime.wav',
    river: 'bittersweet_sfx_5_river_drone.wav',
    bowl: 'bittersweet_sfx_6_singing_bowl.wav',
    rain: 'bittersweet_sfx_7_rain_tile.wav',
    flute: 'bittersweet_sfx_8_flute_echo.wav'
  };
  // Nine stories share eight location recordings. The last entrance blends two quietly.
  const chapterTracks = {
    'my-hometown': [['rain', .55]],
    dujiangyan: [['river', .55]],
    'taoist-tower': [['bell', .5]],
    'mogao-caves': [['stone', .55]],
    'secret-spring': [['dunes', .55]],
    yangguan: [['flute', .55]],
    kashgar: [['guqin', .55]],
    'mountain-resort': [['bowl', .5]],
    'fish-tail-lodge': [['bowl', .32], ['guqin', .28]]
  };
  let enabled = true;
  try { enabled = localStorage.getItem(preferenceKey) !== 'false'; } catch {}
  const music = new Audio(new URL(tracks.ambient, assetBase));
  music.loop = true;
  music.preload = 'none';
  music.volume = .22;
  let ambienceWanted = true;
  let toggle;
  const voices = new Set();

  function play(name, volume = .55, startAt = 0) {
    if (!enabled || !tracks[name] || document.hidden) return null;
    const voice = new Audio(new URL(tracks[name], assetBase));
    voice.volume = volume;
    voices.add(voice);
    const remove = () => voices.delete(voice);
    voice.addEventListener('ended', remove, {once: true});
    voice.addEventListener('error', remove, {once: true});
    if (startAt > 0) {
      voice.preload = 'auto';
      voice.addEventListener('loadedmetadata', () => {
        if (startAt >= voice.duration) { remove(); return; }
        voice.currentTime = startAt;
        voice.play().catch(remove);
      }, {once: true});
      voice.load();
    } else voice.play().catch(remove);
    return voice;
  }

  function syncAmbience() {
    if (!enabled || !ambienceWanted || document.hidden) { music.pause(); return; }
    if (!music.paused) return;
    music.play().catch(() => {}); // A first visit may need a user gesture.
  }

  function setAmbience(wanted) {
    ambienceWanted = Boolean(wanted);
    syncAmbience();
  }

  function updateToggle() {
    if (!toggle) return;
    const english = document.body.dataset.language === 'en';
    toggle.setAttribute('aria-label', english
      ? (enabled ? 'Mute sound' : 'Turn on sound')
      : (enabled ? '关闭声音' : '开启声音'));
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.title = toggle.getAttribute('aria-label');
    toggle.textContent = '♫';
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    try { localStorage.setItem(preferenceKey, String(enabled)); } catch {}
    if (!enabled) {
      music.pause();
      voices.forEach(voice => { voice.pause(); voice.currentTime = 0; });
      voices.clear();
    } else syncAmbience();
    updateToggle();
  }

  function enterChapter(id) {
    setAmbience(false);
    try { sessionStorage.setItem(entranceKey, JSON.stringify({id, at: Date.now()})); } catch {}
    (chapterTracks[id] || []).forEach(([name, volume]) => play(name, volume));
  }

  function resumeEntrance() {
    const id = location.pathname.match(/\/chapters\/([^/]+)\//)?.[1];
    if (!id) return;
    let pending;
    try {
      pending = JSON.parse(sessionStorage.getItem(entranceKey) || 'null');
      sessionStorage.removeItem(entranceKey);
    } catch { return; }
    const elapsed = (Date.now() - pending?.at) / 1000;
    if (pending?.id !== id || elapsed < 0 || elapsed > 7) return;
    (chapterTracks[id] || []).forEach(([name, volume]) => play(name, volume, elapsed));
  }

  function mount() {
    const header = document.querySelector('.site-masthead');
    if (header) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'site-sound-toggle';
      toggle.addEventListener('click', () => setEnabled(!enabled));
      const language = header.querySelector('.site-language');
      language?.before(toggle);
      updateToggle();
      new MutationObserver(updateToggle).observe(document.body, {attributes: true, attributeFilter: ['data-language']});
    }
    if (document.body.classList.contains('is-open') || new URLSearchParams(location.search).get('open') === '1') ambienceWanted = false;
    syncAmbience();
    resumeEntrance();
  }

  // General controls get the quiet UI click; story, page, and completion actions have their own cue.
  document.addEventListener('click', event => {
    const control = event.target.closest?.('button, summary');
    if (!control || control.matches('.site-sound-toggle, .hometown-entry, .enter-story, .open-book, .chapter-leaf-enter, .finish-chapter, #finish, .stamp-close, .close-notes, #close-data')) return;
    play('click', .32);
  });
  document.addEventListener('pointerdown', () => syncAmbience(), {capture: true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') syncAmbience();
  }, {capture: true});
  document.addEventListener('visibilitychange', syncAmbience);
  window.addEventListener('pagehide', () => music.pause());
  window.addEventListener('pageshow', syncAmbience);
  window.addEventListener('storage', event => {
    if (event.key === preferenceKey) {
      enabled = event.newValue !== 'false';
      updateToggle();
      syncAmbience();
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true});
  else mount();

  window.JOURNEY_AUDIO = Object.freeze({play, enterChapter, setAmbience, setEnabled, get enabled() { return enabled; }});
})();
