const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const htmlPages = [
  'site/index.html',
  ...fs.readdirSync(path.join(root, 'site/chapters'), {withFileTypes: true})
    .filter(entry => entry.isDirectory() && entry.name !== '_shared')
    .map(entry => `site/chapters/${entry.name}/index.html`)
];

for (const page of htmlPages) {
  assert.match(read(page), /scripts\/analytics\.js(?:\?v=[a-f0-9]+)?"/, `${page} must load analytics`);
}

const redirect = read('index.html');
assert.doesNotMatch(redirect, /googletagmanager/, 'the redirect page must not create a duplicate GA page view');
assert.match(redirect, /destination\.search = window\.location\.search/);
assert.match(redirect, /destination\.hash = window\.location\.hash/);
assert.match(read('site/scripts/atlas-intro.js'), /utm_source/, 'the opening tour must preserve campaign attribution');

const instrumentation = [
  ['site/scripts/analytics.js', 'landing_view'],
  ['site/scripts/atlas.js', 'atlas_view'],
  ['site/chapters/_shared/chapter-shell.js', 'chapter_start'],
  ['site/chapters/_shared/chapter-shell.js', 'chapter_complete'],
  ['site/chapters/kashgar/app.js', 'chapter_start'],
  ['site/chapters/kashgar/app.js', 'chapter_complete'],
  ['site/scripts/atlas-ending.js', 'journey_complete'],
  ['site/scripts/atlas-ending.js', 'finale_view']
];
for (const [file, event] of instrumentation) {
  assert(read(file).includes(event), `${file} must emit ${event}`);
}

function storage() {
  const values = new Map();
  return {
    get length() { return values.size; },
    key: index => [...values.keys()][index] || null,
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

const appended = [];
const context = {
  console,
  URL,
  URLSearchParams,
  location: {protocol: 'http:', hostname: 'localhost', pathname: '/site/chapters/dujiangyan/index.html', search: ''},
  localStorage: storage(),
  sessionStorage: storage(),
  document: {
    createElement: () => ({}),
    currentScript: {src: 'http://localhost/site/scripts/analytics.js'},
    head: {append: node => appended.push(node)}
  },
  window: {}
};
context.window.window = context.window;
context.window.location = context.location;
context.window.document = context.document;
context.window.localStorage = context.localStorage;
context.window.sessionStorage = context.sessionStorage;
vm.createContext(context);
vm.runInContext(read('site/scripts/analytics.js'), context);

const analytics = context.window.JOURNEY_ANALYTICS;
assert.equal(analytics.measurementId, 'G-G4Y7367LWY');
assert.equal(appended.length, 0, 'local previews must not contact Google Analytics');
assert.equal(analytics.event('not_an_allowed_event'), false);
assert.equal(analytics.onceSession('landing_view'), true);
assert.equal(analytics.onceSession('landing_view'), false, 'session entry events must be deduplicated');
assert.equal(analytics.onceLocal('journey_complete'), true);
assert.equal(analytics.onceLocal('journey_complete'), false, 'journey completion must be deduplicated');

const commands = [...context.window.dataLayer].map(item => Array.from(item));
assert(commands.some(command => command[0] === 'config' && command[1] === 'G-G4Y7367LWY'));
assert.deepEqual(
  commands.filter(command => command[0] === 'event').map(command => command[1]),
  ['landing_view', 'journey_complete']
);

console.log('PASS: the six-event analytics contract is loaded on every experience page and deduplicates milestone events.');
