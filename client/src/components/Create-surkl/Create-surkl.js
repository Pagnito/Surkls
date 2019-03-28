import React, { Component } from 'react';
import {connect} from 'react-redux';
import {newSurkl} from 'actions/surkl-actions';
import PropTypes from 'prop-types';
import './create-surkl.scss';
class CreateSurkl extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			motto: '',
			category: '',
			image_file: '',
			name_placeholder: '',
			phase: 'name',
			errors: {
				name: 'Max 25 characters',
				motto: 'Max 60 characters'
			}
		};
		this.categoriesArr = [
			'Art',
			'Anime',
			'Business',
			'Cars',
			'Code',
			'Entrepreneurship',
			'Entertainment',
			'Fashion',
			'Gaming',
			'Health',
			'Music',
			'Nature',
			'Politics',
			'Sports',
			'Spirituality',
			'Travel',
			'Technology'
		];
		this.socket = this.props.socket;
		this.mottoPlaceholder = [ 'P', 'i', 'c', 'k', ' ', 'a', ' ', 'm', 'o', 't', 't', 'o' ];
		this.namePlaceholder = [ 'N', 'a', 'm', 'e', ' ', 'Y', 'o', 'u', 'r', ' ', 'S', 'u', 'r', 'k', 'l' ];
	}
	componentDidMount() {
		this.animatePlaceholder(this.namePlaceholder, document.getElementById('nameYourSurkl'), 15);
	}
	componentDidUpdate(/* prevProps, prevState */) {
		if (this.state.phase === 'motto') {
			this.animatePlaceholder(this.mottoPlaceholder, document.getElementById('pickMotto'), 12);
		}
		if (this.state.phase === 'name') {
			this.animatePlaceholder(this.namePlaceholder, document.getElementById('nameYourSurkl'), 15);
		}
	}
	onInput = (e) => {
		this.setState({ [e.target.name]: e.target.value });

		if (e.target.value.length > 17) {
			e.target.style.fontSize = '70px';
			e.target.style.marginTop = '100px';
			e.target.style.height = '90px';
		} else if (e.target.value.length < 17) {
			e.target.style.fontSize = '90px';
			e.target.style.marginTop = '70px';
			e.target.style.height = '120px';
		}
		if (e.target.value.length > 26) {
			e.target.style.fontSize = '40px';
			e.target.style.marginTop = '130px';
			e.target.style.height = '60px';
		}
		if (e.target.value.length > 45) {
			e.target.style.fontSize = '30px';
			e.target.style.marginTop = '140px';
			e.target.style.height = '50px';
		}
	};
	animatePlaceholder = (phrase, element, length) => {
		let phraseStr = '';
		let i = 0;
		if (element !== null && element !== undefined && element.placeholder.length === 0) {
			setTimeout(() => {
				let int = setInterval(() => {
					phraseStr += phrase[i];
					element.placeholder = phraseStr;
					i++;
					if (i === length) {
						clearInterval(int);
					}
				}, 100);
			}, 600);
		}
	};
	arrows = (prevPhase, nextPhase, current, text) => {
		return (
			<div className="create-surkl-arrows">
				<div
					onClick={() => this.setState({ phase: prevPhase })}
					className="create-surkl-left-arrow create-surkl-arrow"
				/>

				<div onClick={()=>this.nextPhase(nextPhase, current, text)}
        className="create-surkl-right-arrow create-surkl-arrow"></div>
			</div>
		);
  };
  nextPhase = (nextPhase, current, text) =>{
		let me = this.props.auth.user;
		let mySurkl = me.mySurkl
    let errors = JSON.parse(JSON.stringify(this.state.errors));
    if(current==='motto'){
      let newSurkl = {
        name:this.state.name,
        motto:this.state.motto,
        category: this.state.category,
				admin: me._id,
				admin_name: me._userName
      }
      if(mySurkl){
        errors.alreadyCreated = 'You can only create one Surkl. Get to know your Surkl'
        this.setState({errors: errors})
      } else {
        this.props.newSurkl(JSON.stringify(newSurkl), (surkl)=>{
					surkl.surkl_id = surkl._id
					this.socket.emit('created-surkl', surkl)
          this.props.history.push('/surkl/'+surkl._id)
        })
      }  
    }
    if(text.length>=3) {
      this.setState({phase:nextPhase})
    }
  }
	nameYourSurkl = () => {
		return (
			<div className="name-your-surkl">
				<input
					autoComplete="off"
					maxLength="25"
					name="name"
					value={this.state.name}
					onChange={this.onInput}
					id="nameYourSurkl"
					className="name-your-surkl-input"
				/>
				{this.arrows('name', 'category', 'name', this.state.name)}
			</div>
		);
	};

	categories = () => {
		let scope = this;
		function pickCat(el, cat) {
			let unpicked = document.getElementsByClassName('create-surkl-category');
			for (let un of unpicked) {
				un.style.color = 'black';
				un.style.background = '#F6C641';
			}
			let elem = document.getElementById(el);
			elem.style.color = '#F6C641';
			elem.style.background = 'black';
			scope.setState({ category: cat.toLowerCase() });
		}
		function categs(cats) {
			return cats.map((cat, ind) => {
				let ani = {
					animation: 'scaleUp .3s ease-out forwards',
					animationDelay: Math.floor(Math.random() * 1500) + 1 + 'ms',
					color: scope.state.category === cat.toLowerCase() ? '#F6C641' : 'black',
					background: scope.state.category === cat.toLowerCase() ? 'black' : '#F6C641'
				};
				return (
					<div
						onClick={() => pickCat('cat' + ind, cat)}
						id={'cat' + ind}
						key={ind}
						style={ani}
						className="create-surkl-category"
					>
						{cat}
					</div>
				);
			});
		}
		return (
			<div className="create-surkl-categories-wrap">
				<div className="create-surkl-categories">{categs(this.categoriesArr)}</div>
				{this.arrows('name', 'motto', 'category', this.state.category)}
			</div>
		);
	};
	pickMotto = () => {
		return (
			<div className="create-surkl-motto">
				<input
					maxLength="60"
					name="motto"
					value={this.state.motto}
					onChange={this.onInput}
					id="pickMotto"
					className="pick-motto-input"
				/>
				{this.arrows('category', 'motto', 'motto', this.state.motto)}
			</div>
		);
	};

	phase = () => {
		if (this.state.phase === 'name') {
			return this.nameYourSurkl();
		} else if (this.state.phase === 'category') {
			return this.categories();
		} else if (this.state.phase === 'motto') {
			return this.pickMotto();
		}
	};

	render() {
    if(this.props.auth.user){
      if(this.props.auth.user.mySurkl){
        return <div id="already-created">You can create only one Surkl. Get to know Your Surkl.</div>
      } else {
        return <div id="create-surkl">{this.phase()}</div>;
      }
    } else {
      return 'Loader'
    }
   
		
	}
}
CreateSurkl.propTypes = {
  auth: PropTypes.object,
  newSurkl: PropTypes.func,
	history: PropTypes.object,
	socket: PropTypes.object
}
function stateToProps(state){
  return {
    auth:state.auth
  }
}
export default connect(stateToProps, {newSurkl})(CreateSurkl);
