import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getUser, signUp, closeMenus } from 'actions/actions';
import 'styles/home.scss';
import 'styles/loader.scss';

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			userName: '',
			password: '',
			confirmPassword: '',
			registerMe: true,
      errors: {
				email: 'Email',
				userName: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm password'
      }
		};
	}

	handleInputs = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	closeMenus = () =>{
    if(this.props.app.menuState === 'open'){
      this.props.closeMenus({menu:'close-menus'});
    }	
	}
	handleSubmit = (e) =>{
		console.log(this.props)
		let errors = {};
		e.preventDefault();
		if(this.state.password!==this.state.confirmPassword && this.state.password.length<6){
			errors = {}
			document.getElementById('password').classList.add('errorColor');
			document.getElementById('cPassword').classList.add('errorColor');
			errors.password = 'Passwords must match'
			errors.confirmPassword = 'Passwords must match'
			this.setState({errors: errors,
										password: '',
										confirmPassword:''})
		} else if(this.state.email.length<5){
			errors = {}
			document.getElementById('regEmail').classList.add('errorColor');
			errors.email = "Email is required"
			this.setState({errors: errors,
										 email: ''})
		} else if(this.state.userName.length<3){
			errors = {}
			document.getElementById('regUsername').classList.add('errorColor');
			errors.userName = "Username must be at least 3 characters"
			this.setState({errors: errors,
										userName: ''})
		}  else  {	
			let user = {
				userName: this.state.userName,
				email: this.state.email,
				password: this.state.password,
			}
			this.props.signUp(JSON.stringify(user),()=>{
				this.props.history.push('/dashboard')
			});
		}	
	}
	toggleForm = () => {
		if (this.state.registerMe) {
			return (
				<form onSubmit={this.handleSubmit} className="form" id="registerForm">
					<input 
						id="regUsername"
            className="homeInput" 
            onChange={this.handleInputs} 
            name="userName" 
            value={this.state.userName}
						placeholder={this.state.errors.userName} 
            />
					<input 
						id="regEmail"
            className="homeInput" 
            onChange={this.handleInputs} 
            name="email" 
            value={this.state.email}
						placeholder={this.state.errors.email} 
            />
					<input
						id="password"
						className="homeInput"
						onChange={this.handleInputs}
						name="password"
            value={this.state.password}
            placeholder={this.state.errors.password}
            type="password"
					/>
					<input
						id="cPassword"
						className="homeInput"
						onChange={this.handleInputs}
						name="confirmPassword"
            value={this.state.confirmPassword}
            placeholder={this.state.errors.confirmPassword}
						type="password"	
					/>
					<button id="registerBtn">Submit</button>
				</form>
			);
		} else {
			return (
				<form className="form" id="loginForm">
          <input 
            className="homeInput" 
            onChange={this.handleInputs} 
            name="email" 
            value={this.state.email} 
            placeholder={this.state.errors.email} 
            />
					<input
						className="homeInput"
						onChange={this.handleInputs}
						name="password"
            value={this.state.password}
            type="password"
            placeholder={this.state.errors.password}
					/>
				</form>
			);
		}
	};
	render() {
		if(this.props.auth.user==null){
			return (
				<div id="spinnerWrap">
					<div className="spinner"></div>
				</div>		
			)
		} else  {
			return( 
				<div onClick={this.closeMenus} id="home">
					<div id="overlay"></div>
					<div id="registerTitle">Start Your Surkle!</div>
					<div id="loginStrategies">
						<a href="/auth/twitch" className="loginStrat" id="twitchStrat"></a>
						<a href="/auth/twitter" className="loginStrat" id="twitterStrat"></a>
						<a href="/auth/google" className="loginStrat" id="googleStrat"></a>
					</div>
					{this.toggleForm()}
				</div>
			)
		}	
	}
}
Home.propTypes = {
	auth: PropTypes.object,
	getUser: PropTypes.func,
	signUp: PropTypes.func,
	history: PropTypes.object,
	closeMenus: PropTypes.func,
	app: PropTypes.object
};
function stateToProps(state) {
	return {
		auth: state.auth,
		app: state.app
	};
}

export default connect(stateToProps, { getUser, signUp, closeMenus })(Home);
