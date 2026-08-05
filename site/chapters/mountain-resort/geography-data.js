/*
 * Geographic anchors use WGS 84 coordinates.
 * The resort-area outline and its internal zones are a literary diagram, not a surveyed boundary.
 */
window.MOUNTAIN_RESORT_GEOGRAPHY = {
  regional: {
    extent: {
      west: 116.1,
      east: 118.05,
      south: 39.75,
      north: 42.15
    },
    places: [
      {
        id: "beijing",
        zh: "北京",
        en: "Beijing",
        coordinates: [116.4074, 39.9042],
        kind: "capital"
      },
      {
        id: "summer-palace",
        zh: "颐和园",
        en: "Summer Palace",
        coordinates: [116.26803, 39.99694],
        kind: "memory"
      },
      {
        id: "gubeikou",
        zh: "古北口",
        en: "Gubeikou Pass",
        coordinates: [117.1572, 40.69],
        kind: "pass"
      },
      {
        id: "chengde",
        zh: "承德 · 避暑山庄",
        en: "Chengde · Mountain Resort",
        coordinates: [117.9375, 40.9875],
        kind: "resort"
      },
      {
        id: "mulan",
        zh: "木兰围场",
        en: "Mulan Hunting Grounds",
        coordinates: [117.3, 41.925],
        kind: "hunting-ground"
      }
    ],
    imperialRoute: [
      [116.4074, 39.9042],
      [117.1572, 40.69],
      [117.9375, 40.9875],
      [117.3, 41.925]
    ],
    greatWall: [
      [116.24, 40.55],
      [116.62, 40.64],
      [117.1572, 40.69],
      [117.52, 40.58],
      [117.92, 40.48]
    ],
    /*
     * Officially published geographic range for the Hebei Upper Luan River
     * reserve associated with the Mulan Weichang area.
     */
    mulanRange: {
      west: 116.85,
      east: 117.75,
      south: 41.7833,
      north: 42.1
    }
  },
  extent: {
    west: 117.91,
    east: 117.975,
    south: 40.975,
    north: 41.03
  },
  property: {
    name: "Mountain Resort and its Outlying Temples",
    center: [117.9375, 40.9875],
    unescoAreaHectares: 611.2
  },
  places: [
    {
      id: "resort",
      zh: "避暑山庄",
      en: "Mountain Resort",
      coordinates: [117.9375, 40.9875],
      kind: "resort"
    },
    {
      id: "putuo",
      zh: "普陀宗乘之庙",
      en: "Putuo Zongcheng Temple",
      coordinates: [117.927778, 41.0125],
      kind: "temple"
    },
    {
      id: "xumi",
      zh: "须弥福寿之庙",
      en: "Xumi Fushou Temple",
      coordinates: [117.935556, 41.008889],
      kind: "temple"
    },
    {
      id: "puning",
      zh: "普宁寺",
      en: "Puning Temple",
      coordinates: [117.946111, 41.014444],
      kind: "temple"
    },
    {
      id: "puyou",
      zh: "普佑寺",
      en: "Puyou Temple",
      coordinates: [117.94762, 41.014613],
      kind: "temple"
    },
    {
      id: "anyuan",
      zh: "安远庙",
      en: "Anyuan Temple",
      coordinates: [117.952578, 41.002889],
      kind: "temple"
    },
    {
      id: "pule",
      zh: "普乐寺",
      en: "Pule Temple",
      coordinates: [117.954722, 40.995833],
      kind: "temple"
    }
  ],
  sources: {
    unesco: "https://whc.unesco.org/en/list/703/",
    chengde: "https://wwj.chengde.gov.cn/art/2018/11/8/art_962_753975.html",
    unescoMaps: "https://whc.unesco.org/en/list/703/maps/",
    summerPalace: "https://whc.unesco.org/en/list/880/maps/",
    mulanRange: "https://shj.chengde.gov.cn/art/2013/7/10/art_820_108214.html"
  }
};
