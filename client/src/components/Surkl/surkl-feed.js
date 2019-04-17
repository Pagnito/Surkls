import React, { Component } from 'react';
import { connect } from 'react-redux';
//import {emojiRegex} from './emojis'
import { readOne, readData, deleteOne } from '../../../tools/sw-utils';
import PropTypes from 'prop-types';
class SurklFeed extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.imgCount = 0;
		this.prevImgCount = 0;
		this.imgs = {};
	}
	
	shouldComponentUpdate(prevProps) {
		return this.equals(prevProps.surkl.msgs, this.props.surkl.msgs);
	}
	componentDidUpdate(prevProps) {
		if (prevProps.surkl.msgs !== this.props.surkl.msgs && this.prevImgCount !== this.imgCount) {
			setTimeout(() => {
				this.prevImgCount = this.imgCount - 1;
				this.loadImages();
			}, 1000);
		}
		if (this.props.surkl.msgs !== prevProps.surkl.msgs) {
			this.moveChat();
		}
	}
	moveChat = () => {
		const chatBox = document.getElementById('surkl-feed');
		if (chatBox !== null) {
			chatBox.scrollTop = chatBox.scrollHeight;
		}
	};
	cleanIndexedDB = () => {
		readData('surkl-chat-media').then((val) => {
			if (val.length > 50) {
				let toBeDeleted = val.slice(50, val.length - 1);
				toBeDeleted.forEach((file) => {
					deleteOne('surkl-chat-media', file.id);
				});
			}
		});
	};
	equals = (prev, curr) => {
		if (prev === curr) {
			return false;
		} else {
			return true;
		}
	};
	blobToDataURL(blob, callback) {
		var reader = new FileReader();
		reader.onload = function(e) {
			callback(e.target.result);
		};
		reader.readAsDataURL(blob);
	}
	resizeImg = (e) => {
		this.moveChat();
		let image = e.target
		let max_size = 460, 
			width = image.width,
			height = image.height;
		if (width > height) {
			if (width > max_size) {
				height *= max_size / width;
				width = max_size;
				image.width = width
			}
		} else {
			if (height > max_size) {
				width *= max_size / height;
				height = max_size;
				image.height = height
			}
		}
		image.style.display = 'block';
	};
	loadImages = () => {
		let images = document.getElementsByClassName('img');
		const chatBox = document.getElementById('surkl-feed');
		let iter = 0;
		for (let img of images) {
			iter++;
			if (!this.imgs[img.dataset.imageid].loaded) {
				readOne('surkl-chat-media', img.dataset.imageid)
					.then((resImg) => {
						this.blobToDataURL(resImg.file, (url) => {
							img.src = url;
							img.style.display = 'block';
							this.imgs[img.dataset.imageid].loaded = true;
						});
					})
					.catch(() => {});
			}
			if (chatBox !== null && iter === images.length) {
				setTimeout(() => {
					chatBox.scrollTop = chatBox.scrollHeight;
					this.cleanIndexedDB();
				}, 500);
			}
		}
	};
	createMention = (user) =>{
		console.log(user,' or')
		let msg = this.state.msg;
		msg += '@'+user;
		this.setState({msg})
	}
	displayMsgs = () => {
		return this.props.surkl.msgs.map((msg, ind) => {
			let date = new Date(msg.date);
			let imgCount;
			let possibleUrlImg;
			let locale = date.toLocaleDateString();
			let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
			let time = date.getHours() + ':' + minutes;
			let fullDate = locale + ' ' + time;
			let url = msg.avatarUrl;
			if (msg.image_id) {
				imgCount++;
				this.imgs[msg.image_id] = {
					...this.imgs[msg.image_id],
					id: msg.image_id
				};
			}
			if (ind === this.props.surkl.msgs.length - 1) {
				this.imgCount = imgCount;
			}
			if (msg.msg) {
				if (
					/(http|https)/.test(msg.msg) &&
					/(.com|.net|.io|.us| .uk |.info|.org|.co)/.test(msg.msg) &&
					/(jpeg|jpg|gif|png)/.test(msg.msg)
				) {
					possibleUrlImg = (
						<img style={{display:'none'}} onLoad={this.resizeImg} src={msg.msg} />
					);
				} else {
					possibleUrlImg = msg.msg;
					if(/(\ ?@.*)/g.test(msg.msg)){
						let split = msg.msg.split(' ');
					possibleUrlImg = split.map((msg, key)=>{
						if(/^(\ ?@.*)/.test(msg)){
							return <span style={{color:'#FFCD44'}} key={key}>{' '+msg+' '}</span>
						} else {
							return msg
						}
					})
					}
				}
				return (
					<div key={ind} className="surkl-chat-msg-wrap">
						<div style={{ paddingTop: msg.userName ? '5px' : '0px' }} className="surkl-chat-msg">
							<div className="surkl-chat-msg-av-wrap">
								{url ? (
									<img onClick={()=>this.createMention(msg.userName)} data-user={JSON.stringify(msg)} className="surkl-chat-msgAvatar" src={url} />
								) : (
									''
								)}
							</div>
							<div className="surkl-chat-HeaderNmsg">
								{msg.userName ? (
									<div className="surkl-chat-MsgUserInfo">
										<div className="surkl-chat-MsgName">{msg.userName}</div>
										<div className="surkl-chat-MsgDate">{fullDate}</div>
									</div>
								) : (
									''
								)}
								<div style={{ padding: msg.userName ? '5px' : '0px' }} className="surkl-chat-MsgText">{possibleUrlImg}</div>
							</div>
						</div>
					</div>
				);
			} else if (msg.image_id) {
				return (
					<div key={ind} className="surkl-chat-msg-wrap">
						<div style={{ paddingTop: msg.userName ? '5px' : '0px' }} className="surkl-chat-msg">
							<div className="surkl-chat-msg-av-wrap">
								{url ? (
									<img onClick={()=>this.createMention(msg.userName)} data-user={JSON.stringify(msg)} className="surkl-chat-msgAvatar" src={url} />
								) : (
									''
								)}
							</div>
							<div className="surkl-chat-HeaderNmsg">
								{msg.userName ? (
									<div className="surkl-chat-MsgUserInfo">
										<div className="surkl-chat-MsgName">{msg.userName}</div>
										<div className="surkl-chat-MsgDate">{fullDate}</div>
									</div>
								) : (
									''
								)}
								<div className="surkl-chat-MsgText">
									<img
										style={{ display: 'none', marginTop: '7px' }}
										className="img"
										data-imageid={msg.image_id}
										src={'oof'}
									/>
								</div>
							</div>
						</div>
					</div>
				);
			}
		});
	};
	render() {
		return <div id="surkl-feed">{this.displayMsgs()}</div>;
	}
}
SurklFeed.propTypes = {
	children: PropTypes.oneOfType([ PropTypes.array, PropTypes.object ]),
	surkl: PropTypes.object
};
function stateToProps(state) {
	return {
		surkl: state.surkl
	};
}
export default connect(stateToProps)(SurklFeed);
