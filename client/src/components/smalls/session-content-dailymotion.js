import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'styles/session-content-dailymotion.scss';
import { connect } from 'react-redux';
import { updateSession } from 'actions/actions';

//const player = new YTPlayer('#player')
class SessionContentYoutube extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dmsearch: '',
			videos: [],
			videoPicked: false
		};
		this.DMapi =
			'https://api.dailymotion.com/videos/?fields=thumbnail_medium_url,id,title&page=1&limit=50&search=';
		this.DMurl = 'https://www.dailymotion.com/embed/video/';
	}
	handleInput = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	searchVideos = (e) => {
		if (e.key === 'Enter') {
      if(this.state.videoPicked===true){
        this.setState({
          playingVideo: '',
          videoPicked: false},()=>{
            fetch(this.DMapi + this.state.dmsearch.replace(' ', '+')).then((res) => res.json()).then((data) => {
              console.log(data);
              this.props.updateSession({ dailymotionList: data.list });
            });
          })
      } else {
        fetch(this.DMapi +  this.state.dmsearch.replace(' ', '+')).then((res) => res.json()).then((data) => {
          console.log(data);
          this.props.updateSession({ dailymotionList: data.list });
        });
      }   
		}
	};
	componentDidUpdate = (prevProps) => {
		let prop = this.props.session;
		if (prop.playState.videoId !== prevProps.session.playState.videoId && prop.playState.videoId.length > 0) {
			this.showVideo(prop.playState.videoId+'?autoplay=1');
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
		if (this.props.session.category && this.state.videos.length === 0) {
			fetch(this.DMapi + prop.category + '+' + prop.subCategory).then((res) => res.json()).then((data) => {
				if (data.list) {
						this.rendered = true;
						this.props.updateSession({ dailymotionList: data.list });
				}
			});
		}
	};
	hideVideo = () => {
		if (this.state.videoPicked) {
			this.YTPlayer = null;
			if (this.props.session.isAdmin) {
				this.props.unpickThisVideo({
					host: 'dailymotion',
					videoId: '',
					playing: false,
					requestingTime: false,
					currentTime: false
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
		if (this.props.session.isAdmin) {
			this.props.sendVideoSignal({
				host: 'dailymotion',
				videoId: videoId,
				playing: true,
				requestingTime: false
			});
		}
	};
	

	displayVideoSnippets = () => {
		let dailymotionList = this.props.session.dailymotionList === null ? [] : this.props.session.dailymotionList;
		if (this.props.session) {
			return dailymotionList.map((snippet, ind) => {
				return (
					<div onClick={() => this.sendPickedVideo(snippet.id)} key={ind} className="DMvidSnippet">
						{/* <div  className="videoSignalBtn"></div> */}
						<img className="DMsnippetImg" src={snippet.thumbnail_medium_url} />
						<div className="DMchannelTitle">{snippet.title}</div>
					</div>
				);
			});
		}
	};

	renderHeader = () => {
		return (
			<div className="DMdiscContentHeader">
				<div onClick={() => this.hideVideo()} id="DMcontentBack" className="DMdiscHeaderIcon" />
				<div id="DMcontentDice" className="DMdiscHeaderIcon" />
				<div className="DMdiscHeaderSearch">
					<input
						onKeyDown={this.searchVideos}
						id={this.props.contentType}
						className="DMsearchBar"
						name="dmsearch"
						value={this.state.dmsearch}
						onChange={this.handleInput}
					/>
					<div id="DMdiscSearchIcon" className="DMdiscHeaderIcon" />
				</div>
			</div>
		);
	};

	render() {
		//if (this.props.session.isAdmin) {
		if (this.state.videoPicked) {
			return (
				<div className="DMdiscContent">
					<div className="DMdiscContentViewer">
						{this.renderHeader()}
						<div style={{ marginTop: '5px' }} className="DMvideoFrameWrap">
							<div id="DMPlayer" />
							{
								<iframe
									id="DMiFrame"
									height="100%"
									width="100%"
									className="DMvideoFrame"
									allow="autoplay; encrypted-media"
									src={this.DMurl + this.state.playingVideo}
								/>
							}
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="DMdiscContent">
            {this.renderHeader()}
					<div className="DMdiscContentPreview">{this.displayVideoSnippets()}</div>
				</div>
			);
		}
		/* } else {
			return (
				<div className="discContent">
					<div className="discContentViewer">
						<div style={{ marginTop: '40px' }} className="videoFrameWrap">
							<iframe
								style={{ display: 'block' }}
								height="100%"
								width="100%"
								className="videoFrame"
								allow="autoplay"
								src={this.YTurl + 'ZA106wrMUe4'}
							/>
						</div>
					</div>
				</div>
			);
		} */
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
export default connect(stateToProps, { updateSession })(SessionContentYoutube);
/* with higher quotas, can implement search
if (this.state.videoPicked) {
			return (
				<div className="discContent">
					<div className="discContentHeader">
						<div onClick={this.renderPlatformMenu} id="contentDropdown" className="discHeaderIcon">
							{this.platformsMenu()}
						</div>
						<div id="contentDice" className="discHeaderIcon" />
						<div className="discHeaderSearch">
						{	<input
								onKeyDown={this.searchVideos}
								id={this.props.contentType}
								className="searchBar"
								name="search"
								value={this.state.search}
								onChange={this.handleInput}
							/>
							<div id="discSearchIcon" className="discHeaderIcon" />}
							</div>
							</div>
							<div className="discContentViewer">
								<div className="videoFrameWrap">
									<iframe
										height="100%" width="100%"
										className="videoFrame"
										allow="autoplay; encrypted-media"
										src={this.YTurl + this.state.playingVideo}
									/>
								</div>
							</div>
						</div>
					);
				} else {
					return (
						<div className="discContent">
							<div className="discContentHeader">
								<div onClick={this.renderPlatformMenu} id="contentDropdown" className="discHeaderIcon">
									{this.platformsMenu()}
								</div>
								<div id="contentDice" className="discHeaderIcon" />
								<div className="discHeaderSearch">
									{<input
										onKeyDown={this.searchVideos}
										id={this.props.contentType}
										className="searchBar"
										name="search"
										value={this.state.search}
										onChange={this.handleInput}
									/>
									<div id="discSearchIcon" className="discHeaderIcon" />}
								</div>
							</div>
							<div className="discContentPreview">{this.displayVideoSnippets()}</div>
						</div>
					);
				}
 */
