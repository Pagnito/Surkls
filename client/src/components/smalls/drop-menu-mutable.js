import React, { Component } from 'react';
import {PropTypes} from 'prop-types';
import 'styles/drop-menu-mutable.scss'
export default class DropMenu extends Component {
	render() {
		return (
			<div style={{display:this.props.visibility}} className="dropMenu_mutable">
				<div id={this.props.menuTypeArrow} className="lilArrow_mutable" />
				<div className="menuItems_mutable">
					<div style={{display: this.props.hideHeader ? 'none' : 'flex'}} className="menuHeader_mutable">
						<span className="menuTitle_mutable">{this.props.menuTitle}</span>
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