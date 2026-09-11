const _1qioj8lthgb = require('../unmerged_dictionary/common.json');
const _16n7m42it4z = require('../unmerged_dictionary/exams.json');
const _26hig7wsy1c = require('../unmerged_dictionary/finance.json');
const _17w1n9vzrrg = require('../unmerged_dictionary/flags.json');
const _176kbriz501 = require('../unmerged_dictionary/metrics.json');
const _27ahegvxky5 = require('../unmerged_dictionary/notifications.json');
const _15v2fga5tip = require('../unmerged_dictionary/pets.json');
const _2fvprline7y = require('../unmerged_dictionary/pomodoro.json');
const _1t1y1n9lohu = require('../unmerged_dictionary/shopping.json');
const _1dh761v00l9 = require('../unmerged_dictionary/stacks.json');

const dictionaries = {
  "common": _1qioj8lthgb,
  "exams": _16n7m42it4z,
  "finance": _26hig7wsy1c,
  "flags": _17w1n9vzrrg,
  "metrics": _176kbriz501,
  "notifications": _27ahegvxky5,
  "pets": _15v2fga5tip,
  "pomodoro": _2fvprline7y,
  "shopping": _1t1y1n9lohu,
  "stacks": _1dh761v00l9
};
const getUnmergedDictionaries = () => dictionaries;

module.exports.getUnmergedDictionaries = getUnmergedDictionaries;
module.exports = dictionaries;
