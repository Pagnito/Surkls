import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './styles/session-content-twitch.scss';
import { connect } from 'react-redux';
import { updateSession } from 'actions/actions';
import Loader2 from 'components/Loader2/loader2';

class SessionContentTwitch extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dmsearch: '',
			videos: [],
			videoPicked: false,
			playingVideo: ''
		};
		this.token = 'myeqv7fcl1x0mv6uotktjmnuwck42n'
		this.twitchByUsers =
			'https://api.twitch.tv/helix/search/channels&query=';
		this.twitchByGames =
			'https://api.twitch.tv/helix/search/games?type=suggest&query=';
		this.twitchByStreams =
			'https://api.twitch.tv/helix/streams?first=81&title=';
		this.twitchByClips = 
			'https://api.twitch.tv/helix/clips?limit=81&query='
	
	}
	handleInput = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	fetchIt = (apiUrl, query) =>{
		fetch(apiUrl+query, {
			headers:{
				'Client-ID': 'z0zn6hk34j09blpvy8bji7tzfdvvmc'
			}		
		}).then(res=>res.json())
			.then(data=>{
				console.log(data)
				if(data.data){
					if(data.data){
						this.props.updateSession({twitchStreams:data.data})
					} else {
						this.props.updateSession({twitchChannels:data.data})
					}				
				} else {
					this.fetchIt(apiUrl, query)
				}		
			}).catch(err=>{
				console.log('wtf', err)
			})
	}
	searchVideos = (e) => {
		if (e.key === 'Enter') {
      if(this.state.videoPicked===true){
        this.setState({
          playingVideo: '',
          videoPicked: false},()=>{
            this.fetchIt(this.twitchByStreams, this.state.search)
          })
      } else {
				console.log(this.twitchByStreams + this.state.search)
        this.fetchIt(this.twitchByStreams, this.state.search)
      }   
		}
	};
	componentDidUpdate = (prevProps) => {
    let prop = this.props.session;
    if(prop){
      if (prop.videoId !== prevProps.session.videoId && prop.videoId.length > 0) {
        this.showVideo(prop.videoId);
      }
    }
		/* if(prop.playState.requestingTime!==prevProps.session.playState.requestingTime){	
			this.props.sendVideoCurrentTime(this.getVideosCurrentTime(),()=>{
				console.log('sending back')
				prop.playState.requestingTime = false;
				this.props.updateSession({playState:prop.playState});
			})	
		} */
	};
	
	componentDidMount = () => {
		let prop = this.props.session;
		/* if(prop.creatingSession===false){
			this.props.askForVideoCurrentTime()
    } */
    if(prop){
      if(prop.videoId.length>0 && prop.playing) {
        this.showVideo(prop.videoId);
      }
    }
		if (this.props.session) {
			this.fetchIt(this.twitchByStreams, 'league+of+legends', (data)=>{
				this.props.updateSession({twitchStreams: data.streams})
			}) 
		}
	};
	hideVideo = () => {
		if (this.state.videoPicked) {
			this.YTPlayer = null;
			if (this.props.session.isAdmin) {
				this.props.unpickThisVideo({
					activePlatform: 'twitch',
					videoId: '',
					playing: false,				
				});
			}
			this.setState({
				videoPicked: false
			});
		}
	};
	showVideo = (videoId) => {
		this.setState({
			playingVideo: videoId,
			videoPicked: true
		});
	};
	sendPickedVideo = (videoId) => {
		this.showVideo(videoId)
		if (this.props.session.isAdmin) {
			this.props.sendVideoSignal({
				activePlatform: 'twitch',
				videoId: videoId,
				playing: true,
				requestingTime: false,
			
			});
		}
	};
	

	displayStreamSnippets = () => {
		let twitchStreams = this.props.session.twitchStreams === null ||
		this.props.session.twitchStreams === undefined 
		 ? [] : this.props.session.twitchStreams;
		if (this.props.session) {
			console.log(twitchStreams)
			if(twitchStreams.length){
				return twitchStreams.map((snippet, ind) => {
					let live = snippet.type === 'live' ?
					 <div className="streamIsLive"><div className="redLiveDot"></div>Live</div> : '';
					let imgUrl = snippet.thumbnail_url.replace('{width}', '200');
					imgUrl = imgUrl.replace('{height}', '115');
					return (
						<div onClick={() => this.sendPickedVideo(snippet.user_name)} key={ind} className="twitchVidSnippet">
									{live}
							<div className="twitchVideoSignalBtn"></div>
							<img className="twitchSnippetImg" src={imgUrl} />	
						<div className="twitchStreamInfoWrap">
							{/*<div style={{backgroundImage:`url(${snippet.channel.logo})`}}className="twitchAvatar"></div>*/}									
								{/* <div className="twitchStreamInfo">						
									<div className="twitchChannelTitle">{snippet.channel.name}</div>
								 	<div className="twitchSnippetViewers">{snippet.viewers}
									 	<span style={{marginLeft:'5px'}}></span>Viewers
									 </div>
								</div> */}
							</div>						
						</div>
					);
				});
			}	
		}
	};

	renderHeader = () => {
		return (
			<div className="twitchDiscContentHeader">
				<div onClick={() => this.hideVideo()} id="twitchContentBack" className="twitchDiscHeaderIcon" />
				<div id="twitchContentDice" className="twitchDiscHeaderIcon" />
				<div className="twitchDiscHeaderSearch">
					<input
						onKeyDown={this.searchVideos}
						id={this.props.contentType}
						className="twitchSearchBar"
						name="search"
						value={this.stattwitchAearch}
						onChange={this.handleInput}
					/>
					<div id="twitchDiscSearchIcon" className="twitchDiscHeaderIcon" />
				</div>
			</div>
		);
	};

	render() {
		//if (this.props.session.isAtwitchin) {
		if (this.state.videoPicked) {
			return (
				<div className="twitchDiscContent">
					<div className="twitchDiscContentViewer">
						{this.renderHeader()}
						<div style={{ marginTop: '5px' }} className="twitchVideoFrameWrap">
							<div id="twitchPlayer" />
							{
								<iframe
									id="twitchiFrame"
									height="100%"
									width="100%"
									className="twitchVideoFrame"
									allow="autoplay; encrypted-media"
									src={'https://player.twitch.tv/?channel='+ this.state.playingVideo}
								/>
							}
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="twitchDiscContent">
            {this.renderHeader()}
					<div className="twitchDiscContentPreview">
					{this.props.session.twitchStreams.length > 0 ? this.displayStreamSnippets() :
						<Loader2 color="#4B367C" />}</div>
				</div>
			);
		}
	}
}

SessionContentTwitch.propTypes = {
	contentType: PropTypes.object,
	region: PropTypes.string,
	session: PropTypes.object,
	videoUrl: PropTypes.string,
	updateSession: PropTypes.func,
	sendVideoSignal: PropTypes.func,
	unpickThisVideo: PropTypes.func,
	askForVideoCurrentTime: PropTypes.func,
	sendVideoCurrentTime: PropTypes.func
};
function stateToProps(state) {
	return {
		session: state.session
	};
}
export default connect(stateToProps, { updateSession })(SessionContentTwitch);

