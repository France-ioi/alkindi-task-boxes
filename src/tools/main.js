import React from 'react';
import ArrowSvg from './arrow_svg';
import InputsSvg from './inputs_svg';
import OutputsSvg from './outputs_svg';
import TransformationSvg from './transformation_svg';
import ScoresView from './scores_view';
import Titles from './titles_view';
import ModeSwitchView from './mode_switch_view';

function makeSvgConfg (bits, numTransforms) {
  const rect_extra = 20, rect_width = 50;
  const xy_margin = 10;
  const box_extra = 4;
  const circle_radius = 8;
  const input_spacing = circle_radius * 2 + 11;
  const space_transform = 14;
  const width_input = 35;
  const width_arrow = 30;
  const width_score = 30;


  // rect
  const rect = {
    y: xy_margin,
    width: rect_width,
    height: (2 * rect_extra) + (input_spacing * (bits - 1))
  };

  const transformation_width = space_transform + rect_width;
  const x_pos = [];
  let x = width_arrow + xy_margin;
  x_pos.push([0, x]);
  x_pos.push([x, x + width_input + xy_margin]);
  x += width_input + xy_margin;

  for (let i = 0; i < numTransforms; i++) {
    x_pos.push([x, x + transformation_width]);
    x += transformation_width;
  }
  x_pos.push([x, x + width_input - space_transform + xy_margin]);


  // svg width, height
  const total_height = (2 * xy_margin) + rect.height;
  const total_width = (2 * xy_margin) + x + width_input - space_transform + width_score;

  let connect_y = xy_margin + rect_extra;

  const y_pos = [];

  for (let i = 0; i < bits; i++) {
    y_pos.push(connect_y);
    connect_y += input_spacing;
  }

  const box_height = (2 * box_extra) + (2 * input_spacing);
  const box_width = rect_width - (2 * box_extra);

  const box_rects = [];
  for (let i = 0; i < bits; i = i + 3) {
    box_rects.push({
      y: y_pos[i] - box_extra,
      width: box_width,
      height: box_height,
    });
  }

  //clicked circle detect
  function getCircle (x, y) {
    return parseInt(y / input_spacing);
  }

  return {
    rect,
    bits,
    rect_extra,
    rect_width,
    xy_margin,
    width_score,
    circle_radius,
    space_transform,
    box_extra,
    box_rects,
    x_pos,
    y_pos,
    height: total_height,
    width: total_width,
    getCircle
  };
}

export function MainSelector (state) {
  const {
    taskData: {bits},
    scores,
    totalScore,
    transformations,
    permutation,
    highlights,
    boxes,
    arrow,
    inputs,
    affected,
    outputs,
    outputAffected,
    inputMode,
    selected,
    actions: {
      transformSelectedChanged,
      transformInputChanged,
      transformArrowSelected,
      transformInputModeChanged
    }
  } = state;

  return {
    bits,
    scores,
    totalScore,
    transformations,
    permutation,
    highlights,
    boxes,
    arrow,
    inputs,
    affected,
    outputs,
    outputAffected,
    selected,
    inputMode,
    transformInputModeChanged,
    transformSelectedChanged,
    transformInputChanged,
    transformArrowSelected,
  };
}


export class MainView extends React.Component {

  constructor (props) {
    super(props);
    const {
      bits,
      transformations,
    } = props;

    this.state = {
      config: makeSvgConfg(bits, transformations.length)
    };
  }

  render () {
    const {
      transformations,
      permutation,
      highlights,
      affected,
      outputAffected,
      inputMode,
      boxes,
      arrow,
      inputs,
      outputs,
      selected,
      scores,
      totalScore,
    } = this.props;

    const transformationData = [];
    for (let i = 0; i < transformations.length; i++) {
      let data = null;
      if (transformations[i].type === 'permutation') {
        data = permutation[i];
      } else {
        data = boxes[i];
      }

      transformationData.push({
        ...transformations[i],
        data,
      });
    }

    const {config} = this.state;
    const {width, height} = config;

    return (
      <div className="main">
        <div id="main_svg_wrapper" style={{width}}>
          <Titles config={config} transformations={transformations} />
          <svg width={width} height={height}>
            <ArrowSvg config={config} selectedIndex={arrow} onArrowSelected={this.onArrowSelected} />
            <InputsSvg config={config} arrow={arrow} inputs={inputs} onInputChanged={this.onInputChanged} />
            {
              transformationData.map(({type, data}, index) => {
                const propData = {
                  key: index,
                  index,
                  type,
                  highlights,
                  affected,
                  selected: selected === index,
                  data: data,
                  config: this.state.config,
                  onSelectedChanged: this.onSelectedChanged
                };

                return <TransformationSvg  {...propData} />;
              })
            }
            <OutputsSvg config={config} affected={outputAffected} outputs={outputs} />
            <ScoresView config={config} scores={scores} />
          </svg>
          <div className="total_score">
            <h5>{`Total : ${totalScore}`}</h5>
          </div>
        </div>
        <ModeSwitchView mode={inputMode} onModeChanged={this.onModeChanged} />
      </div>
    );
  }

  onModeChanged = (mode) => {
    const {dispatch, transformInputModeChanged} = this.props;
    dispatch({type: transformInputModeChanged, mode});
  }

  onArrowSelected = (index) => {
    const {dispatch, transformArrowSelected} = this.props;
    dispatch({type: transformArrowSelected, index});
  }

  onSelectedChanged = (index) => {
    const {dispatch, transformSelectedChanged} = this.props;
    dispatch({type: transformSelectedChanged, index});
  }

  onInputChanged = (position) => {
    const {dispatch, transformInputChanged} = this.props;
    dispatch({type: transformInputChanged, position});
  }
}