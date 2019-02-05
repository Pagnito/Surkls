import React, { Component } from 'react';
import {PropTypes} from 'prop-types';
import 'styles/drop-menu.scss'
export default class DropMenu extends Component {
	render() {
		return (
			<div onClick={this.props.hideMenu} style={{display:this.props.visibility}} className="dropMenu">
				<div id={this.props.menuTypeArrow} className="lilArrow" />
				<div className="menuItems">
					<div style={{display: this.props.hideHeader ? 'none' : 'flex'}} className="menuHeader">
						<span className="menuTitle">{this.props.menuTitle}</span>
					</div>
						{this.props.children}
					</div>
			</div>
		);
	}
}
DropMenu.propTypes = {
	children: PropTypes.array,
	visibility: PropTypes.string,
	menuTitle: PropTypes.string,
	menuTypeArrow: PropTypes.string,
	hideMenu: PropTypes.func,
	hideHeader: PropTypes.bool
}