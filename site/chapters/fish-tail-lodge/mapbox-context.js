/*
  Mapbox context layer for the first reading section.
  The camera moves from a flat South Asia overview into true pitched terrain:
  South Asia -> Kathmandu -> Pokhara -> the Himalayan wall.
  The chapter's hand-built DEM takes over only for the final close view.
*/
(() => {
  "use strict";

  const root = document.querySelector(".mapbox-context");
  const container = document.querySelector(".mapbox-canvas");
  const config = window.FISHTAIL_MAPBOX_CONFIG;
  const geography = window.FISHTAIL_GEOGRAPHY;
  if (!root || !container || !config || !window.mapboxgl || !geography) return;

  const place = (id) => geography.places.find((item) => item.id === id);
  const Kathmandu = place("kathmandu");
  const Pokhara = place("pokhara");
  const Lodge = place("lodge");
  const Machhapuchhre = place("machhapuchhre");
  const Annapurna = place("annapurna");
  if (!Kathmandu || !Pokhara || !Lodge || !Machhapuchhre || !Annapurna) return;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smooth = (value) => value * value * (3 - 2 * value);
  const mix = (a, b, amount) => a + (b - a) * amount;
  const mixPoint = (a, b, amount) => [mix(a[0], b[0], amount), mix(a[1], b[1], amount)];

  const cameras = {
    overview: { center: [84.65, 28.15], zoom: 4.85, pitch: 0, bearing: 0 },
    route: { center: [84.65, 27.95], zoom: 6.15, pitch: 0, bearing: 0 },
    pokhara: { center: [Pokhara.lon, Pokhara.lat + 0.025], zoom: 8.7, pitch: 28, bearing: -4 },
    lodge: { center: [Lodge.lon, 28.31], zoom: 10.2, pitch: 64, bearing: -2 }
  };

  let map;
  let ready = false;
  let section = 1;
  let progress = 0;
  let failed = false;
  let desired = cameras.overview;
  let current = { ...cameras.overview, center: [...cameras.overview.center] };
  let language = document.body.dataset.language || "zh";
  let readinessTimer;
  let resizeObserver;
  let lastTerrainExaggeration = 0;
  const routeCoordinates = [
    ...[[85.319993,27.709959],[85.308684,27.69686],[85.282783,27.693546],[85.248934,27.687072],[85.22105,27.691337],[85.205463,27.702364],[85.202506,27.713135],[85.202249,27.710945],[85.195938,27.707997],[85.190446,27.710457],[85.185618,27.714079],[85.182575,27.71188],[85.177498,27.715316],[85.173277,27.715597],[85.169925,27.716834],[85.167322,27.719879],[85.155624,27.718305],[85.139948,27.72655],[85.116288,27.743061],[85.093669,27.746308],[85.076683,27.747482],[85.05298,27.749358],[85.034622,27.77011],[85.013614,27.781031],[85.000529,27.796164],[84.972934,27.800484],[84.960497,27.813475],[84.933088,27.801651],[84.90602,27.804501],[84.873193,27.803191],[84.842908,27.801302],[84.826507,27.811187],[84.811661,27.813753],[84.793577,27.81231],[84.774743,27.80795],[84.758923,27.810384],[84.749125,27.802925],[84.729292,27.79544],[84.713072,27.799792],[84.691197,27.808938],[84.673359,27.816166],[84.66036,27.828925],[84.658227,27.850273],[84.640783,27.858361],[84.62851,27.870175],[84.601166,27.872354],[84.58808,27.877688],[84.578273,27.865749],[84.558255,27.854412],[84.550001,27.867237],[84.540872,27.883928],[84.530259,27.909595],[84.499679,27.922097],[84.457714,27.940853],[84.443353,27.945402],[84.4171,27.951753],[84.40579,27.966735],[84.396953,27.974858],[84.384473,27.977618],[84.372109,27.976919],[84.35841,27.978558],[84.349976,27.985948],[84.331589,27.987812],[84.311994,27.98694],[84.305913,27.985517],[84.275813,27.985404],[84.253385,27.97957],[84.236149,27.979863],[84.188715,27.986174],[84.152362,28.00474],[84.131693,28.009786],[84.108644,28.024254],[84.07053,28.06227],[84.081908,28.091406],[84.076934,28.138647],[84.043227,28.179585],[84.016142,28.197491],[83.985311,28.209747]],
    [Lodge.lon, Lodge.lat]
  ];

  function cameraFor(value) {
    const p = clamp(value);
    if (p < 0.24) {
      const t = smooth(p / 0.24);
      return {
        center: mixPoint(cameras.overview.center, cameras.route.center, t),
        zoom: mix(cameras.overview.zoom, cameras.route.zoom, t),
        pitch: 0,
        bearing: 0
      };
    }
    if (p < 0.58) {
      const t = smooth((p - 0.24) / 0.34);
      return {
        center: mixPoint(cameras.route.center, cameras.pokhara.center, t),
        zoom: mix(cameras.route.zoom, cameras.pokhara.zoom, t),
        pitch: mix(cameras.route.pitch, cameras.pokhara.pitch, t),
        bearing: mix(cameras.route.bearing, cameras.pokhara.bearing, t)
      };
    }
    const t = smooth(clamp((p - 0.58) / 0.26));
    return {
      center: mixPoint(cameras.pokhara.center, cameras.lodge.center, t),
      zoom: mix(cameras.pokhara.zoom, cameras.lodge.zoom, t),
      pitch: mix(cameras.pokhara.pitch, cameras.lodge.pitch, t),
      bearing: mix(cameras.pokhara.bearing, cameras.lodge.bearing, t)
    };
  }

  function setMapVisibility() {
    // Never hide the chapter's local terrain until Mapbox has actually
    // completed its style/source load. A blocked tile/style request must not
    // leave the reader looking at an empty context layer.
    const mapReady = !failed && ready;
    const mapOpacity = mapReady && section === 1 ? 1 - smooth(clamp((progress - 0.84) / 0.14)) : 0;
    const terrainOpacity = !mapReady || section !== 1 ? 1 : smooth(clamp((progress - 0.8) / 0.18));
    root.style.opacity = String(mapOpacity);
    root.style.pointerEvents = mapOpacity > 0.02 ? "none" : "none";
    document.body.classList.toggle("mapbox-overview", mapReady && section === 1 && mapOpacity > 0.02);
    document.body.style.setProperty("--fish-tail-terrain-opacity", String(terrainOpacity));
    setContextLayerState();
  }

  function setContextLayerState() {
    if (!map || !ready) return;
    const visible = section === 1;
    ["fishtail-route-casing", "fishtail-route-line", "fishtail-country-labels", "fishtail-context-points", "fishtail-context-labels"].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
    });
    if (!visible) return;

    // The overview must answer the geographic question immediately: both
    // ends of the 200 km journey are present before the camera starts moving.
    let keys = ["kathmandu", "pokhara"];
    if (progress > 0.46) keys.push("lodge");
    if (progress > 0.64) keys = ["pokhara", "lodge", "machhapuchhre", "annapurna"];
    if (progress > 0.68) keys = ["lodge", "machhapuchhre", "annapurna"];
    const filter = ["match", ["get", "key"], keys, true, false];
    if (map.getLayer("fishtail-context-points")) map.setFilter("fishtail-context-points", filter);
    if (map.getLayer("fishtail-context-labels")) map.setFilter("fishtail-context-labels", filter);
    if (map.getLayer("fishtail-route-line")) {
      const departureOpacity = mix(0.84, 0.98, smooth(clamp(progress / 0.2)));
      const arrivalFade = 1 - smooth(clamp((progress - 0.54) / 0.2));
      const routeOpacity = departureOpacity * arrivalFade;
      if (map.getLayer("fishtail-route-casing")) {
        map.setPaintProperty("fishtail-route-casing", "line-opacity", routeOpacity * 0.92);
      }
      map.setPaintProperty("fishtail-route-line", "line-opacity", routeOpacity);
    }
    if (map.getLayer("fishtail-context-labels")) {
      map.setLayoutProperty(
        "fishtail-context-labels",
        "text-field",
        ["get", language === "en" ? "labelEn" : "labelZh"]
      );
    }
    if (map.getLayer("fishtail-country-labels")) {
      map.setPaintProperty(
        "fishtail-country-labels",
        "text-opacity",
        0.72 * (1 - smooth(clamp((progress - 0.38) / 0.22)))
      );
      map.setLayoutProperty(
        "fishtail-country-labels",
        "text-field",
        ["get", language === "en" ? "labelEn" : "labelZh"]
      );
    }
    if (map.getSource("fishtail-mapbox-dem")) {
      const exaggeration = 1.18 * smooth(clamp((progress - 0.3) / 0.42));
      if (Math.abs(exaggeration - lastTerrainExaggeration) > 0.015) {
        lastTerrainExaggeration = exaggeration;
        map.setTerrain({ source: "fishtail-mapbox-dem", exaggeration });
      }
    }
  }

  function applyCamera(next) {
    if (!map || !ready || section !== 1) return;
    current = { ...next, center: [...next.center] };
    map.jumpTo(current);
  }

  function disableMapbox() {
    window.clearTimeout(readinessTimer);
    failed = true;
    ready = false;
    root.classList.add("mapbox-error");
    document.body.style.setProperty("--fish-tail-terrain-opacity", "1");
    setMapVisibility();
  }

  function commitReady() {
    if (failed || ready || !map) return;
    if (map.isSourceLoaded && !map.isSourceLoaded("composite")) return;
    if (map.areTilesLoaded && !map.areTilesLoaded()) return;
    if (map.queryRenderedFeatures && map.queryRenderedFeatures().length === 0) return;
    ready = true;
    current = { ...cameraFor(progress), center: [...cameraFor(progress).center] };
    desired = cameraFor(progress);
    setMapVisibility();
    map.resize();
    applyCamera(desired);
  }

  try {
    window.mapboxgl.accessToken = config.accessToken;
    const styleUrl = config.style.startsWith("mapbox://styles/")
      ? `https://api.mapbox.com/styles/v1/${config.style.slice("mapbox://styles/".length)}?access_token=${encodeURIComponent(config.accessToken)}`
      : config.style;
    map = new window.mapboxgl.Map({
      container,
      style: styleUrl,
      center: cameras.overview.center,
      zoom: cameras.overview.zoom,
      pitch: cameras.overview.pitch,
      bearing: cameras.overview.bearing,
      interactive: false,
      attributionControl: true,
      // The chapter is regularly captured in browser QA and published as a
      // composited visual. Preserve the last frame so the map is not exposed
      // as a transparent canvas between animation frames.
      preserveDrawingBuffer: true
    });

    // Mapbox adds `.mapboxgl-map` to the supplied container. Its own CSS sets
    // that element to position:relative, so the chapter stylesheet gives our
    // container a stronger full-size rule. Keep the GL viewport synchronized
    // as the opening curtain reveals the split-screen layout.
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => map?.resize());
      resizeObserver.observe(root);
    }
    document.addEventListener("transitionend", (event) => {
      if (event.target?.closest?.(".chapter-frame, .opening-curtain, #chapter-leaf")) map?.resize();
    });

    map.on("load", () => {
      const loadedStyle = map.getStyle?.();
      if (!loadedStyle || !Array.isArray(loadedStyle.layers) || loadedStyle.layers.length === 0) {
        disableMapbox();
        return;
      }
      loadedStyle.layers.forEach((layer) => {
        if (layer.type !== "symbol") return;
        // All generic labels are removed. The few regional anchors needed by
        // this chapter are added below as controlled style layers.
        map.setLayoutProperty(layer.id, "visibility", "none");
      });

      if (!map.getSource("fishtail-mapbox-dem")) {
        map.addSource("fishtail-mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14
        });
      }
      map.setTerrain({ source: "fishtail-mapbox-dem", exaggeration: 0 });
      try {
        map.setFog({
          range: [0.7, 8],
          color: "#e8e7df",
          "high-color": "#d7e0e3",
          "horizon-blend": 0.18,
          "space-color": "#d7e0e3",
          "star-intensity": 0
        });
      } catch (error) {
        // Fog is atmospheric polish; terrain and camera motion remain intact
        // in browsers that do not support every fog property.
      }

      const route = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates
        }
      };
      const points = {
        type: "FeatureCollection",
        features: [
          { type: "Feature", properties: { kind: "place", key: "kathmandu", labelZh: "加德满都", labelEn: "Kathmandu" }, geometry: { type: "Point", coordinates: [Kathmandu.lon, Kathmandu.lat] } },
          { type: "Feature", properties: { kind: "place", key: "pokhara", labelZh: "博克拉", labelEn: "Pokhara" }, geometry: { type: "Point", coordinates: [Pokhara.lon, Pokhara.lat] } },
          { type: "Feature", properties: { kind: "place", key: "lodge", labelZh: "鱼尾山屋", labelEn: "Fish Tail Lodge" }, geometry: { type: "Point", coordinates: [Lodge.lon, Lodge.lat] } },
          { type: "Feature", properties: { kind: "peak", key: "machhapuchhre", labelZh: "鱼尾峰 · 6,993 米", labelEn: "Machhapuchhre · 6,993 m" }, geometry: { type: "Point", coordinates: [Machhapuchhre.lon, Machhapuchhre.lat] } },
          { type: "Feature", properties: { kind: "peak", key: "annapurna", labelZh: "安纳布尔纳 I 峰 · 8,091 米", labelEn: "Annapurna I · 8,091 m" }, geometry: { type: "Point", coordinates: [Annapurna.lon, Annapurna.lat] } },
          { type: "Feature", properties: { kind: "country", key: "nepal", labelZh: "尼泊尔", labelEn: "Nepal" }, geometry: { type: "Point", coordinates: [83.55, 28.55] } },
          { type: "Feature", properties: { kind: "country", key: "india", labelZh: "印度", labelEn: "India" }, geometry: { type: "Point", coordinates: [80.15, 25.15] } },
          { type: "Feature", properties: { kind: "country", key: "china", labelZh: "中国", labelEn: "China" }, geometry: { type: "Point", coordinates: [87.3, 31.25] } }
        ]
      };

      map.addSource("fishtail-route", { type: "geojson", data: route });
      map.addLayer({
        id: "fishtail-route-casing",
        type: "line",
        source: "fishtail-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#f4f0e8",
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 6.4, 9, 9],
          "line-opacity": 0.77
        }
      });
      map.addLayer({
        id: "fishtail-route-line",
        type: "line",
        source: "fishtail-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#862e25",
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 3.2, 9, 4.8],
          "line-opacity": 0.84,
          "line-dasharray": [1.5, 1.25]
        }
      });
      map.addSource("fishtail-context", { type: "geojson", data: points });
      map.addLayer({
        id: "fishtail-country-labels",
        type: "symbol",
        source: "fishtail-context",
        filter: ["==", ["get", "kind"], "country"],
        layout: {
          "text-field": ["get", "labelZh"],
          "text-font": ["Noto Sans CJK SC Regular", "Open Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 8, 13],
          "text-letter-spacing": 0.12,
          "text-allow-overlap": true
        },
        paint: {
          "text-color": "#5e665d",
          "text-opacity": 0.72,
          "text-halo-color": "#f3f0e8",
          "text-halo-width": 1.2
        }
      });
      map.addLayer({
        id: "fishtail-context-points",
        type: "circle",
        source: "fishtail-context",
        paint: {
          "circle-radius": ["match", ["get", "kind"], "peak", 3.5, ["match", ["get", "key"], "lodge", 5, 4]],
          "circle-color": ["match", ["get", "kind"], "peak", "#4a6878", ["match", ["get", "key"], "lodge", "#9d3d31", "#f4f0e8"]],
          "circle-stroke-color": "#28332f",
          "circle-stroke-width": 1.4
        }
      });
      map.addLayer({
        id: "fishtail-context-labels",
        type: "symbol",
        source: "fishtail-context",
        layout: {
          "text-field": ["get", "labelZh"],
          "text-font": ["Noto Sans CJK SC Regular", "Open Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 11, 8, 14, 12, 17],
          "text-offset": [0.7, 0],
          "text-anchor": "left",
          "text-pitch-alignment": "viewport",
          "text-rotation-alignment": "viewport",
          "text-allow-overlap": true
        },
        paint: {
          "text-color": ["match", ["get", "kind"], "peak", "#4a6878", ["match", ["get", "key"], "lodge", "#9d3d31", "#28332f"]],
          "text-halo-color": "#f3f0e8",
          "text-halo-width": 1.5
        }
      });
      setContextLayerState();
      map.resize();
      window.requestAnimationFrame(() => map.resize());

      // Mapbox carries the full 2D-to-3D reveal. The local DEM is reserved for
      // the final art-directed close view and fades in near the end.
      map.on("idle", commitReady);
      commitReady();
    });
    map.on("error", (event) => {
      if (!ready && event?.error) disableMapbox();
    });
    readinessTimer = window.setTimeout(() => {
      if (!ready) disableMapbox();
    }, 6000);
  } catch (error) {
    disableMapbox();
  }

  window.FISHTAIL_MAPBOX = {
    setSection(next) {
      section = Number(next) || 1;
      progress = 0;
      desired = cameraFor(0);
      setMapVisibility();
      if (ready) {
        map.resize();
        applyCamera(desired);
      }
    },
    setProgress(nextSection, nextProgress) {
      section = Number(nextSection) || 1;
      progress = clamp(nextProgress);
      desired = cameraFor(progress);
      setMapVisibility();
      applyCamera(desired);
    },
    setLanguage(nextLanguage) {
      language = nextLanguage === "en" ? "en" : "zh";
      setContextLayerState();
    }
  };

  setMapVisibility();
})();
