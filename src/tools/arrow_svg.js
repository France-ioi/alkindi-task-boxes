import React from 'react';

function makeSvg (config) {

  const {
    xy_margin,
    x_pos,
    y_pos,
    circle_radius,
    bits,
    height
  } = config;

  const [start, end] = x_pos[0];
  const lines = [];

  for (let i = 0; i < y_pos.length; i++) {
    const y = y_pos[i];
    lines.push(<line
      key={i}
      x1={xy_margin}
      y1={y}
      x2={end - 20}
      y2={y} stroke="#fa620a"
      strokeWidth="3"
      markerEnd="url(#arrow)" />);
  }

  const rect = {
    x: start,
    y: y_pos[0] - circle_radius,
    width: end - start,
    height: y_pos[bits - 1] - xy_margin,
    fill: 'transparent',
    stroke: 'none',
  };

  return {
    width: end,
    height,
    lines,
    rect
  };
}

export default class ArrowSvg extends React.PureComponent {

  constructor (props) {
    super(props);
    const {config} = this.props;
    this.state = {
      svgData: makeSvg(config),
      hoverIndex: -1
    };
  }

  render () {
    let {lines, rect} = this.state.svgData;
    const {hoverIndex} = this.state;
    const {selectedIndex} = this.props;

    lines = [...lines];
    if (hoverIndex !== -1 && hoverIndex !== selectedIndex) {
      for (let i = 0; i < lines.length; i++) {
        if (i === hoverIndex) {
          lines[i] = React.cloneElement(lines[i], {className: 'hover'});
        }
      }
    }

    if (selectedIndex !== -1) {
      lines[selectedIndex] = React.cloneElement(lines[selectedIndex], {className: 'selected'});
    }

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
            <path d="M0,0 L0,3 L4.5,1.5 z" fill="#fa620a" />
          </marker>
        </defs>
        {lines}
        <rect {...rect} ref={this.toolSvg} onMouseOut={this.onMouseOut} onMouseMove={this.onMouseOver} onClick={this.svgClicked} pointerEvents="visible" />
      </g>
    );
  }


  svgClicked = (event) => {
    const rect = this.svgRect.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    const pos = this.props.config.getCircle(x, y);
    this.props.onArrowSelected(Math.abs(pos));
  }

  toolSvg = (element) => {
    this.svgRect = element;
  };

  onMouseOver = (event) => {
    const rect = this.svgRect.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    const pos = this.props.config.getCircle(x, y);
    this.setState({hoverIndex: Math.abs(pos)});
  }

  onMouseOut = () => {
    this.setState({hoverIndex: -1});
  }

}

