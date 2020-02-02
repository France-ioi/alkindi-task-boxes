import React from 'react';
import PermutaionTool from './permutaion';
import BoxesTool from './boxes';

export function OptionsToolSelector (state) {
  const {taskData: {bits}, actions: {transformDataChanged},
    transformations, selected, permutation, boxes, lockedInputs,
    lockedOutputs} = state;

  const {type} = transformations[selected];
  let data = null;

  if (type === 'permutation') {
    data = permutation[selected];
  } else {
    data = boxes;
  }

  return {
    bits,
    type,
    data,
    lockedInputs,
    lockedOutputs,
    transformDataChanged,
  };
}

export class OptionsToolView extends React.Component {
  render () {
    const {bits, type, data, lockedInputs, lockedOutputs} = this.props;
    return (
      <div className="options_tool">
        {
          type === 'permutation' ?
            <PermutaionTool data={data} lockedInputs={lockedInputs} lockedOutputs={lockedOutputs} onDataChanged={this.onDataChanged} bits={bits} />
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