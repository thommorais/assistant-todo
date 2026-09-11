const _ygxlkliklz = require('../dictionary/common.json');
const _1b045bqjnxz = require('../dictionary/exams.json');
const _1w9hrl8d5h6 = require('../dictionary/finance.json');
const _1mp3semjyya = require('../dictionary/flags.json');
const _1lx5qx8o295 = require('../dictionary/metrics.json');
const _jw556sk4md = require('../dictionary/notifications.json');
const _16suw59x6y = require('../dictionary/pets.json');
const _ucncbovih7 = require('../dictionary/pomodoro.json');
const _f47zsq0ntt = require('../dictionary/shopping.json');
const _6r6wu9oke4 = require('../dictionary/stacks.json');

const dictionaries = {
  "common": _ygxlkliklz,
  "exams": _1b045bqjnxz,
  "finance": _1w9hrl8d5h6,
  "flags": _1mp3semjyya,
  "metrics": _1lx5qx8o295,
  "notifications": _jw556sk4md,
  "pets": _16suw59x6y,
  "pomodoro": _ucncbovih7,
  "shopping": _f47zsq0ntt,
  "stacks": _6r6wu9oke4
};
const getDictionaries = () => dictionaries;

module.exports.getDictionaries = getDictionaries;
module.exports = dictionaries;
