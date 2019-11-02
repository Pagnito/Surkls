import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './styles/session-content-youtube.scss';
import { connect } from 'react-redux';
import { updateSession } from 'actions/actions'
import YTplayer from 'yt-player';
import Loader2 from 'components/Loader2/loader2';

class SessionContentYoutube extends Component {
	constructor(props) {
		super(props);
		this.state = {
			search: '',
			videos: [],
			videoPicked: false
		};
		this.apiKeys = ['AIzaSyDws9NT1IvkAYPH98VYsIKFXffKNVmU-Jc',
										'AIzaSyC-NVEgdByg61B92oFIbXkWBm-mqrW6FwU',
										'AIzaSyBYjnyqxqjLo5B5cJjlo-KkEzQYLp6dqPE',
										'AIzaSyAPW2QscyTsEPKUzDgEpR321HEouBt7A2o',
										'AIzaSyAGfR5YzyHv7_nXDqy3djJfYEs-NIVXiik',
										'AIzaSyCRwoKB-wr5Sc0OhN4sD7yY_oZuV5UN_es',
										'AIzaSyAh_DJv3EwDi7ROzvzY35zqEFFh433sHMs',
										'AIzaSyDE03mlW16M0wP6KzjX7jTJbl4mevEDoNo'
										]
		this.YTapi =
			'https://www.googleapis.com/youtube/v3/search?&relevanceLanguage=en&regionCode=US&publishedAfter=2017-01-01T00:00:00Z&part=snippet&order=date&maxResults=30';
		this.onMountYTapi = 'https://www.googleapis.com/youtube/v3/videos?&relevanceLanguage=en&regionCode=US&publishedAfter=2017-01-01T00:00:00Z&part=snippet&order=date&maxResults=50&chart=mostPopular&key=AIzaSyDE03mlW16M0wP6KzjX7jTJbl4mevEDoNo'
		this.YTurl = 'https://www.youtube.com/embed/';
		this.YTPlayer = null;
		this.keyInd=0;
	}
	handleInput = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	fetchIt = (keys, keyword)=> {
		 keyword = keyword.length>0 ? '&q='+keyword : '';
		 let url = keyword.length>0 ? this.YTapi : this.onMountYTapi;
		if(this.keyInd>7){
			return;
		}
		this.keyInd++
		fetch(url + keyword+'&key='+keys[this.keyInd])
		.then((res) => res.json())
		.then((data) => {
			if(data.items){
				this.props.updateSession({youtubeList:data.items})
			} else {
				this.fetchIt(this.apiKeys, keyword)
			}		
		}).catch(()=>{
			this.fetchIt(this.apiKeys, keyword)
		})
	}
	searchVideos = (e) => {
		if (e.key === 'Enter') {
			if(this.YTPlayer!==null){
				this.YTPlayer.destroy()
			}	
				this.setState({
					playingVideo: '',
					videoPicked: false},()=>{
						this.fetchIt(this.apiKeys, this.state.search, (list)=>{
							this.props.updateSession({youtubeList:list})
						})   
				 })  
			}    
		}

	componentDidUpdate = (prevProps) => {
		let prop = this.props.session;
		if(prop){
			if(prop.videoId.id && prop.videoId.platfrom==='youtube' && prop.videoId.id!==prevProps.session.videoId.id && prop.videoId.id.length>0){
				if(this.YTPlayer!==null){
					this.YTPlayer.load(prop.videoId.id,{autoplay:true})
				} else {
					this.showVideo(prop.videoId.id);
				}
				
			}		
			if (prop.youtubeList !== prevProps.session.youtubeList && prop.isAdmin)  {
				setTimeout(()=>{this.props.saveYoutubeListRedis(prop.youtubeList)},500)
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
      if(prop.videoId.id && prop.videoId.platfrom==='youtube' && prop.videoId.length>0 && prop.playing) {
        this.showVideo(prop.videoId);
      }
    }
		//if (this.props.session.category && this.state.videos.length === 0 && prop.isAdmin) {
			this.fetchIt(this.apiKeys, '')		
		//}
	};
	hideVideo = () =>{
		if(this.state.videoPicked){
			if(this.YTPlayer!==null){
				this.YTPlayer.destroy()
			}	
			if(this.YTPlayer.destroyed){
				this.YTPlayer = null;
				if(this.props.session.isAdmin){
					this.props.unpickThisVideo({
						activePlatform:'youtube',
						videoId:{}, 
						playing:false
					})
				}	
				this.setState({
					videoPicked: false
				})
			}	
		} else {
			this.fetchIt(this.apiKeys, '')
		}
	}
	showVideo = (videoId) => {
		this.setState({
			playingVideo: videoId,
			videoPicked: true
		},()=>{
			this.YTPlayer = new YTplayer('#YTPlayer',{
				height: '100%',
				width: '100%',
				host: 'https://www.youtube.com',
				autoplay:true,
				related: false
			})
			if(this.props.session.currentTime){
				this.YTPlayer.load(videoId)
				this.YTPlayer.load(currentTime)
			} else {
				this.YTPlayer.load(videoId,{autoplay:true})
			}
			
			this.YTPlayer.on('error', (err) => {console.log("YT error", err)})
		});
	};
	sendPickedVideo = (videoId) =>{
		if(this.props.session.isAdmin){
			this.props.sendVideoSignal({
				activePlatform:'youtube',
				videoId:{platfrom: 'youtube', id:videoId}, 
				playing:true,
				requestingTime:false,
				
			})
		}
	}
	getVideosCurrentTime = () =>{
		return this.YTPlayer.getCurrentTime();
	}

	displayVideoSnippets = () => {
		let youtubeList = this.props.session.youtubeList===null ?  [] : this.props.session.youtubeList
		if(this.props.session){
			if(youtubeList.length){
				return youtubeList.map((snippet, ind) => {
					return (
						<div onClick={()=>this.sendPickedVideo(snippet.id.videoId || snippet.id)} key={ind} className="vidSnippet">
						{/* <div  className="videoSignalBtn"></div> */}
							<img className="snippetImg" src={snippet.snippet.thumbnails.default.url} />
							<div className="videoTitle">{snippet.snippet.title}</div>
							<div className="channelTitle">{snippet.snippet.channelTitle}</div>
							<div className="videoDate">
								{new Date(Date.parse(snippet.snippet.publishedAt)).toLocaleDateString()}
							</div>
							
						</div>
					);
				});
			}	
		}
	};
	
	renderHeader = () => {
			return (
				<div className="discContentHeader">
					<div
						onClick={() => this.hideVideo()}
						id="contentBack"
						className="discHeaderIcon"
					/>			
					<div id="contentDice" className="discHeaderIcon" />
					<div className="discHeaderSearch">
						<input
								onKeyDown={this.searchVideos}
								id={this.props.contentType}
								className="searchBar"
								name="search"
								value={this.state.search}
								onChange={this.handleInput}
							/>
						<div id="discSearchIcon" className="discHeaderIcon" />
					</div>
				</div>
			);
		}

	render() {
		//if (this.props.session.isAdmin) {
			if (this.state.videoPicked) {
				return (
					<div className="discContent">
						<div className="discContentViewer">
							{this.renderHeader()}
							<div style={{ marginTop: '5px' }} className="videoFrameWrap">
								<div id="YTPlayer"></div>
							{/* 	<iframe
									id="iFrame"
									height="100%"
									width="100%"
									className="videoFrame"
									allow="autoplay; encrypted-media"
									src={this.YTurl + this.state.playingVideo}
								/> */}
							</div>
						</div>
					</div>
				);
			} else {
				return (
					<div className="discContent">
						{this.renderHeader()}
						<div className="discContentPreview">
						{this.props.session.youtubeList.length > 0? this.displayVideoSnippets() : 
						<Loader2 color="#FF0000" />}</div>
					</div>
				);
			}
	}
}

SessionContentYoutube.propTypes = {
	contentType: PropTypes.object,
	region: PropTypes.string,
	session: PropTypes.object,
	videoUrl: PropTypes.string,
	updateSession: PropTypes.func,
	sendVideoSignal: PropTypes.func,
	unpickThisVideo: PropTypes.func,
	saveYoutubeListRedis: PropTypes.func,
	askForVideoCurrentTime: PropTypes.func,
	sendVideoCurrentTime: PropTypes.func
};
function stateToProps(state) {
	return {
		session: state.session
	};
}
export default connect(stateToProps,{updateSession})(SessionContentYoutube);
