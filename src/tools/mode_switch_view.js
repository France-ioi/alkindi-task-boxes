import React from 'react';
import {Radio, FormGroup} from 'react-bootstrap';


export default class ModeSwitchView extends React.PureComponent {
  render () {
    const {mode} = this.props;
    return (
      <div className="mode_radio">
        <FormGroup>
          <Radio inline name="mode" onChange={this.onChange} checked={"manual" === mode} value="manual">Manual</Radio>
          <Radio style={{marginLeft: '50px'}} inline name="mode" onChange={this.onChange} checked={"auto" === mode} value="auto">Auto</Radio>
        </FormGroup>
      </div>
    );
  }

  onChange = (e) => {
    const {onModeChanged} = this.props;
    onModeChanged(e.target.value);
  }
}

