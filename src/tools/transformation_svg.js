import React from 'react';
import classnames from 'classnames';


function makePermutationLines ({config, index, data, highlights, affected}) {
  const dataLines = [];
  const {
    rect,
    x_pos,
    y_pos,
  } = config;

  const highlight = highlights[index];
  const affect = affected[index];

  const [start, end] = x_pos[index + 2];
  const x1 = start + 1;
  const x2 = x1 + rect.width - 2;
  const x3 = end;

  for (let i = 0; i < y_pos.length; i++) {
    const y1 = y_pos[i];
    const y2 = y_pos[data[i]];
    const y3 = y2;

    const classes = classnames({
      highlighted: highlight[i] === 1,
      affected: affect[i] === 1
    });

    dataLines.push(<path
      className={classes}
      key={i}
      d={`M ${x1 - 1} ${y1} L ${x1} ${y1}  L ${x2} ${y2} L ${x3} ${y3} `}
    />);
  }

  return dataLines;
}

function makeBoxesLines ({config, index, highlights, affected}) {
  const {
    bits,
    box_extra,
    x_pos,
    y_pos,
  } = config;

  const [inputHighlight, outputHighlight] = highlights[index];
  const [inputAffected, outputAffected] = affected[index];
  const [start, end] = x_pos[index + 2];
  const input_x1 = start;
  const input_x2 = start + box_extra + 1;

  const output_x2 = end;
  const output_x1 = input_x2 + 10;

  const dataLines = new Array(2 * bits);

  for (let i = 0; i < bits; i++) {
    const connect_y = y_pos[i];

    dataLines[i] = <line
      key={i}
      className={classnames({
        highlighted: inputHighlight[i] === 1,
        affected: inputAffected[i] === 1
      })}
      x1={input_x1}
      y1={connect_y}
      x2={input_x2}
      y2={connect_y} />;

    dataLines[i + bits] = <line
      key={i + bits}
      className={classnames({
        highlighted: outputHighlight[i] === 1,
        affected: outputAffected[i] === 1
      })}
      x1={output_x1}
      y1={connect_y}
      x2={output_x2}
      y2={connect_y} />;
  }

  return dataLines;
}

function makeSvg (config, index, type) {

  const {
    box_extra,
    box_rects,
    x_pos,
  } = config;

  let {
    rect
  } = config;

  const [start] = x_pos[index + 2];

  rect = {...rect, x: start};

  let boxesSvgs = null;
  if (type !== 'permutation') {
    boxesSvgs = [];
    for (let i = 0; i < box_rects.length; i++) {
      boxesSvgs.push(<rect
        key={i}
        className="boxes_rect"
        x={start + box_extra}
        {...box_rects[i]}
      />);
    }
  }

  return {
    rect,
    boxesSvgs,
  };
}

export default class TransformationSvg extends React.PureComponent {

  constructor (props) {
    super(props);
    const {config, index, type} = this.props;
    this.index = index;
    this.type = type;
    this.state = {
      svgData: makeSvg(config, index, type),
    };
  }


  render () {
    let {rect, boxesSvgs} = this.state.svgData;
    const {type, selected} = this.props;

    let dataLines = null;
    if (type === 'permutation') {
      dataLines = makePermutationLines(this.props);
    } else {
      dataLines = makeBoxesLines(this.props);
    }


    return (
      <g>
        <g className="paths">{dataLines}</g>
        {boxesSvgs}
        <rect
          className={classnames("main_rect", selected && 'selected')}
          {...rect}
          pointerEvents="visible"
          onClick={this.onClicked}
        />
      </g>
    );
  }

  onClicked = () => {
    const {index, onSelectedChanged} = this.props;
    onSelectedChanged(index);
  }

  componentDidUpdate () {
    // update svg data when props changes, if changes
    this.setState((state) => {
      const {config, index, type} = this.props;
      if (this.index !== index || this.type !== type) {
        this.index = index;
        this.type = type;
        return {
          svgData: makeSvg(config, index, type),
        };
      }
      return state;
    });
  }
}

