import React from 'react';
import {range} from 'range';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {Radio, FormGroup} from 'react-bootstrap';
import {OptionsToolSelector, OptionsToolView} from './tools/options.js';
import {MainSelector, MainView} from './tools/main.js';

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
  const boxes = new Array(numTransform);
  const arrow = -1;
  const selected = 0;

  for (let i = 0; i < numTransform; i++) {
    transformations[i] = {
      name: String.fromCharCode(65 + i),
      type: 'permutation',
    };
    permutation[i] = range(0, bits);
    boxes[i] = range(0, 8).map(v => [v, 0]);
  }

  return {
    ...state, transformations,
    permutation,
    boxes,
    arrow,
    selected
  };
}

function taskRefreshReducer (state) {
  return {...state};
}

function transformTypeChangedReducer (state, {value}) {
  const {selected} = state;
  return update(state, {
    transformations: {[selected]: {$merge: {type: value}}}
  });
}

function transformSelectedChangedReducer (state, {index}) {
  return update(state, {
    selected: {$set: index}
  });
}

function transformDataChangedReducer (state, {option_type, data}) {
  const {selected} = state;
  return update(state, {
    [option_type]: {[selected]: {$set: data}}
  });
}

export default {
  actions: {
    transformTypeChanged: 'Transformation.Type.Changed',
    transformSelectedChanged: 'Transformation.Selected.Changed',
    transformDataChanged: 'Transformation.Data.Changed',
  },
  actionReducers: {
    appInit: appInitReducer,
    taskInit: taskInitReducer,
    taskRefresh: taskRefreshReducer,
    transformTypeChanged: transformTypeChangedReducer,
    transformSelectedChanged: transformSelectedChangedReducer,
    transformDataChanged: transformDataChangedReducer,
  },
  views: {
    OptionsTool: connect(OptionsToolSelector)(OptionsToolView),
    Main: connect(MainSelector)(MainView),
    Transformation: connect(TransformationViewSelector)(TransformationView),
  }
};
