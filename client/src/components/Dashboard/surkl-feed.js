import React, { Component } from 'react';
import { connect } from 'react-redux';
import { readOne } from '../../../tools/sw-utils';
import PropTypes from 'prop-types';
class SurklFeed extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.imgCount = 0;
    this.prevImgCount = 0;
    this.imgs = {}
	}
	componentDidMount() {}
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
      this.moveChat()
		}
  }
  moveChat = () =>{
    const chatBox = document.getElementById('surkl-feed');
    if (chatBox !== null) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
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
    let images = document.getElementsByClassName('img');
    const chatBox = document.getElementById('surkl-feed');
    let iter = 0 ;
		for (let img of images) {  
      iter++
      if(!this.imgs[img.dataset.imageid].loaded){

        readOne('surkl-chat-media', img.dataset.imageid).then((resImg) => {
          this.blobToDataURL(resImg.file, (url) => {
            img.src = url;
            img.style.display = 'block';
            this.imgs[img.dataset.imageid].loaded = true;        
          });
        }).catch(err=>{});
      }	
      if (chatBox !== null && iter===images.length) {
        setTimeout(()=>{
          chatBox.scrollTop = chatBox.scrollHeight;
        },500)            
      }	
		}
	};
	displayMsgs = () => {
		return this.props.surkl.msgs.map((msg, ind) => {
      let date = new Date(msg.date);
      let imgCount;
      let possbileUrlImg;
			let locale = date.toLocaleDateString();
			let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
			let time = date.getHours() + ':' + minutes;
			let fullDate = locale + ' ' + time;
			let url = msg.avatarUrl ? msg.avatarUrl : '/assets/whitehat.jpg';
			if (msg.image_id) {
        imgCount++;
        this.imgs[msg.image_id] = {
          ...this.imgs[msg.image_id],
          id:msg.image_id
        }
      }
      if(ind === this.props.surkl.msgs.length-1){
        this.imgCount = imgCount
      }
			if (msg.msg) {
        //console.log(msg.msg.indexOf('https://' || 'http://')>-1)
        //console.log(msg.msg.match(/\.(jpeg|jpg|gif|png)$/))
        if(msg.msg.indexOf('https://' || 'http://')>-1 && 
          msg.msg.indexOf('.com' || 'net' || '.io' || '.us' || '.uk' || '.info' || 'org' || 'co')>-1 && 
         msg.msg.match(/(jpeg|jpg|gif|png)/) !== null) {
            
            possbileUrlImg = <img onLoad={this.moveChat} src={msg.msg}/>
        } else {
            possbileUrlImg = msg.msg
        }
				return (
					<div key={ind} className="surkl-chat-msg-wrap">
						<div className="surkl-chat-msg">
							<img data-user={JSON.stringify(msg)} className="surkl-chat-msgAvatar" src={url} />
							<div className="surkl-chat-HeaderNmsg">
								<div className="surkl-chat-MsgUserInfo">
									<div className="surkl-chat-MsgName">{msg.userName}</div>
									<div className="surkl-chat-MsgDate">{fullDate}</div>
								</div>
								<div className="surkl-chat-MsgText">{possbileUrlImg}</div>
							</div>
						</div>
					</div>
				);
			} else if (msg.image_id) {
				return (
					<div key={ind} className="surkl-chat-msg-wrap">
						<div className="surkl-chat-msg">
							<img data-user={JSON.stringify(msg)} className="surkl-chat-msgAvatar" src={url} />
							<div className="surkl-chat-HeaderNmsg">
								<div className="surkl-chat-MsgUserInfo">
									<div className="surkl-chat-MsgName">{msg.userName}</div>
									<div className="surkl-chat-MsgDate">{fullDate}</div>
								</div>
								<div className="surkl-chat-MsgText">
									<img style={{display:'none'}} className="img" data-imageid={msg.image_id} src={'oof'} />
								</div>
							</div>
						</div>
					</div>
				);
			}
		});
	};
	render() {
		return (
			<div id="surkl-feed">
				{this.displayMsgs()}
				
			</div>
		);
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
