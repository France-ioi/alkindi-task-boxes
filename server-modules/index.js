var {range} = require("range");
var seedrandom = require("seedrandom");
var {shuffle} = require("shuffle");
/**
 * Default constants
 */

const versions = [
  [],
  {numMessages: 1, showSearchTool: false},
  {numMessages: 1, showSearchTool: true},
  {numMessages: 50, showSearchTool: true}
];

const minScore = 15;

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
  const {
    totalScore
  } = JSON.parse(args.answer.value);

  let score = 0, message = "";
  score = Math.min(100, Math.max(0, totalScore - minScore));
  message = `Score calculé`;

  callback(null, {score, message});
};



function generateTaskData (task) {
  const version = parseInt(task.params.version) || 1;

  const privateData = {
  };

  const publicData = {
    version,
    bits: 15,
    minScore,
    transformations: 5,
  };

  return {publicData, privateData};
}

