import React from 'react';

function makeSvg (config) {

  const {
    xy_margin,
    x_pos,
    y_pos,
    height
  } = config;

  const [, end] = x_pos[0];
  const y = y_pos[0];

  const line = {
    x1: xy_margin,
    y1: y,
    x2: end - 20,
    y2: y
  };


  return {
    width: end,
    height,
    line
  };
}

export default class ArrowSvg extends React.PureComponent {

  constructor (props) {
    super(props);
    const {config} = this.props;
    this.state = {
      svgData: makeSvg(config)
    };
  }

  render () {
    const {line} = this.state.svgData;
    return (
      <g className="arrow_svg" >
        <defs>
          <marker id="arrow"
            markerWidth="4"
            markerHeight="4"
            refX="0"
            refY="1.5"
            orient="auto"
            markerUnits="strokeWidth">
            <path d="M0,0 L0,3 L4.5,1.5 z" fill="orange" />
          </marker>
        </defs>
        <line {...line} stroke="orange"
          strokeWidth="3"
          markerEnd="url(#arrow)" />
      </g>
    );
  }
}

