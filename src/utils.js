import seedrandom from "seedrandom";

const seed = 10;

function applyPermutation (inputs, permutation) {
  var result = [];
  for (var iInput = 0; iInput < inputs.length; iInput++) {
    result[permutation[iInput]] = inputs[iInput];
  }
  return result;
}

function applyBoxes (inputs, boxes) {
  var result = [];
  var nbTriplets = inputs.length / 3;
  for (var iTriplet = 0; iTriplet < nbTriplets; iTriplet++) {
    var binaryInput = 0;
    for (var iInput = 2; iInput >= 0; iInput--) {
      binaryInput *= 2;
      binaryInput += inputs[iTriplet * 3 + iInput];
    }
    var binaryOutput = boxes[binaryInput];
    for (var iOutput = 0; iOutput < 3; iOutput++) {
      var digit = binaryOutput % 2;
      result[iTriplet * 3 + iOutput] = digit;
      if (digit == 1) {
        binaryOutput--;
      }
      binaryOutput /= 2;
    }
  }
  return result;
}

function applyTransformations (transformations, permutations, boxes, inputs) {
  var result = inputs;
  for (var iTransf = 0; iTransf < transformations.length; iTransf++) {
    var transf = transformations[iTransf].type;
    if (transf == 'permutation') {
      result = applyPermutation(result, permutations[iTransf]);
    } else {
      result = applyBoxes(result, boxes);
    }
  }
  return result;
}

function computeImpact (transformations, permutations, boxes, inputs, selectedInput) {
  var outputs1 = applyTransformations(transformations, permutations, boxes, inputs);
  inputs[selectedInput] = 1 - inputs[selectedInput];
  var outputs2 = applyTransformations(transformations, permutations, boxes, inputs);
  inputs[selectedInput] = 1 - inputs[selectedInput];
  var nbDifferences = 0;
  var impactedOutputs = [];
  for (var iOutput = 0; iOutput < outputs1.length; iOutput++) {
    if (outputs1[iOutput] != outputs2[iOutput]) {
      nbDifferences++;
      impactedOutputs[iOutput] = 1;
    } else {
      impactedOutputs[iOutput] = 0;
    }
  }
  return {
    impactedOutputs: impactedOutputs,
    nbDiff: nbDifferences
  };
}

function genRandomInput (rng, nbInputs) {
  var inputs = [];
  for (var iInput = 0; iInput < nbInputs; iInput++) {
    inputs[iInput] = Math.floor(rng() * 2);
  }
  return inputs;
}

 function computeWorstCaseOld (transformations, permutations, boxes, selectedInput) {
  var nbAttempts = 200;
  var worstInputs = [];
  var nbInputs = permutations[0].length;
  var minImpact = {nbDiff: 1000};
  const rng0 = seedrandom(seed);
  for (var iAttempt = 0; iAttempt < nbAttempts; iAttempt++) {
    var inputs = genRandomInput(rng0, nbInputs);
    var impact = computeImpact(transformations, permutations, boxes, inputs, selectedInput);
    //console.log("diff : " + impact.nbDiff + " for " + impact.impactedOutputs);
    if (impact.nbDiff < minImpact.nbDiff) {
      worstInputs = inputs;
      minImpact = impact;
    }
  }
  //console.log("SelectedInput : " + selectedInput);
  //console.log("Worst input : " + worstInputs);
  //console.log("Impacted outputs : " + minImpact.impactedOutputs);
  return {
    inputs: worstInputs,
    impactedOutputs: minImpact.impactedOutputs,
    nbDiff: minImpact.nbDiff
  };
}

export function computeWorstCase (transformations, permutations, boxes, selectedInput) {
  var nbAttempts = 200;
  var nbInputs = permutations[0].length;
  const rng0 = seedrandom(seed);
  var scoreInputs = [];
  for (var diffs = 0; diffs <= nbInputs; diffs++) {
    scoreInputs[diffs] = {count: 0, inputs: [], impactedOutputs: []};
  }
  var totalDiffs = 0;
  for (var iAttempt = 0; iAttempt < nbAttempts; iAttempt++) {
    var inputs = genRandomInput(rng0, nbInputs);
    var impact = computeImpact(transformations, permutations, boxes, inputs, selectedInput);
    scoreInputs[impact.nbDiff].count++;
    scoreInputs[impact.nbDiff].inputs = inputs;
    scoreInputs[impact.nbDiff].impactedOutputs = impact.impactedOutputs;
    totalDiffs += impact.nbDiff;
  }
  var avgDiffs = Math.floor(totalDiffs / nbAttempts);
  while (scoreInputs[avgDiffs].count == 0) {
    avgDiffs++;
  }
  return {
    inputs: scoreInputs[avgDiffs].inputs,
    impactedOutputs: scoreInputs[avgDiffs].impactedOutputs,
    nbDiff: avgDiffs
  };
}

export function computeScores (transformations, permutations, boxes) {
  var nbInputs = permutations[0].length;
  var scores = [];
  for (let iOutput = 0; iOutput < nbInputs; iOutput++) {
    scores[iOutput] = 0;
  }
  for (let iInput = 0; iInput < nbInputs; iInput++) {
    var worst = computeWorstCase(transformations, permutations, boxes, iInput);
    for (var iOutput = 0; iOutput < nbInputs; iOutput++) {
      scores[iOutput] += worst.impactedOutputs[iOutput];
    }
  }
  return scores;
}

export function genRandomPermutation (nbInputs) {
  var permutation = [];
  var lockedInputs = [];
  var lockedOutputs = [];
  for (var iInput = 0; iInput < nbInputs; iInput++) {
    permutation[iInput] = iInput;
    lockedInputs[iInput] = false;
    lockedOutputs[iInput] = false;
  }
  var startBox = Math.floor(Math.random() * nbInputs / 3);
  var usedBoxes = [];

  for (var box = 0; box < nbInputs / 3; box++) {
    usedBoxes[box] = false;
  }
  for (var iBoxOutput = 0; iBoxOutput < 3; iBoxOutput++) {
    let input = startBox * 3 + iBoxOutput;
    let box = Math.floor(Math.random() * nbInputs / 3);
    while (usedBoxes[box]) {
      box = Math.floor(Math.random() * nbInputs / 3);
    }
    usedBoxes[box] = true;
    var output = box * 3 + Math.floor(Math.random() * 3);
    var prevOutput = permutation[input];
    var prevInput = 0;
    for (var curInput = 0; curInput < nbInputs; curInput++) {
      if (permutation[curInput] == output) {
        prevInput = curInput;
      }
    }
    permutation[input] = output;
    permutation[prevInput] = prevOutput;
    lockedInputs[input] = true;
    lockedOutputs[output] = true;
  }
  var invertedPermutation = [];
  for (let iInput = 0; iInput < nbInputs; iInput++) {
    invertedPermutation[permutation[iInput]] = iInput;
  }
  if (Math.random() < 0.5) {
    return {
      permutation: invertedPermutation,
      lockedInputs: lockedOutputs,
      lockedOutputs: lockedInputs
    };
  }
  return {
    permutation: permutation,
    lockedInputs: lockedInputs,
    lockedOutputs: lockedOutputs
  };
}
