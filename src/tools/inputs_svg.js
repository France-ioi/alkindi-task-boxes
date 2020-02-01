import React from 'react';

function makeSvg (config) {

  const {
    bits,
    xy_margin,
    circle_radius,
    x_pos,
    y_pos,
  } = config;

  const inputCircles = [];
  const paths = [];

  const [start, line_x2] = x_pos[1];
  const x_circle = start + xy_margin + circle_radius;
  const line_x1 = x_circle + circle_radius;

  for (let i = 0; i < bits; i++) {
    const connect_y = y_pos[i];

    inputCircles.push(<circle
      key={i}
      cx={x_circle}
      cy={connect_y}
      r={circle_radius} />);

    paths.push(<line
      key={i}
      x1={line_x1}
      y1={connect_y}
      x2={line_x2}
      y2={connect_y} />);
  }


    return {
      inputCircles,
      paths
    };
}

export default class InputsSvg extends React.PureComponent {

  constructor (props) {
    super(props);
    const {config} = this.props;
    this.state = {
      svgData: makeSvg(config)
    };
  }

  render () {
    const {inputCircles, paths} = this.state.svgData;
    return (
      <g>
        <g>{inputCircles}</g>
        <g className="paths">{paths}</g>
      </g>
    );
  }
}

