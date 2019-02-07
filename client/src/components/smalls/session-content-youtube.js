import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'styles/session-content-youtube.scss';
import { connect } from 'react-redux';
import { updateSession } from 'actions/actions'

class SessionContentYoutube extends Component {
	constructor(props) {
		super(props);
		this.state = {
			search: '',
			videos: [],
			videoPicked: false
		};

		this.YTkey = 'AIzaSyBYjnyqxqjLo5B5cJjlo-KkEzQYLp6dqPE';
		this.YTapi =
			'https://www.googleapis.com/youtube/v3/search?key=AIzaSyC-NVEgdByg61B92oFIbXkWBm-mqrW6FwU&relevanceLanguage=en&regionCode=US&publishedAfter=2017-01-01T00:00:00Z&part=snippet&order=date&maxResults=30&q=';
		this.YTurl = 'https://www.youtube.com/embed/';
	}
	handleInput = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};


	/* searchVideos = (e) => {
		if (e.key === 'Enter') {
      if(this.state.videoPicked===true){
        this.setState({
          playingVideo: '',
          videoPicked: false},()=>{
            fetch(this.YTapi + this.state.search.replace(' ', '+')).then((res) => res.json()).then((data) => {
              console.log(data);
              this.setState({ videos: data.items });
            });
          })
      } else {
        fetch(this.YTapi +  +  this.props.contentType.replace(' ', '+')).then((res) => res.json()).then((data) => {
          console.log(data);
          this.setState({ videos: data.items });
        });
      }   
		}
	}; */
	componentDidUpdate = (prevProps) => {
		let prop = this.props.session;
	
	};
	componentDidMount = () => {
		let prop = this.props.session;
		if (this.props.session.category && this.state.videos.length === 0) {
			fetch(this.YTapi + prop.category + '+' + prop.subCategory).then((res) => res.json()).then((data) => {
				if (data.items) {
					this.setState({ videos: data.items }, () => {
						this.rendered = true;
						this.props.updateSession(data.items)
					});
				}
			});
		}
	};
	playVideo = (videoId) => {
		this.setState({
			playingVideo: videoId,
			videoPicked: true
		});
	};

	displayVideoSnippets = () => {
		return this.state.videos.map((snippet, ind) => {
			return (
				<div onClick={() => this.playVideo(snippet.id.videoId)} key={ind} className="vidSnippet">
					<img className="snippetImg" src={snippet.snippet.thumbnails.default.url} />
					<div className="channelTitle">{snippet.snippet.channelTitle}</div>
					<div className="videoDate">
						{new Date(Date.parse(snippet.snippet.publishedAt)).toLocaleDateString()}
					</div>
					<div className="videoTitle">{snippet.snippet.title}</div>
				</div>
			);
		});
	};
	
	renderHeader = () => {
		if (this.props.session.isAdmin) {
			return (
				<div className="discContentHeader">
					<div
						onClick={() => this.setState({ videoPicked: false })}
						id="contentBack"
						className="discHeaderIcon"
					/>
					
					<div id="contentDice" className="discHeaderIcon" />
				</div>
			);
		}
	};
	render() {
		//if (this.props.session.isAdmin) {
			if (this.state.videoPicked) {
				return (
					<div className="discContent">
						<div className="discContentViewer">
							{this.renderHeader()}
							<div style={{ marginTop: '5px' }} className="videoFrameWrap">
								<iframe
									style={{ display: !this.props.session.isAdmin ? 'none' : 'block' }}
									height="100%"
									width="100%"
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
							<div
								onClick={() => this.setState({ videoPicked: false })}
								id="contentBack"
								className="discHeaderIcon"
							/>
							<div id="contentDice" className="discHeaderIcon" />
						</div>
						<div className="discContentPreview">{this.displayVideoSnippets()}</div>
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
	updateSession: PropTypes.func
};
function stateToProps(state) {
	return {
		session: state.session
	};
}
export default connect(stateToProps,{updateSession})(SessionContentYoutube);
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
