import React from 'react';


export default class Titles extends React.PureComponent {
  render () {
    const {config, transformations} = this.props;
    const letters = [];
    const {x_pos, rect: {width}} = config;

    for (let i = 0; i < transformations.length; i++) {
      letters.push(<h4
        key={i}
        style={{width, left: `${x_pos[i + 2][0]}px`, position: 'absolute'}}
      >
        {transformations[i].name}
      </h4>);
    }
    const styles = {
      width,
      position: 'absolute',
      transform: 'translate(2px,-5px) rotate(-45deg)'
    };

    return (
      <div className="titles">
        <h4 style={{...styles, left: `${x_pos[1][0]}px`}}>Entrees</h4>
        {letters}
        <h4 style={{...styles, left: `${x_pos[x_pos.length - 1][0]}px`}}>Sorties</h4>
      </div>
    );
  }
}
