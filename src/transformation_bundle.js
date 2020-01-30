import React from 'react';
import {connect} from 'react-redux';
import {Radio, FormGroup} from 'react-bootstrap';
import {OptionsToolSelector, OptionsToolView} from './tools/options_tool.js';

// import {} from './utils';

function appInitReducer (state, _action) {
  return {
    ...state,
  };
}

function taskInitReducer (state) {
  let {transformation} = state;
  if (!transformation) {
    return state;
  }
  return {...state};
}

function taskRefreshReducer (state) {
  let {transformation} = state;
  if (!transformation) {
    return state;
  }
  return {...state};
}


function TransformationViewSelector (state) {
  const {views} = state;
  // const {} = actions;
  // const {} = transformation;
  const {OptionsTool} = views;
  return {
    OptionsTool
  };
}

class TransformationView extends React.PureComponent {

  render () {
    const {
      OptionsTool,
    } = this.props;

    return (
      <div>
        <div className="main">

        </div>
        <div className="options">
          <h5>Type:</h5>
          <div className="option_radio">
            <FormGroup>
              <Radio name="type" value="permutation">Permutation</Radio>
              <Radio name="type" value="boites">Boites 3x3</Radio>
            </FormGroup>
          </div>
          <OptionsTool />
        </div>
      </div>
    );
  }
}

export default {
  actions: {

  },
  actionReducers: {
    appInit: appInitReducer,
    taskInit: taskInitReducer,
    taskRefresh: taskRefreshReducer,
  },
  views: {
    OptionsTool: connect(OptionsToolSelector)(OptionsToolView),
    Transformation: connect(TransformationViewSelector)(TransformationView),
  }
};
