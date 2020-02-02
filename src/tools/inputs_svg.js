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

  const rect = {
    x: start,
    y: y_pos[0] - circle_radius,
    width: line_x1 - start + xy_margin,
    height: y_pos[bits - 1] - xy_margin,
    fill: 'transparent',
    stroke: 'none'
  };


  return {
    rect,
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
    let {inputCircles, paths, rect} = this.state.svgData;
    const {inputs, arrow} = this.props;

    inputCircles = [...inputCircles];
    paths = [...paths];

    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i] === 1 && arrow !== i) {
        inputCircles[i] = React.cloneElement(inputCircles[i], {className: 'highlighted'});
        paths[i] = React.cloneElement(paths[i], {className: 'highlighted'});
      }
    }

    if (arrow !== -1) {
      inputCircles[arrow] = React.cloneElement(inputCircles[arrow], {className: 'affected'});
      paths[arrow] = React.cloneElement(paths[arrow], {className: 'affected'});
    }

    return (
      <g>
        <g className="inputs">{inputCircles}</g>
        <g className="paths">{paths}</g>
        <rect {...rect} ref={this.toolSvg} onClick={this.svgClicked} />
      </g>
    );
  }

  svgClicked = (event) => {
    const rect = this.svgRect.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    const pos = this.props.config.getCircle(x, y);
    this.props.onInputChanged(pos);
  }

  toolSvg = (element) => {
    this.svgRect = element;
  };
}

