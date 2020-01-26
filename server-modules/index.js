var {range} = require("range");
var seedrandom = require("seedrandom");
var {shuffle} = require("shuffle");
var {genMessagesForVersion} = require('./generator');
var cache = require('lru-node-cache');
var lncObj = new cache.LRU(1000);
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
  console.time('gen data');
  const {publicData} = generateTaskData(args.task);
  console.timeEnd('gen data');
  callback(null, publicData);
};

module.exports.requestHint = function (args, callback) {
  const request = args.request;
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
    if (hintRequestEqual(hintRequest, request)) {
      return callback(new Error("hint already requested"));
    }
  }
  callback(null, args.request);
};

module.exports.gradeAnswer = function (args, task_data, callback) {
  const version = parseInt(args.task.params.version);
  const {
    publicData: {alphabet, messages},
    privateData
  } = generateTaskData(args.task);

  let {substitutions: submittedKeys} = JSON.parse(args.answer.value);
  submittedKeys = submittedKeys.map(cells =>
    cells.map(i => (i === -1 ? " " : alphabet[i])).join("")
  );

  const hintsRequested = getHintsRequested(args.answer.hints_requested);

  function gradeByVersion (version) {
    const {numMessages = 1} = versions[version];

    switch (numMessages) {
      case 1:
        {
          const {cipherText} = messages[0];
          const {clearText} = privateData[0];
          return gradeSingleMessage(alphabet, cipherText, clearText, hintsRequested[0] || [], submittedKeys[0]);
        }
      case 50:
        {
          return grade50Messages(alphabet, messages, privateData, hintsRequested, submittedKeys);
        }
    }
  }

  callback(null, gradeByVersion(version));
};

/**
 * task methods
 */

function gradeSingleMessage (alphabet, cipherText, clearText, hintsRequested, submittedKey) {
  const evalLength = 200; /* Score on first 200 characters only */
  const evalText = cipherText.slice(0, evalLength);
  const decodedText = monoAlphabeticDecode(
    alphabet,
    submittedKey,
    evalText
  );

  let evalClearText = '';
  let j = 0;
  for (let i = 0; i < evalLength; i++) {
    if (!alphabet.includes(clearText[j])) {
      j++;
    }
    evalClearText += clearText[j];
    j++;
  }

  let correctChars = 0;
  for (let i = 0; i < evalLength; i += 1) {
    if (evalClearText[i] === decodedText[i]) {
      correctChars += 1;
    }
  }

  let score = 0,
    message =
      "Il y a au moins une différence entre les 200 premiers caractères de votre texte déchiffré et ceux du texte d'origine.";

  const nHints3 = (hintsRequested.filter(h => h.type === 'type_3')).length || 0;

  if (nHints3 !== 0) {
    message = "Vous avez demandé tous les indices !";
  } else {
    if (correctChars == evalLength) {
      const nHints1 = (hintsRequested.filter(h => h.type === 'type_1')).length || 0;
      const nHints2 = (hintsRequested.filter(h => h.type === 'type_2')).length || 0;
      const nHints = hintsRequested.length;

      score = Math.max(0, 100 - ((nHints1 * 5) + (nHints2 * 10)));
      message = `Bravo, vous avez bien déchiffré le texte. Vous avez utilisé ${nHints} indice${
        nHints > 1 ? "s" : ""
        }.`;
    }
  }

  return {score, message};
}

function grade50Messages (alphabet, messages, privateData, hintsRequested, submittedKeys) {
  const evalLength = 200; /* Score on first 200 characters only */
  const nHints = range(0, 50)
    .map(index =>
      Array.isArray(hintsRequested[index])
        ? ((((hintsRequested[index]).filter(h => h.type === 'type_3')).length === 0) ? hintsRequested[index].length : 26)
        : 0)
    .reduce(function (total, current) {return current + total;}, 0);

  function grade (alphabet, clearText, cipherText, submittedKey) {
    if (submittedKey.indexOf(' ') !== -1) {
      return false; // decode key is not completed
    }

    const evalText = cipherText.slice(0, evalLength);

    let evalClearText = '';
    let j = 0;

    for (let i = 0; i < evalLength; i++) {
      if (!alphabet.includes(clearText[j])) {
        j++;
      }
      evalClearText += clearText[j];
      j++;
    }

    const decodedText = monoAlphabeticDecode(
      alphabet,
      submittedKey,
      evalText
    );

    let correctChars = 0;

    for (let i = 0; i < evalLength; i += 1) {
      if (evalClearText[i] === decodedText[i]) {
        correctChars += 1;
      }
    }

    return (correctChars == evalLength);
  }

  const decryptedMessages = [];

  for (let index = 0; index < submittedKeys.length; index++) {
    let decryptedOk = false;
    const nHints3 = hintsRequested[index] ? ((hintsRequested[index]).filter(h => h.type === 'type_3')).length : 0;
    if (nHints3 !== 0) {
      decryptedOk = true;
    } else {
      const submittedKey = submittedKeys[index];
      const {cipherText} = messages[index];
      const {clearText} = privateData[index];
      decryptedOk = grade(alphabet, clearText, cipherText, submittedKey);
    }
    if (decryptedOk) {
      decryptedMessages.push(index + 1);
      if (decryptedMessages.length === 4) {
        break;
      }
    }
  }

  let score = 0, message = `. Vous avez utilisé ${nHints} indice${
    nHints > 1 ? "s" : ""
    }.`;

  function listOfNumToStr (numArr) {
    if (numArr.length === 1) {
      return " " + numArr[0];
    }
    const last = numArr[numArr.length - 1].toString();
    return numArr.join(', ').replace(', ' + last, ' and ' + last);
  }

  if (decryptedMessages.length > 0) {
    score = Math.max(0, (25 * decryptedMessages.length) - nHints);
    message = `Vous avez correctement déchiffré le(s) message(s) ${listOfNumToStr(decryptedMessages)}` + message;
  } else {
    message = 'Vous n\'avez déchiffré aucun message.' + message;
  }

  if (score < 0) {
    score = 0;
  }

  return {score, message};
}

function generateMessageData (alphabet, rng0, clearText, hintsRequested) {
  const rngKeys = seedrandom(rng0());
  const alphabetSize = alphabet.length;
  // const clearText = alphabet.repeat(10);
  const encodingKey = generateKey(alphabet, rngKeys); // encoding keys in decoding order
  const decodingKey = inversePermutation(alphabet, encodingKey);
  const cipherText = monoAlphabeticEncode(alphabet, encodingKey, clearText);
  const frequencies = range(0, alphabetSize).map(start =>
    frequencyAnalysis(cipherText, alphabet, start, alphabetSize)
  );
  const hints = grantHints(alphabet, encodingKey, decodingKey, hintsRequested);

  return {cipherText, hints, frequencies, clearText, encodingKey, decodingKey};
}

function getHintsRequested (hints_requested) {
  return (hints_requested
    ? JSON.parse(hints_requested)
    : []
  )
    .filter(hr => hr !== null)
    .reduce(function (obj, hint) {
      if (typeof hint === "string") {
        hint = JSON.parse(hint);
      }
      const {messageIndex} = hint;
      if (obj[messageIndex]) {
        obj[messageIndex].push(hint);
      } else {
        obj[messageIndex] = [hint];
      }
      return obj;
    }, {});
}

function getMessageData (seed, version, rng0) {
  const key = `task50.v${version}_${seed}`;
  let data = lncObj.get(key);
  if (!data) {
    const rngText = seedrandom(rng0());
    const {messages: messageList, passwords} = genMessagesForVersion(version, rngText);
    data = [messageList, passwords];
    lncObj.set(key, data);
  }
  return data;
}

function generateTaskData (task) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const version = parseInt(task.params.version) || 1;
  const config = versions[version]; // specification of decoding substitutions
  const messages = [];
  const privateData = [];
  // if (process.env.DEV_MODE) {
  //   task.random_seed = 1;
  // }

  // const seed = task.random_seed + 0;

  // const rng0 = seedrandom(seed);
  // const rngText = seedrandom(rng0());

  // const key = `task50.v${version}_${seed}`;
  // console.log('Cache Key :', key);
  // const data = lncObj.get(key);
  // // const data = null;

  // let [messages, privateData, passwords] = data || [[],[],[]];

  // if (!data) {
  //   console.log('New Data');
  //   const {messages: messageList, passwords: passwordsList} = genMessagesForVersion(version, rngText);
  //   passwords = passwordsList;

  //   for (let m = 0; m < config.numMessages; m++) {
  //     const {
  //       cipherText,
  //       frequencies,
  //       clearText,
  //       encodingKey,
  //       decodingKey
  //     } = generateMessageData(
  //       alphabet,
  //       rng0,
  //       messageList[m]
  //     );

  //     console.log('encodingKey :', encodingKey);
  //     messages.push({cipherText, frequencies});
  //     privateData.push({clearText, encodingKey, decodingKey});
  //   }

  //   lncObj.set(key, [messages, privateData, passwords]);
  // } else {
  //   console.log('Cached Data');
  // }

  // const hintsRequested = getHintsRequested(task.hints_requested);

  // for (let m = 0; m < config.numMessages; m++) {
  //   const hints = grantHints(alphabet, privateData[m].encodingKey, privateData[m].decodingKey, hintsRequested[m]);
  //   messages[m].hints = hints;
  // }
  //
  // const publicData = {

  const rng0 = seedrandom(task.random_seed + 11);
  const [messageList, passwords] = getMessageData(task.random_seed + 11, version, rng0);
  const rng1 = seedrandom(task.random_seed + 11);

  // hints per message
  const hintsRequested = getHintsRequested(task.hints_requested);

  for (let m = 0; m < config.numMessages; m++) {
    const {
      cipherText,
      hints,
      frequencies,
      clearText,
      encodingKey,
      decodingKey
    } = generateMessageData(
      alphabet,
      rng1, messageList[m],
      hintsRequested[m] || []
    );
    messages.push({cipherText, hints, frequencies});
    privateData.push({clearText, encodingKey, decodingKey});
  }

  const publicData = {
    alphabet,
    config,
    referenceFrequencies,
    messages,
    passwords
  };

  return {publicData, privateData};
}

function generateKey (alphabet, rngKeys) {
  let key = shuffle({random: rngKeys, deck: alphabet.split("")}).cards.join("");
  //key = "DLMEFVAQRSTNUCWXGOPYZBHIJK"; //for dev mode testing
  return key;
}

function monoAlphabeticEncode (alphabet, encodingKey, clearText) {
  let i,
    j,
    cipherText = "";
  for (i = 0; i < clearText.length; i++) {
    for (j = 0; j < alphabet.length; j++) {
      if (clearText[i] == alphabet[j]) {
        cipherText += encodingKey[j];
        break;
      }
    }
  }
  return cipherText;
}

function monoAlphabeticDecode (alphabet, encodingKey, cipherText) {
  let i,
    j,
    clearText = "";
  for (i = 0; i < cipherText.length; i++) {
    for (j = 0; j < alphabet.length; j++) {
      if (cipherText[i] == alphabet[j]) {
        clearText += encodingKey[j];
        break;
      }
    }
  }
  return clearText;
}

function inversePermutation (alphabet, key) {
  const result = new Array(alphabet.length).fill(" ");
  for (let i = 0; i < alphabet.length; i += 1) {
    let pos = alphabet.indexOf(key[i]);
    if (pos !== -1) {
      result[pos] = alphabet[i];
    }
  }
  return result.join("");
}

function frequencyAnalysis (text, alphabet, start, skip) {
  const freqs = new Array(alphabet.length).fill(0);
  let total = 0;
  for (let i = start; i < text.length; i += skip) {
    let c = text[i];
    let j = alphabet.indexOf(c);
    if (j !== -1) {
      freqs[j] += 1;
      total += 1;
    }
  }
  for (let i = 0; i < alphabet.length; i += 1) {
    freqs[i] = round(freqs[i] / total, 4);
  }
  return freqs;
}

function round (value, decimals) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

function hintRequestEqual (h1, h2) {
  return (
    h1.messageIndex === h2.messageIndex &&
    h1.cellRank === h2.cellRank &&
    h1.type == h2.type
  );
}

function grantHints (alphabet, encodingKey, decodingKey, hintRequests) {
  return hintRequests.map(function (hintRequest) {
    let symbol;
    let {messageIndex, cellRank, type} = hintRequest;
    if (type === "type_1") {
      symbol = decodingKey[cellRank];
    } else if (type === "type_2") {
      symbol = alphabet[cellRank];
      cellRank = alphabet.indexOf(encodingKey[cellRank]);
    } else {
      return {messageIndex, cellRank, symbol: '', key: decodingKey, type};
    }
    return {messageIndex, cellRank, symbol, type};
  });
}
