
import React from 'react';
import {connect} from 'react-redux';

function WorkspaceSelector (state) {
  const {
    views: {Transformation},
  } = state;

  return {
    Transformation
  };
}

class Workspace extends React.PureComponent {
  render () {
    const {
      Transformation
    } = this.props;

    return (
      <div>
        <Transformation />
      </div>
    );
  }

}

export default {
  views: {
    Workspace: connect(WorkspaceSelector)(Workspace)
  }
};
