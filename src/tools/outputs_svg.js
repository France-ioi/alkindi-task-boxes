import React from 'react';
import classnames from 'classnames';

function makeSvg (config) {

  const {
    bits,
    xy_margin,
    circle_radius,
    x_pos,
    y_pos,
  } = config;

  const outputCircles = [];
  const paths = [];

  const [line_x1, end] = x_pos[x_pos.length - 1];
  const x_circle = end - (xy_margin + circle_radius);
  const line_x2 = x_circle - circle_radius;

  for (let i = 0; i < bits; i++) {
    const connect_y = y_pos[i];

    outputCircles.push(<circle
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
    outputCircles,
    paths
  };
}

export default class OutputsSvg extends React.PureComponent {

  constructor (props) {
    super(props);
    const {config} = this.props;
    this.state = {
      svgData: makeSvg(config)
    };
  }

  render () {
    let {outputCircles, paths} = this.state.svgData;
    const {outputs, affected} = this.props;


    outputCircles = [...outputCircles];
    paths = [...paths];

    for (let i = 0; i < outputs.length; i++) {
      const classes = classnames({
        highlighted: outputs[i] === 1,
        affected: affected[i] === 1
      });
      if (classes) {
        outputCircles[i] = React.cloneElement(outputCircles[i], {className: classes});
        paths[i] = React.cloneElement(paths[i], {className: classes});
      }
    }

    return (
      <g>
        <g className="paths">{paths}</g>
        <g className="outputs">{outputCircles}</g>
      </g>
    );
  }
}

