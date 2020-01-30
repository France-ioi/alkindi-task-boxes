import React from 'react';
import {range} from 'range';
import update from 'immutability-helper';


function makeBoxSvgs (bits) {
  const rect_extra = 10, rect_width = 40;
  const xy_margin = 5;
  const circle_radius = 7;
  const input_spacing = circle_radius * 2 + 4;
  const input_connector_size = circle_radius + 2.5;

  // rect
  const rect = {
    x: 4 + (2 * circle_radius) + input_connector_size,
    y: xy_margin,
    width: rect_width,
    height: (2 * rect_extra) + (input_spacing * (bits - 1))
  };

  // circle and rect connectors
  const connectors = [];
  const inputs = [];
  const outputs = [];
  const input_x1 = rect.x - input_connector_size;
  const input_x2 = rect.x;
  const outrput_x1 = rect.x + rect_width;
  const outrput_x2 = outrput_x1 + input_connector_size;
  const input_cx = input_x1 - circle_radius;
  const output_cx = outrput_x2 + circle_radius;

  let connect_y = xy_margin + rect_extra;

  for (let i = 0; i < bits; i++) {

    // input
    inputs.push(<circle
      key={i}
      cx={input_cx}
      cy={connect_y}
      r={circle_radius} />);

    connectors.push(<line
      key={i}
      x1={input_x1}
      y1={connect_y}
      x2={input_x2}
      y2={connect_y} />);


    //output
    outputs.push(<circle
      key={i}
      cx={output_cx}
      cy={connect_y}
      r={circle_radius} />);

    connectors.push(<line
      key={i + bits}
      x1={outrput_x1}
      y1={connect_y}
      x2={outrput_x2}
      y2={connect_y} />);

    connect_y += input_spacing;
  }

  //clicked circle detect
  function getCircle (x, y) {
    const sy = xy_margin + rect_extra - circle_radius;
    if (y < sy) {
      return null;
    }
    const pos = parseInt((y - sy) / input_spacing);
    if (x > outrput_x1) {
      return pos;
    }
    return null;
  }

  // svg width, height
  const total_height = (2 * xy_margin) + rect.height;
  const total_width = (2 * xy_margin) + (4 * circle_radius) +
    (2 * input_connector_size) + rect_width;

  return {
    rect,
    connectors,
    circleInputs: inputs,
    circleOutputs: outputs,
    height: total_height,
    width: total_width,
    getCircle,
  };

}


class Box extends React.PureComponent {
  render () {
    const {input, output, config} = this.props;
    const {rect, connectors, height, width} = config;
    let {circleInputs, circleOutputs} = config;

    if (output !== 0) {
      circleOutputs = [...circleOutputs];
      for (let i = 0; i < 3; i++) {
        if ((output & 1 << i) !== 0) {
          circleOutputs[i] = React.cloneElement(circleOutputs[i], {className: 'circle_filled'});
        }
      }
    }
    if (input !== 0) {
      circleInputs = [...circleInputs];
      for (let i = 0; i < 3; i++) {
        if ((input & 1 << i) !== 0) {
          circleInputs[i] = React.cloneElement(circleInputs[i], {className: 'circle_filled'});
        }
      }
    }

    return <div className="box_item">
      <svg ref={this.toolSvg} onMouseDown={this.svgClicked} preserveAspectRatio="xMaxYMax" height={height} width={width} xmlns="http://www.w3.org/2000/svg">
        <rect {...rect} />
        <g className="connects_lines">{connectors}</g>
        <g>{circleInputs}</g>
        <g>{circleOutputs}</g>
      </svg>
    </div>;
  }

  svgClicked = (event) => {
    const rect = this.svgRect.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    const circle = this.props.config.getCircle(x, y);
    if (circle !== null) {
      const {input, output, onUpdate} = this.props;
      onUpdate([input, output ^ (1 << circle)]);
    }
  }

  toolSvg = (element) => {
    this.svgRect = element;
  };
}

export default class BoxesTool extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      data: props.data || range(0, 8).map(v => [v, 0])
    };

    this.config = makeBoxSvgs(3);
  }

  render () {
    const {data} = this.state;
    return (
      <div>
        {
          data.map(([input, output], i) =>
            <Box key={i} input={input} output={output} config={this.config} onUpdate={this.onBoxUpdate} />
          )
        }
      </div>
    );
  }

  onBoxUpdate = ([input, output]) => {
    this.setState(function (state) {
      return update(state, {data: {$splice: [[input, 1, [input, output]]]}});
    });
  }
}
