import React, { Component } from 'react';
import 'styles/pullout-menu.scss';
import PropTypes from 'prop-types';
class PulloutMenu extends Component {
  
  render() {
    return (
      <div onClick={this.props.pullIn} id="pulloutBg">
        <div id="pullout">
          {this.props.children}
        </div>
      </div>
    )
  }
}
PulloutMenu.propTypes = {
  pullIn: PropTypes.func,
  children: PropTypes.array
}
export default PulloutMenu;