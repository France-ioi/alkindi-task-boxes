import React from 'react';
import {connect} from 'react-redux';

// import {} from './utils';

function appInitReducer (state, _action) {
  return {
    ...state,
  };
}

function taskInitReducer (state) {
  let {cipheredText} = state;
  if (!cipheredText) {
    return state;
  }
  return {...state};
}

function taskRefreshReducer (state) {
  let {cipheredText} = state;
  if (!cipheredText) {
    return state;
  }
 return {...state};
}


function TransformationViewSelector (state) {
  const {actions, cipheredText} = state;
  const {cipheredTextResized, cipheredTextScrolled} = actions;
  const {width, height, cellWidth, cellHeight, bottom, pageRows, pageColumns, visible, scrollTop} = cipheredText;
  return {
    cipheredTextResized, cipheredTextScrolled,
    width, height, visibleRows: visible.rows, cellWidth, cellHeight, bottom, pageRows, pageColumns, scrollTop
  };
}


// {columns.map(({index, cell, colorClass, borderClass}) =>
//                 <span key={index} className={`${getClassNames(colorClass, borderClass)}`} style={{position: 'absolute', left: `${index * cellWidth}px`, width: `${cellWidth}px`, height: `${cellHeight}px`/*, backgroundColor: color || "#fff"*/}}>
//                   {cell || ' '}
//                 </span>)}

class TransformationView extends React.PureComponent {
  constructor (props) {
    super(props);
    this.rowCells = {};
  }

  render () {
    const {width, height, visibleRows, cellWidth, cellHeight, bottom} = this.props;
    const rowRef = {}, rowCells = this.rowCells;
    const rowData = (visibleRows || []).map(({index, columns}) => {
      let data = null;
      if (rowCells[index] === undefined) {
        data = (
          <div key={index} style={{position: 'absolute', top: `${index * cellHeight}px`, textAlign: 'center', padding: '4px'}}>
            {columns.map(({index: index2, cell, colorClass, borderClass}) =>
            <DotGrid key={index2} name={`${index}_${index2}`} className={`${getClassNames(colorClass, borderClass)}`} style={{position: 'absolute', left: `${index2 * cellWidth}px`, width: `${cellWidth}px`, height: `${cellHeight}px`}} />
            )}
          </div>
        );
      } else {
        data = rowCells[index];
      }
      rowRef[index] = data;
      return data;
    });
    this.rowCells = rowRef;

    return (
      <div>
        <svg display="none">
          <symbol id="dot1"><circle cx="2" cy="2" r="2" fill="inherit" /></symbol>
          <symbol id="dot2"><circle cx="7" cy="2" r="2" fill="inherit" /></symbol>
          <symbol id="dot3"><circle cx="12" cy="2" r="2" fill="inherit" /></symbol>
          <symbol id="dot4"><circle cx="2" cy="6" r="2" fill="inherit" /></symbol>
          <symbol id="dot5"><circle cx="7" cy="6" r="2" fill="inherit" /></symbol>
          <symbol id="dot6"><circle cx="12" cy="6" r="2" fill="inherit" /></symbol>
          <symbol id="dot7"><circle cx="2" cy="10" r="2" fill="inherit" /></symbol>
          <symbol id="dot8"><circle cx="7" cy="10" r="2" fill="inherit" /></symbol>
          <symbol id="dot9"><circle cx="12" cy="10" r="2" fill="inherit" /></symbol>
          <symbol id="dot10"><circle cx="2" cy="14" r="2" fill="inherit" /></symbol>
          <symbol id="dot11"><circle cx="7" cy="14" r="2" fill="inherit" /></symbol>
          <symbol id="dot12"><circle cx="12" cy="14" r="2" fill="inherit" /></symbol>
        </svg>
        <div ref={this.refTextBox} onScroll={this.onScroll} style={{position: 'relative', width: width && `${width}px`, height: height && `${height}px`, overflowY: 'scroll'}}>
          {rowData}
          <div style={{position: 'absolute', top: `${bottom}px`, width: '1px', height: '1px'}} />
        </div>
      </div>
    );
  }
  refTextBox = (element) => {
    this._textBox = element;
    const width = element.clientWidth;
    const height = element.clientHeight;
    this.props.dispatch({type: this.props.cipheredTextResized, payload: {width, height}});
  };
  onScroll = () => {
    const scrollTop = this._textBox.scrollTop;
    this.props.dispatch({type: this.props.cipheredTextScrolled, payload: {scrollTop}});
  };
  componentDidUpdate () {
    this._textBox.scrollTop = this.props.scrollTop;
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
    Transformation: connect(TransformationViewSelector)(TransformationView),
  }
};
