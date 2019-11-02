import React, { Component } from "react";
import PropTypes from "prop-types";
import "./styles/session-content-twitch.scss";
import { connect } from "react-redux";
import { updateSession } from "actions/actions";
import Loader2 from "components/Loader2/loader2";

class SessionContentTwitch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dmsearch: "",
      videos: [],
      videoPicked: false,
      playingVideo: ""
    };
    this.token = "myeqv7fcl1x0mv6uotktjmnuwck42n";
    this.twitchByUsers = "https://api.twitch.tv/helix/search/channels&query=";
    this.twitchByGame =
      "https://api.twitch.tv/helix/streams?first=100&game_id=";
    this.twitchByStreams =
      "https://api.twitch.tv/helix/streams?first=100&title=";
    this.twitchByClips = "https://api.twitch.tv/helix/clips?=";
  }
  handleInput = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  fetchIt = (apiUrl, query) => {
    fetch(apiUrl + query, {
      headers: {
        "Client-ID": "z0zn6hk34j09blpvy8bji7tzfdvvmc"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          if (data.data) {
            this.props.updateSession({
              twitchStreams: data.data,
              twitchLoading: false
            });
          }
        } else {
          this.fetchIt(apiUrl, query);
        }
      })
      .catch(err => {
        console.log("wtf", err);
      });
  };
  fetchGames = query => {
    fetch(query, {
      headers: {
        "Client-ID": "z0zn6hk34j09blpvy8bji7tzfdvvmc"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          if (data.data) {
            this.props.updateSession({
              twitchGames: data.data,
              twitchLoading: false
            });
          }
        }
      })
      .catch(err => {
        console.log("wtf", err);
      });
  };
  // searchVideos = (e) => {
  // 	if (e.key === 'Enter') {
  //     if(this.state.videoPicked===true){
  //       this.setState({
  //         playingVideo: '',
  //         videoPicked: false},()=>{
  //           this.fetchIt(this.twitchByStreams, this.state.search)
  //         })
  //     } else {
  // 			console.log(this.twitchByStreams + this.state.search)
  //       this.fetchIt(this.twitchByStreams, this.state.search)
  //     }
  // 	}
  // };
  componentDidUpdate = prevProps => {
    let prop = this.props.session;
    if (prop) {
      if (
        prop.videoId.id &&
        prop.videoId.platform === "twitch" &&
        prop.videoId.id !== prevProps.session.videoId.id &&
        prop.videoId.id.length > 0
      ) {
        let clickHistory = this.props.session.twitchClickHistory.slice(0, 2);
        clickHistory.unshift("video");
        this.props.updateSession({
          twitchLoading: false,
          twitchClickHistory: clickHistory
        });
        this.showVideo(prop.videoId.id);
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
    if (prop) {
      if (prop.twitchClickHistory[0] !== "games") {
        if (
          prop.videoId.id &&
          prop.videoId.id.length > 0 &&
          prop.playing &&
          prop.videoId.platform === "twitch"
        ) {
          this.showVideo(prop.videoId.id);
        }
      }
    }
    if (this.props.session) {
      this.props.updateSession({ twitchLoading: true });
      this.fetchGames("https://api.twitch.tv/helix/games/top");
    }
  };
  hideVideo = () => {
    if (this.state.videoPicked) {
      this.YTPlayer = null;
      if (this.props.session.isAdmin) {
        this.props.unpickThisVideo({
          activePlatform: "twitch",
          videoId: {},
          playing: false
        });
      }
      this.setState({
        videoPicked: false
      });
    }
  };
  showVideo = videoId => {
    this.setState({
      playingVideo: videoId,
      videoPicked: true
    });
  };
  sendPickedVideo = videoId => {
    if (this.props.session.isAdmin) {
      this.props.sendVideoSignal({
        activePlatform: "twitch",
        videoId: { id: videoId, platform: "twitch" },
        playing: true,
        requestingTime: false
      });
    }
  };

  pickGame = id => {
    let clickHistory = this.props.session.twitchClickHistory.slice(0, 2);
    clickHistory.unshift("streams");
    this.props.updateSession({
      twitchLoading: true,
      twitchClickHistory: clickHistory
    });
    this.fetchIt(this.twitchByGame, id);
  };
  goBack = () => {
    let clickHistory = this.props.session.twitchClickHistory.slice(0, 2);

    if (clickHistory[0] === "video") {
      this.hideVideo();
      clickHistory.unshift("streams");
      this.props.updateSession({ twitchClickHistory: clickHistory });
    } else if (clickHistory[0] === "streams") {
      clickHistory.unshift("games");
      this.props.updateSession({ twitchClickHistory: clickHistory });
    }
  };
  displayGameSnippets = () => {
    if (this.props.session) {
      let twitchGames =
        this.props.session.twitchGames === null ||
        this.props.session.twitchGames === undefined
          ? []
          : this.props.session.twitchGames;
      if (twitchGames.length) {
        return twitchGames.map((snippet, ind) => {
          let imgUrl = snippet.box_art_url.replace("{width}", "200");
          imgUrl = imgUrl.replace("{height}", "300");
          return (
            <img
              onClick={() => this.pickGame(snippet.id)}
              src={imgUrl}
              key={snippet.id}
              className="twitchGameSnippet"
            />
          );
        });
      }
    }
  };

  displayStreamSnippets = () => {
    let twitchStreams =
      this.props.session.twitchStreams === null ||
      this.props.session.twitchStreams === undefined
        ? []
        : this.props.session.twitchStreams;
    if (this.props.session) {
      if (twitchStreams.length) {
        return twitchStreams.map((snippet, ind) => {
          if (/^[A-Za-z0-9]*$/.test(snippet.user_name)) {
            let live =
              snippet.type === "live" ? (
                <div className="streamIsLive">
                  <div className="redLiveDot"></div>Live
                </div>
              ) : (
                ""
              );
            let imgUrl = snippet.thumbnail_url.replace("{width}", "200");
            imgUrl = imgUrl.replace("{height}", "115");
            return (
              <div
                onClick={() => this.sendPickedVideo(snippet.user_name)}
                key={ind}
                className="twitchVidSnippet"
              >
                {live}
                <div className="twitchVideoSignalBtn"></div>
                <img className="twitchSnippetImg" src={imgUrl} />
                <div className="twitchStreamInfoWrap">
                  <div className="twitchStreamInfo">
                    <div className="twitchChannelTitle">
                      {snippet.user_name}
                    </div>
                    <div className="twitchSnippetViewers">
                      {snippet.viewer_count}
                      <span style={{ marginLeft: "5px" }}></span>Viewers
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        });
      }
    }
  };

  renderHeader = () => {
    return (
      <div className="twitchDiscContentHeader">
        <div
          onClick={() => this.goBack()}
          id="twitchContentBack"
          className="twitchDiscHeaderIcon"
        />
        {/* <div id="twitchContentDice" className="twitchDiscHeaderIcon" /> */}
        <div id="twitchHeaderLogo"></div>
        {/* <div className="twitchDiscHeaderSearch">
					
					<input
						onKeyDown={this.searchVideos}
						id={this.props.contentType}
						className="twitchSearchBar"
						name="search"
						value={this.stattwitchAearch}
						onChange={this.handleInput}
					/>
					<div id="twitchDiscSearchIcon" className="twitchDiscHeaderIcon" />
				</div> */}
      </div>
    );
  };
  content = () => {
    if (this.props.session.twitchLoading) {
      return <Loader2 color="#4B367C" />;
    } else if (this.props.session.twitchClickHistory[0] === "streams") {
      return this.displayStreamSnippets();
    } else if (this.props.session.twitchClickHistory[0] === "games") {
      return this.displayGameSnippets();
    }
  };
  render() {
    //if (this.props.session.isAtwitchin) {
    if (this.state.videoPicked) {
      return (
        <div className="twitchDiscContent">
          <div className="twitchDiscContentViewer">
            {this.renderHeader()}
            <div style={{ marginTop: "5px" }} className="twitchVideoFrameWrap">
              <div id="twitchPlayer" />
              {
                <iframe
                  id="twitchiFrame"
                  height="100%"
                  width="100%"
                  className="twitchVideoFrame"
                  allow="autoplay; encrypted-media"
                  src={
                    "https://player.twitch.tv/?channel=" +
                    this.state.playingVideo
                  }
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
          <div className="twitchDiscContentPreview">{this.content()}</div>
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
export default connect(
  stateToProps,
  { updateSession }
)(SessionContentTwitch);
