/* Shared soundscape for the atlas and chapter openings. */
(() => {
  'use strict';
  // The book transition loads a hidden destination iframe for its snapshot.
  if (window.top !== window) return;

  const assetBase = new URL('../assets/sound/', document.currentScript.src);
  const preferenceKey = 'bittersweet-journey:sound-enabled';
  const entranceKey = 'bittersweet-journey:chapter-entrance';
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
  let musicFade = 0;
  const voices = new Set();

  function play(name, volume = .55, startAt = 0) {
    if (!enabled || !tracks[name] || document.hidden) return null;
    const voice = new Audio(new URL(tracks[name], assetBase));
    voice.volume = volume;
    voices.add(voice);
    let resolveDone;
    voice.journeyDone = new Promise(resolve => { resolveDone = resolve; });
    const remove = () => { voices.delete(voice); resolveDone(); };
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
    cancelAnimationFrame(musicFade);
    if (!enabled || !ambienceWanted || document.hidden) {
      if (music.paused) return;
      const from = music.volume;
      const started = performance.now();
      const fadeOut = now => {
        const progress = Math.min(1, (now - started) / 320);
        music.volume = from * (1 - progress);
        if (progress < 1 && !ambienceWanted && enabled && !document.hidden) musicFade = requestAnimationFrame(fadeOut);
        else { music.pause(); music.volume = .22; }
      };
      musicFade = requestAnimationFrame(fadeOut);
      return;
    }
    const fadeIn = () => {
      const from = music.volume;
      const started = performance.now();
      const raise = now => {
        const progress = Math.min(1, (now - started) / 520);
        music.volume = from + (.22 - from) * progress;
        if (progress < 1 && ambienceWanted && enabled && !document.hidden) musicFade = requestAnimationFrame(raise);
      };
      musicFade = requestAnimationFrame(raise);
    };
    if (!music.paused) { fadeIn(); return; }
    music.volume = 0;
    music.play().then(fadeIn).catch(() => {}); // A first visit may need a user gesture.
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
      cancelAnimationFrame(musicFade);
      music.pause();
      music.volume = .22;
      voices.forEach(voice => { voice.pause(); voice.currentTime = 0; });
      voices.clear();
    } else syncAmbience();
    updateToggle();
  }

  function enterChapter(id) {
    setAmbience(false);
    const definitions = chapterTracks[id] || [];
    if (enabled && definitions.length) {
      try {
        localStorage.setItem(entranceKey, JSON.stringify({
          id,
          startedAt: Date.now(),
          cues: definitions
        }));
      } catch {}
    }
    const cues = definitions.map(([name, volume]) => play(name, volume));
    const finished = Promise.all(cues.map(cue => cue?.journeyDone || Promise.resolve()));
    // Never strand navigation if a browser fails to emit an audio completion event.
    return Promise.race([finished, new Promise(resolve => setTimeout(resolve, 8500))]);
  }

  function resumeChapterEntrance() {
    let pending = null;
    try {
      pending = JSON.parse(localStorage.getItem(entranceKey) || 'null');
      localStorage.removeItem(entranceKey);
    } catch {}
    if (!enabled || !pending || !Array.isArray(pending.cues)) return false;
    if (Date.now() - pending.startedAt > 12000) return false;
    if (!location.pathname.includes(`/chapters/${pending.id}/`)) return false;
    const elapsed = Math.max(0, (Date.now() - pending.startedAt) / 1000);
    ambienceWanted = false;
    const cues = pending.cues.map(([name, volume]) => play(name, volume, elapsed));
    Promise.all(cues.map(cue => cue?.journeyDone || Promise.resolve())).then(() => {
      if (!document.body.classList.contains('is-open')) setAmbience(true);
    });
    return true;
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
    const resumedEntrance = resumeChapterEntrance();
    if (resumedEntrance || document.body.classList.contains('is-open') || new URLSearchParams(location.search).get('open') === '1') ambienceWanted = false;
    syncAmbience();
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
