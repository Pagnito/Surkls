import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateMsgs } from 'actions/surkl-actions'
import { readOne, readData, deleteOne } from 'tools/sw-utils';
import PropTypes from 'prop-types';
import './ChatFeed.scss';
class SurklFeed extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.imgCount = 0;
		this.prevImgCount = 0;
		this.imgs = {};
	}
	
	shouldComponentUpdate(prevProps) {
		return this.equals(prevProps.msgs, this.props.msgs);
	}
	componentDidUpdate(prevProps) {
		if (prevProps.msgs !== this.props.msgs && this.prevImgCount !== this.imgCount) {
			setTimeout(() => {
				this.prevImgCount = this.imgCount - 1;
				this.loadImages();
			}, 1000);
		}
		if (this.props.msgs !== prevProps.msgs) {
			this.moveChat();
		}
	}
	moveChat = () => {
		const chatBox = document.getElementById('chat-feed');
		if (chatBox !== null) {
			chatBox.scrollTop = chatBox.scrollHeight;
		}
	};
	cleanIndexedDB = () => {
		readData(this.props.type + '-chat-media').then((val) => {
			if (val.length > 50) {
				let toBeDeleted = val.slice(50, val.length - 1);
				toBeDeleted.forEach((file) => {
					deleteOne(this.props.type + '-chat-media', file.id);
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
	loadImages = () => {
		const images = document.getElementsByClassName('img');
		const chatBox = document.getElementById('chat-feed');
		let iter = 0;
		for (let img of images) {
			iter++;
			if (!this.imgs[img.dataset.imageid].loaded) {
				readOne(this.props.type+'-chat-media', img.dataset.imageid)
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
	displayMention = (user) =>{
		let msg = this.state.msg;
		msg += '@'+user;
		this.setState({msg})
	}
	displayMsgs = () => {
		return this.props.msgs.map((msg, ind) => {
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
			if (ind === this.props.msgs.length - 1) {
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
					<div key={ind} className="chat-msg-wrap">
						<div style={{ paddingTop: msg.userName ? '5px' : '0px' }} className="chat-msg">
							<div className="chat-msg-av-wrap">
								{url ? (
									<img onClick={()=>this.displayMention(msg.userName)} data-user={JSON.stringify(msg)} className="chat-msgAvatar" src={url} />
								) : (
									''
								)}
							</div>
							<div className="chat-HeaderNmsg">
								{msg.userName ? (
									<div className="chat-MsgUserInfo">
										<div className="chat-MsgName">{msg.userName}</div>
										<div className="chat-MsgDate">{fullDate}</div>
									</div>
								) : (
									''
								)}
								<div style={{ padding: msg.userName ? '5px' : '0px' }} className="chat-MsgText">{possibleUrlImg}</div>
							</div>
						</div>
					</div>
				);
			} else if (msg.image_id) {
				return (
					<div key={ind} className="chat-msg-wrap">
						<div style={{ paddingTop: msg.userName ? '5px' : '0px' }} className="chat-msg">
							<div className="chat-msg-av-wrap">
								{url ? (
									<img onClick={()=>this.displayMention(msg.userName)} data-user={JSON.stringify(msg)} className="chat-msgAvatar" src={url} />
								) : (
									''
								)}
							</div>
							<div className="chat-HeaderNmsg">
								{msg.userName ? (
									<div className="chat-MsgUserInfo">
										<div className="chat-MsgName">{msg.userName}</div>
										<div className="chat-MsgDate">{fullDate}</div>
									</div>
								) : (
									''
								)}
								<div className="chat-MsgText">
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
		return <div id="chat-feed">{this.displayMsgs()}</div>;
	}
}
SurklFeed.propTypes = {
	children: PropTypes.oneOfType([ PropTypes.array, PropTypes.object ]),
  type: PropTypes.string,
	msgs: PropTypes.array,
	width: PropTypes.number,
	height: PropTypes.number,
	updateMsgs: PropTypes.func,
	socket: PropTypes.object,
	surkl: PropTypes.object
};

export default connect(null, {updateMsgs})(SurklFeed);
