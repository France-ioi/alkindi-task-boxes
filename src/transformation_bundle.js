import React from 'react';
import {range} from 'range';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {Radio, FormGroup} from 'react-bootstrap';
import {OptionsToolSelector, OptionsToolView} from './tools/options.js';
import {MainSelector, MainView} from './tools/main.js';
import {computeScores, computeWorstCase} from './utils';

// import {} from './utils';

function TransformationViewSelector (state) {
  const {views, actions, transformations, selected} = state;
  const {transformTypeChanged} = actions;
  // const {} = transformation;
  const {OptionsTool, Main} = views;
  return {
    Main,
    OptionsTool,
    transformations,
    selected,
    transformTypeChanged,
  };
}

class OptionsSelector extends React.PureComponent {
  render () {
    const {type} = this.props;
    return (
      <div className="option_radio">
        <FormGroup>
          <Radio name="type" onChange={this.onChange} checked={"permutation" === type} value="permutation">Permutation</Radio>
          <Radio name="type" onChange={this.onChange} checked={"boxes" === type} value="boxes">Boites 3x3</Radio>
        </FormGroup>
      </div>
    );
  }

  onChange = (e) => {
    const {onTypeChanged} = this.props;
    onTypeChanged(e.target.value);
  }
}

class TransformationView extends React.Component {

  render () {
    const {
      OptionsTool, Main, transformations, selected
    } = this.props;

    const {type} = transformations[selected];

    return (
      <div>
        <Main />
        <div className="options">
          <h5>Type:</h5>
          <OptionsSelector type={type} onTypeChanged={this.onTypeChanged} />
          <OptionsTool />
        </div>
      </div>
    );
  }

  onTypeChanged = (value) => {
    const {dispatch, transformTypeChanged} = this.props;
    dispatch({type: transformTypeChanged, value});
  }

}


function appInitReducer (state, _action) {
  return {
    ...state,
  };
}

function taskInitReducer (state) {
  const {taskData: {bits, transformations: numTransform}} = state;

  const transformations = new Array(numTransform);
  const permutation = new Array(numTransform);
  const arrow = -1;
  const selected = 0;
  const highlights = new Array(numTransform);
  const affected = new Array(numTransform);

  for (let i = 0; i < numTransform; i++) {
    transformations[i] = {
      name: String.fromCharCode(65 + i),
      type: 'permutation',
    };
    permutation[i] = range(0, bits);
    highlights[i] = new Array(bits).fill(0);
    affected[i] = new Array(bits).fill(0);
  }

  const boxes = new Array(8).fill(0);
  const inputs = new Array(bits).fill(0);
  const outputs = new Array(bits).fill(0);
  const outputAffected = new Array(bits).fill(0);

  const scores = new Array(bits).fill(1);
  const totalScore = 0;
  const inputMode = 'manual';

  return {
    ...state,
    transformations,
    permutation,
    highlights,
    boxes,
    arrow,
    selected,
    inputs,
    inputMode,
    outputs,
    outputAffected,
    affected,
    scores,
    totalScore,
  };
}

function taskRefreshReducer (state) {
  return {...state};
}

function transformTypeChangedReducer (state, {value}) {
  const {selected} = state;
  return updateScores(updateHighlights(update(state, {
    transformations: {[selected]: {$merge: {type: value}}}
  })));
}

function transformSelectedChangedReducer (state, {index}) {
  return update(state, {
    selected: {$set: index}
  });
}

function transformDataChangedReducer (state, {option_type, data}) {
  const {selected} = state;
  if (option_type === 'permutation') {
    state = update(state, {
      [option_type]: {[selected]: {$set: data}}
    });
  } else {
    state = update(state, {
      [option_type]: {$set: data}
    });
  }
  return updateScores(updateHighlights(state));
}

function transformInputChangedReducer (state, {position}) {
  const {inputMode} = state;
  if (inputMode === 'auto') {
    return state;
  }

  return updateScores(updateHighlights(update(state, {
    inputs: {[position]: {$apply: (bit) => bit ^ 1}},
    arrow: {$apply: (value) => value === position ? -1 : value}
  })));
}

function transformArrowSelectedReducer (state, {index}) {
  state = update(state, {
    arrow: {$apply: (value) => value === index ? -1 : index}
  });
  return updateScores(updateHighlights(state));
}

function transformInputModeChangedReducer (state, {mode}) {
  return updateScores(updateHighlights(update(state, {
    inputMode: {$set: mode},
  })));
}


function chunkArray (myArray, chunk_size) {
  var results = [];
  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }
  return results;
}

function updateScores (state) {
  const {taskData: {bits}, transformations, permutation, boxes} = state;
  let scores = computeScores(transformations, permutation, boxes);
  let totalScore = 0;
  for (let iOutput = 0; iOutput < bits; iOutput++) {
    totalScore += scores[iOutput];
  }
  return update(state, {
    scores: {$set: scores},
    totalScore: {$set: totalScore}
  });
}

function applyPermutation (bits, prevOutput, perm) {
  const newOutput = new Array(bits);
  for (let k = 0; k < bits; k++) {
    newOutput[perm[k]] = prevOutput[k];
  }
  return newOutput;
}

function applyBoxes (prevOutput, boxes) {
  const newOutput = [];
  const inputChunks = chunkArray(prevOutput, 3);
  for (let k = 0; k < inputChunks.length; k++) {
    let value = 0;
    const chunk = inputChunks[k];
    for (let p = 0; p < 3; p++) {
      value |= chunk[p] << p;
    }
    const outputValue = boxes[value];
    for (let p = 0; p < 3; p++) {
      newOutput.push((outputValue & 1 << p) ? 1 : 0);
    }
  }
  return newOutput;
}

function updateInputs (state) {
  const {transformations, permutation, boxes, arrow, inputMode} = state;
  if (inputMode === 'auto' && arrow !== -1) {
    const {inputs} = computeWorstCase(transformations, permutation, boxes, arrow);
    state = {...state, inputs};
  }
  return state;
}

function updateHighlights (state) {
  state = updateInputs(state);
  const {taskData: {bits}, transformations, permutation, boxes, inputs, arrow} = state;
  let prevOutput = [...inputs];
  let prevOutputFlipped = [...inputs];
  prevOutputFlipped[arrow] = 1 - prevOutputFlipped[arrow];
  const highlights = new Array(transformations.length);
  const orangeHighlights = new Array(transformations.length);
  for (let i = 0; i < transformations.length; i++) {
    const {type} = transformations[i];
    let prevDifferences = [];
    for (let iBit = 0; iBit < bits; iBit++) {
      prevDifferences[iBit] = (prevOutput[iBit] != prevOutputFlipped[iBit]) ? 1 : 0;
    }
    let newOutput = [];
    let newOutputFlipped = [];
    if (type === 'permutation') {
      highlights[i] = [...prevOutput];
      orangeHighlights[i] = prevDifferences;
      const perm = permutation[i];
      newOutput = applyPermutation(bits, prevOutput, perm);
      newOutputFlipped = applyPermutation(bits, prevOutputFlipped, perm);
    } else {
      newOutput = applyBoxes(prevOutput, boxes);
      newOutputFlipped = applyBoxes(prevOutputFlipped, boxes);
      highlights[i] = [[...prevOutput], newOutput];
      let newDifferences = [];
      for (let iBit = 0; iBit < bits; iBit++) {
        newDifferences[iBit] = (newOutput[iBit] != newOutputFlipped[iBit]) ? 1 : 0;
      }
      orangeHighlights[i] = [prevDifferences, newDifferences];
    }
    prevOutput = newOutput;
    prevOutputFlipped = newOutputFlipped;
  }
  const outputs = prevOutput;
  const outputAffected = [];
  for (let iBit = 0; iBit < bits; iBit++) {
    outputAffected[iBit] = (prevOutput[iBit] != prevOutputFlipped[iBit]) ? 1 : 0;
  }

  return update(state, {
    highlights: {$set: highlights},
    affected: {$set: orangeHighlights},
    outputs: {$set: outputs},
    outputAffected: {$set: outputAffected}
  });
}

export default {
  actions: {
    transformTypeChanged: 'Transformation.Type.Changed',
    transformSelectedChanged: 'Transformation.Selected.Changed',
    transformDataChanged: 'Transformation.Data.Changed',
    transformInputChanged: 'Transformation.Input.Changed',
    transformArrowSelected: 'Transformation.Arrow.Selected.Changed',
    transformInputModeChanged: 'Transformation.Input.Mode.Changed',
  },
  actionReducers: {
    appInit: appInitReducer,
    taskInit: taskInitReducer,
    taskRefresh: taskRefreshReducer,
    transformTypeChanged: transformTypeChangedReducer,
    transformSelectedChanged: transformSelectedChangedReducer,
    transformDataChanged: transformDataChangedReducer,
    transformInputChanged: transformInputChangedReducer,
    transformArrowSelected: transformArrowSelectedReducer,
    transformInputModeChanged: transformInputModeChangedReducer,
  },
  views: {
    OptionsTool: connect(OptionsToolSelector)(OptionsToolView),
    Main: connect(MainSelector)(MainView),
    Transformation: connect(TransformationViewSelector)(TransformationView),
  }
};
