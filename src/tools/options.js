import React from 'react';
import PermutaionTool from './permutaion';
import BoxesTool from './boxes';

export function OptionsToolSelector (state) {
  const {taskData: {bits}, actions: {transformDataChanged},
  transformations, selected, permutation, boxes} = state;

  const {type} = transformations[selected];
  let data = null;

  if (type === 'permutation') {
    data = permutation[selected];
  } else {
    data = boxes[selected];
  }

  return {
    bits,
    type,
    data,
    transformDataChanged
  };
}

export class OptionsToolView extends React.Component {
  render () {
    const {bits, type, data} = this.props;
    return (
      <div className="options_tool">
        {
          type === 'permutation' ?
            <PermutaionTool data={data} onDataChanged={this.onDataChanged} bits={bits} />
            : <BoxesTool data={data} onDataChanged={this.onDataChanged} />
        }
      </div>
    );
  }

  onDataChanged = (data) => {
    const {dispatch, type, transformDataChanged} = this.props;
    dispatch({type: transformDataChanged, option_type: type, data});
  }
}