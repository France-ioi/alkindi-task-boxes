var {range} = require("range");
var seedrandom = require("seedrandom");
var {shuffle} = require("shuffle");
/**
 * Default constants
 */

const referenceFrequencies = [
  {symbol: "E", proba: 0.1715},
  {symbol: "A", proba: 0.0812},
  {symbol: "S", proba: 0.0795},
  {symbol: "I", proba: 0.0758},
  {symbol: "T", proba: 0.0724},
  {symbol: "N", proba: 0.0709},
  {symbol: "R", proba: 0.0655},
  {symbol: "U", proba: 0.0637},
  {symbol: "L", proba: 0.0545},
  {symbol: "O", proba: 0.054},
  {symbol: "D", proba: 0.0367},
  {symbol: "C", proba: 0.0334},
  {symbol: "P", proba: 0.0302},
  {symbol: "M", proba: 0.0297},
  {symbol: "V", proba: 0.0163},
  {symbol: "Q", proba: 0.0136},
  {symbol: "F", proba: 0.0107},
  {symbol: "B", proba: 0.009},
  {symbol: "G", proba: 0.0087},
  {symbol: "H", proba: 0.0074},
  {symbol: "J", proba: 0.0054},
  {symbol: "X", proba: 0.0039},
  {symbol: "Y", proba: 0.0031},
  {symbol: "Z", proba: 0.0013},
  {symbol: "W", proba: 0.0011},
  {symbol: "K", proba: 0.0005}
];

const versions = [
  [],
  {numMessages: 1, showSearchTool: false},
  {numMessages: 1, showSearchTool: true},
  {numMessages: 50, showSearchTool: true}
];

/**
 * task module export...
 */

/* prefer JSON config file at project root?  depend on NODE_ENV? */
module.exports.config = {
  cache_task_data: false
};

module.exports.taskData = function (args, callback) {
  const {publicData} = generateTaskData(args.task);
  callback(null, publicData);
};

module.exports.requestHint = function (args, callback) {
  const hints_requested = args.task.hints_requested
    ? JSON.parse(args.task.hints_requested)
    : [];
  for (var hintRequest of hints_requested) {
    if (hintRequest === null) {
      /* XXX Happens, should not. */
      /* eslint-disable-next-line no-console */
      console.log("XXX", args.task.hints_requested);
      continue;
    }
    if (typeof hintRequest === "string") {
      hintRequest = JSON.parse(hintRequest);
    }
  }
  callback(null, args.request);
};

module.exports.gradeAnswer = function (args, task_data, callback) {

  callback(null, {});
};





function generateTaskData (task) {
  const version = parseInt(task.params.version) || 1;

  const privateData = {

  };

  // const rng0 = seedrandom(task.random_seed + 11);

  const publicData = {
    version,
    bits: 15,
    transformations: 5,
  };

  return {publicData, privateData};
}

