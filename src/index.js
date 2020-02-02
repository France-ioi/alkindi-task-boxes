
import algoreaReactTask from './algorea_react_task';

import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import './style.css';

import TransformationBundle from './transformation_bundle';
import WorkspaceBundle from './workspace_bundle';

const TaskBundle = {
  actionReducers: {
    appInit: appInitReducer,
    taskInit: taskInitReducer /* possibly move to algorea-react-task */,
    taskRefresh: taskRefreshReducer /* possibly move to algorea-react-task */,
    taskAnswerLoaded: taskAnswerLoaded,
    taskStateLoaded: taskStateLoaded,
  },
  includes: [
    TransformationBundle,
    WorkspaceBundle,
  ],
  selectors: {
    getTaskState,
    getTaskAnswer,
  }
};

if (process.env.NODE_ENV === 'development') {
  /* eslint-disable no-console */
  TaskBundle.earlyReducer = function (state, action) {
    console.log('ACTION', action.type, action);
    return state;
  };
}

function appInitReducer (state, _action) {
  const taskMetaData = {
    "id": "http://concours-alkindi.fr/tasks/2018/enigma",
    "language": "fr",
    "version": "fr.01",
    "authors": "Sébastien Carlier",
    "translators": [],
    "license": "",
    "taskPathPrefix": "",
    "modulesPathPrefix": "",
    "browserSupport": [],
    "fullFeedback": true,
    "acceptedAnswers": [],
    "usesRandomSeed": true
  };
  return {...state, taskMetaData};
}

function taskInitReducer (state, _action) {
  return {...state, taskReady: true};
}

function taskRefreshReducer (state, _action) {
  return {...state};
}

function getTaskAnswer (state) {
  const {
    transformations,
    permutation,
    boxes,
    inputs,
    totalScore,
  } = state;
  return {
    transformTypes: transformations.map(t => t.type),
    permutation,
    boxes,
    inputs,
    totalScore,
  };
}

function taskAnswerLoaded (state, {payload: {answer}}) {
  const {
    transformTypes,
    permutation,
    boxes,
    inputs,
  } = answer;

  let {transformations} = state;
  transformations = transformations.map((t, i) => ({...t, type: transformTypes[i]}));

  return {
    ...state, transformations,
    permutation,
    boxes,
    inputs,
  };
}

function getTaskState (state) {
  const {arrow, selected, inputMode} = state;
  return {arrow, selected, inputMode};
}

function taskStateLoaded (state, {payload: {dump}}) {
  const {arrow, selected, inputMode} = dump;
  return {...state, arrow, selected, inputMode};
}

export function run (container, options) {
  return algoreaReactTask(container, options, TaskBundle);
}
