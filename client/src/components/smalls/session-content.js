import React, { Component } from 'react';
import PropTypes from 'prop-types';
class SessionContent extends Component {
  render() {
    return (
      <div id="discContent">
        <div id="discContentHeader">
          <div className="discHeaderIcon"></div>
          <div className="discHeaderIcon"></div>
          <div className="discHeaderSearch">
            <div className="discSearchIcon"></div>
            <input id={this.props.searchType} className="searchBar" name="search" value={this.state.search} onChange={this.handleInput} />
          </div>
        </div>
      </div>
    )
  }
}

export default SessionContent;