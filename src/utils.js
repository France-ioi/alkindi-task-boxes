

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

function genRandomInput (nbInputs) {
  var inputs = [];
  for (var iInput = 0; iInput < nbInputs; iInput++) {
    inputs[iInput] = Math.floor(Math.random() * 2);
  }
  return inputs;
}

function computeWorstCase (transformations, permutations, boxes, selectedInput) {
  var nbAttempts = 200;
  var worstInputs = [];
  var nbInputs = permutations[0].length;
  var minImpact = {nbDiff: 1000};
  for (var iAttempt = 0; iAttempt < nbAttempts; iAttempt++) {
    var inputs = genRandomInput(nbInputs);
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
