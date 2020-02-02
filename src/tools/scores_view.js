import React from 'react';

export default class ScoresView extends React.PureComponent {
  render () {
    const {scores, config} = this.props;
    const {y_pos, xy_margin, width} = config;
    const text = [];
    for (let i = 0; i < scores.length; i++) {
      text.push(<text
        key={i}
        x={width - xy_margin - 10}
        y={y_pos[i] + 6}
        fontSize="15px"
        textAnchor="middle">
        {scores[i]}
      </text >);
    }

    return (
      <g>
        {text}
      </g>
    );
  }
}