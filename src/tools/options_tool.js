import React from 'react';
import PermutaionTool from './permutaion_tool';
import BoxesTool from './boxes_tool';

export function OptionsToolSelector (state) {
  const {taskData: {bits}} = state;
  const type = 'permutation';
  return {
    bits,
    type,
  };
}

export class OptionsToolView extends React.Component {
  render () {
    const {bits, type} = this.props;
    return (
      <div className="options_tool">
        {
          type === 'permutation' ?
            <PermutaionTool bits={bits} />
            : <BoxesTool />
        }
      </div>
    );
  }
}