import React from 'react';
import {range} from 'range';

function makePermutationSvgCordinations (bits) {
  const rect_extra = 20, rect_width = 149;
  const xy_margin = 10;
  const circle_radius = 8;
  const input_spacing = circle_radius * 2 + 11;
  const input_connector_size = circle_radius + 5.5;

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

    if (x > 0 && x < input_x2) {
      return ['input', pos];
    } else if (x > outrput_x1) {
      return ['output', pos];
    }
    return null;
  }

  //generate perm lines
  function getPermLines (permutation) {
    const data = [];
    const sy = xy_margin + rect_extra;
    let connect_y = sy;
    for (let i = 0; i < permutation.length; i++) {
      data.push(<line
        key={i}
        x1={input_x2 + 1}
        y1={connect_y}
        x2={outrput_x1 - 1}
        y2={(permutation[i] * input_spacing) + sy} />);
      connect_y += input_spacing;
    }
    return data;
  }

  // svg width, height
  const total_height = (2 * xy_margin) + rect.height;
  const total_width = 2 + (4 * circle_radius) +
    (2 * input_connector_size) + rect_width;

  return {
    rect,
    connectors,
    circleInputs: inputs,
    circleOutputs: outputs,
    height: total_height,
    width: total_width,
    getCircle,
    getPermLines
  };
}

export default class PermutaionTool extends React.PureComponent {
  state = {
    select: {
      input: -1,
      output: -1,
    }
  };

  constructor (props) {
    super(props);
    this.config = makePermutationSvgCordinations(props.bits);
  }

  render () {
    const {rect, connectors, height, width, getPermLines} = this.config;
    let {circleInputs, circleOutputs} = this.config;

    const {select: {input, output}} = this.state;
    if (input !== -1) {
      circleInputs = [...circleInputs];
      circleInputs[input] = React.cloneElement(circleInputs[input], {className: 'circle_filled'});
    }
    if (output !== -1) {
      circleOutputs = [...circleOutputs];
      circleOutputs[output] = React.cloneElement(circleOutputs[output], {className: 'circle_filled'});
    }

    const perm_lines = getPermLines(this.props.data);

    return (
      <div className="permutaion_tool">
        <svg ref={this.toolSvg} onMouseDown={this.svgClicked} preserveAspectRatio="xMaxYMax" height={height} width={width} xmlns="http://www.w3.org/2000/svg">
          <rect {...rect} stroke="#000" fill="none" />
          <g className="connects_lines">{connectors}</g>
          <g>{circleInputs}</g>
          <g>{circleOutputs}</g>
          <g className="connects_lines">{perm_lines}</g>
        </svg>
      </div>
    );
  }


  componentDidUpdate () {
    const {select: {input, output}} = this.state;
    const {data, onDataChanged} = this.props;

    const isInput = input !== -1;
    const isOutput = output !== -1;
    if (isInput && isOutput) {
      [data[data.indexOf(output)], data[input]] = [data[input], data[data.indexOf(output)]];
      setTimeout(() => {
        this.setState(function () {
          return {
            select: {
              input: -1,
              output: -1,
            }
          };
        }, () => onDataChanged([...data]));
      }, 300);
    }
  }

  svgClicked = (event) => {
    const rect = this.svgRect.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    const circle = this.config.getCircle(x, y);
    if (circle) {
      this.setState(function ({select}) {
        select = {...select};
        if (select[circle[0]] === circle[1]) {
          select[circle[0]] = -1;
        } else {
          select[circle[0]] = circle[1];
        }
        return {select};
      });
    }
  }

  toolSvg = (element) => {
    this.svgRect = element;
  };
}

