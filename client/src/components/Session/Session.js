import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getDevices,
  sendThisVideoAction,
  newAdmin,
  sendTweetAction,
  updateSession,
  unpickThisVideoAction,
  closeMenus,
  removeKeys
} from "actions/actions";
import ProfileModal from "../Reusables/ProfileModal/ProfileModal";
import ChatBox from "../Reusables/ChatBox/ChatBox";
import PropTypes from "prop-types";
import { openDMs, addMultiToDMs, addSessDMs } from "actions/dm-actions";
import Dropdown from "components/Reusables/DropMenu/drop-menu-mutable";
import SessionContentYoutube from "./Sub-comps/session-content-youtube";
import SessionContentDailymotion from "./Sub-comps/session-content-dailymotion";
import SessionContentTwitter from "./Sub-comps/session-content-twitter";
import SessionContentTwitch from "./Sub-comps/session-content-twitch";
import "./session.scss";
import "../Loader1/loader1.scss";
const spliceObj = (obj, keys) => {
	let spliced = {};
	keys.forEach((k) => {
		if (obj[k]) {
			spliced[k] = obj[k];
		}
	});
	return spliced;
};
class Session extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streamSize: {
        height: 400,
        width: 400
      },
      shareLink: "",
      msgs: [],
      errors: {},
      talk: true,
      showMyStream: true,
      clientList: [],
      platformMenuVisible: false,
      sessionExists: true,
      modalErr: ""
    };
    ////////////////^^^^end of state that causes rerender^^^^//////////////////////
    this.stunConfig = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "numbass8",
          username: "pavelyeganov@gmail.com"
        }
      ]
    };
    this.alreadyStarted = false;
    this.stream = null;
    this.track = [];
    this.remoteClients = [];
    this.rtcs = {};
    this.remoteAdded = {
      added: false,
      videoEl: null
    };
    this.socket = this.props.socket;
    this.socketChanneledCreated = false;
  }
  /////////////////////////////////////////end of state//////////////////////////////////
  sendVideoSignal = playState => {
    ///will go into props
    playState.sessionKey = this.props.session.sessionKey;
    this.socket.emit("pickThisVideo", playState);
  };
  unpickThisVideo = playState => {
    playState.sessionKey = this.props.session.sessionKey;
    this.socket.emit("unpickThisVideo", playState);
  };
  saveYoutubeListRedis = youtubeList => {
    if (this.props.session.admin === this.socket.id) {
      let listObj = {
        sessionKey: this.props.session.sessionKey,
        list: youtubeList
      };
      this.socket.emit("youtubeList", listObj);
    }
  };
  sendTweetToOthers = tweetObj => {
    tweetObj.sessionKey = this.props.session.sessionKey;
    this.socket.emit("sharingTweet", tweetObj);
  };
  shareLink = e => {
    if (e.key === "Enter") {
      this.setState({ shareLink: "" }, () => {
        let linkObj = {
          sessionKey: this.props.session.sessionKey,
          link: this.state.shareLink
        };
        this.socket.emit("sharingLink", linkObj);
      });
    }
  };
  closeMenus = () => {
    if (this.props.app.menuState === "open") {
      this.props.closeMenus({ menu: "close-menus" });
    }
  };

  //////////////////////////////////////////////webrtc funcs////////////////////////////////////////////
  handleOfferError = err => {
    console.log(err);
    let errors = {};
    errors.offer = "Someones offer to connect failed";
    this.setState({ errors: errors });
  };
  handleAnswerError = err => {
    console.log(err);
    let errors = {};
    errors.answer = "Your browser failed open a connection";
    this.setState({ errors: errors });
  };
  handleCandidateError = err => {
    console.log(err);
    let errors = {};
    errors.candidates = "Your browser couldn't find a connection protocol";
    this.setState({ errors: errors });
  };
  handleRemoteDescError = err => {
    console.log(err);
    let errors = {};
    errors.remoteDescription =
      "Your browser couldn't set up a remote connection";
    this.setState({ errors: errors });
  };
  handleLocalDescError = err => {
    console.log(err);
    let errors = {};
    errors.localDescription = "Your browser failed to establish a connection";
    this.setState({ errors: errors });
  };
  handleRemoteStreamAdded = event => {
    //console.log(typeof event.streams[0], event.streams[0])
    if (this.remoteAdded.added === false) {
      this.remoteAdded.added = true;
      let client = this.remoteClients[this.remoteClients.length - 1];
      this.createVideo().then(video => {
        this.remoteAdded.videoEl = video.vid;
        if (video.vid.srcObject == null) {
          video.vid.srcObject = event.streams[0];
          video.vid.setAttribute("data-id", client);
          video.vidWrap.setAttribute("data-id", client);
          this.remoteAdded.id = event.streams[0].id;
        }
      });
    }
    if (
      this.remoteAdded.added === true &&
      this.remoteAdded.id === event.streams[0].id
    ) {
      this.remoteAdded.videoEl.srcObject = event.streams[0];
      this.remoteAdded.added = false;
    }
  };

  handleRemoteStreamRemoved = event => {
    console.log("removed", event);
  };
  handleIceCandidate = (event, remoteId) => {
    if (event.candidate) {
      //console.log(event.candidate)
      let candidate = {
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      };
      this.socket.emit("signal", candidate, remoteId);
    } else {
      console.log("End of candidates.");
      this.socket.emit("signal", { type: "connected" });
    }
  };
  createOffer = (peer, cb) => {
    console.log("CREATING OFFER");
    peer
      .createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
      .then(
        offer => {
          return peer
            .setLocalDescription(new RTCSessionDescription(offer))
            .then(() => {
              cb(offer);
            })
            .catch(this.handleLocalDescError);
        },
        err => {
          console.log("Error with creating offer ", err);
        }
      )
      .catch(this.handleOfferError);
  };
  createAnswer = (peer, cb) => {
    console.log("CREATING ANSWER");
    peer
      .createAnswer()
      .then(
        answer => {
          //console.log('answer')
          return peer
            .setLocalDescription(new RTCSessionDescription(answer))
            .then(() => {
              cb(answer);
            })
            .catch(this.handleLocalDescError);
        },
        err => {
          console.log("Error with creating answer ", err);
        }
      )
      .catch(this.handleAnswerError);
  };

  handleLeavingClient = (sessionObj, remoteId) => {
    let iterator = 0;
    let streams = document.getElementsByClassName("stream");
    let streamWraps = document.getElementsByClassName("streamWrap");
    let streamList = document.getElementById("videoStreams");
    for (let stream of streams) {
      if (stream.dataset.id === remoteId) {
        if (stream.srcObject !== null) {
          stream.srcObject.getTracks().forEach(track => {
            track.stop();
            stream.srcObject = null;
            this.remoteClients.splice(iterator, 1);
          });
        }
      }
      iterator++;
    }
    if (this.rtcs[remoteId]) {
      this.rtcs[remoteId].close();
    }
    for (let streamWrap of streamWraps) {
      if (streamWrap.dataset.id === remoteId) {
        streamList.removeChild(streamWrap);
      }
    }
    this.props.updateSession({
      clients: sessionObj.clients,
      viewers: sessionObj.viewers
    });

    delete this.rtcs[remoteId];
  };

  createSocketChannels = () => {
    if (this.socketChanneledCreated === false) {
      this.socket.on("session", sessionObj => {
        if (sessionObj.clients.length === 1) {
          sessionObj.admin = this.socket.id;
        }
        this.props.updateSession(sessionObj);
      });
      this.socket.on("connect-error", ({ type, msg }) => {
        if (type === "maxedOut") {
          this.setState({ modalErr: msg });
          setTimeout(() => {
            this.props.history.push("/");
          }, 2000);
        } else if (type === "expired") {
          this.setState({ modalErr: "Session is expired" });
          setTimeout(() => {
            this.props.history.push("/");
          }, 2000);
        } else if (type === "maxedOutTrio") {
          this.setState({ modalErr: msg });
          setTimeout(() => {
            this.props.history.push("/");
          }, 2000);
        }
      });
      this.socket.on("setup-vid-dms", users => {
        this.props.addMultiToDMs(users);
      });
      this.socket.on("admin-rights-request", (user) => {
        this.props.updateSession({admin_request: user})
      });
      this.socket.on("recieveMsgs", data => {
        this.props.updateSession({ msgs: data });
      });
      this.socket.on("pickThisVideo", videoObj => {
        this.props.sendThisVideoAction(videoObj);
      });
      this.socket.on("unpickThisVideo", videoObj => {
        this.props.unpickThisVideoAction(videoObj);
      });
      this.socket.on("adminLeftImAdminNow", () => {
        this.props.newAdmin(this.socket.id);
      });
      this.socket.on("new-session-admin", (sessionObj) => {
        this.props.updateSession(sessionObj);
      });
      this.socket.on("session-data", sessionData => {
        this.props.updateSession({ youtubeList: sessionData });
      });
      this.socket.on("giveMeVideoCurrentTime", videoObj => {
        this.props.updateSession(videoObj);
      });
      this.socket.on("hereIsVideoCurrentTime", videoObj => {
        this.props.updateSession(videoObj);
      });
      this.socket.on("sharingTweet", tweetObj => {
        this.props.sendTweetAction(tweetObj);
      });
      this.socket.on("sharingLink", link => {
        window.open(
          link,
          "mywin",
          "width=860,height=620,screenX=950,right=50,screenY=50,top=50,status=yes"
        );
      });
      this.socketChanneledCreated = true;
    }
  };

  handleSurfCleanUp = () => {
    this.remoteClients = [];
    this.rtcs;
    let streams = document.getElementsByClassName("stream");
    let streamWraps = document.getElementsByClassName("streamWrap");
    let streamList = document.getElementById("videoStreams");
    /* let iterator = 0;
		for (let stream of streams) {
				if (stream.srcObject !== null) {
					stream.srcObject.getTracks().forEach((track) => {
						track.stop();
						stream.srcObject = null;
					
					});
				}
			iterator++;
		} */
    for (let rtc in this.rtcs) {
      if (rtc) {
        this.rtcs[rtc].close();
      }
    }
    if (streams !== null) {
      for (let streamWrap of streamWraps) {
        streamList.removeChild(streamWrap);
      }
    }
  };
  createPeerRtc = (remoteId, cb) => {
    this.rtcs[remoteId] = new RTCPeerConnection(this.stunConfig);
    let currentConnection = this.rtcs[remoteId];
    currentConnection.onicecandidate = e =>
      this.handleIceCandidate(e, remoteId);
    currentConnection.ontrack = this.handleRemoteStreamAdded;
    currentConnection.onremovestream = this.handleRemoteStreamRemoved;
    if (/viewer/.test(this.props.match.params.type) === false) {
      if (this.track[0].kind === "audio") {
        this.track.reverse();
      }
      this.track.forEach(track => {
        currentConnection.addTrack(track, this.stream);
      });
    }
    if (currentConnection.setRemoteDescription) {
      cb(currentConnection);
    }
  };
  ///////////////////////////////////////////webrtc^^^ funcs////////////////////////////////////////////

  //////////////////////////////////////////////lifecycle hook//////////////////////////////////////////
  componentWillUnmount() {
    for (let rtc in this.rtcs) {
      this.rtcs[rtc].close();
    }
    this.rtcs = {};
    let streamOfMe = document.getElementById("streamOfMe");
    if (streamOfMe) {
      if (streamOfMe.srcObject !== null) {
        streamOfMe.srcObject.getTracks().forEach(track => track.stop());
        streamOfMe.srcObject = null;
      }
    }
    let streams = document.querySelectorAll(".stream");
    if (streams !== null && streams.length !== 0) {
      for (let stream of streams) {
        if (stream.srcObject !== null) {
          let tracks = stream.srcObject.getTracks();
          tracks.forEach(function(track) {
            track.stop();
          });
          streams = null;
        }
      }
    }
    this.socket.emit("leave", this.props.session.sessionKey);
    this.socket.removeListener("createOrJoin");
    this.socket.removeListener("signal");
    this.socket.removeListener("session");
    this.socket.removeListener("setup-vid-dms");
    this.socket.removeListener("recieveMsgs");
    this.socket.removeListener("pickThisVideo");
    this.socket.removeListener("unpickThisVideo");
    this.socket.removeListener("adminLeftImAdminNow");
    this.socket.removeListener("new-session-admin");
    this.socket.removeListener("youtubeList");
    this.socket.removeListener("giveMeVideoCurrentTime");
    this.socket.removeListener("hereIsVideoCurrentTime");
    this.socket.removeListener("sharingTweet");
    this.socket.removeListener("sharingLink");
    this.socket.removeListener("connect-error");
    this.props.updateSession({
      inSession: false,
      activePlatform: "youtube",
      id: "",
      admin: "",
      clients: [],
      viewers: [],
      exists: false,
      sessionKey: "",
      creatingSession: false,
      videoId: "",
      msgs: [],
      noCam: false
    });
  }

  startAsStreamer = () => {
    if (this.props.match.params.type === "stream") {
      document.getElementById("streamOfMe").style.display = "none";
      this.createVideo("streamer_stream", "muted").then(({ vid }) => {
        this.startOrJoin(vid);
      });
    }
  };
  startOrJoin = videoEl => {
    videoEl = videoEl ? videoEl : document.getElementById("streamOfMe");
    if (videoEl !== null) {
      videoEl.style.display = "block";
    }
    this.startStream(videoEl)
      .then(() => {
        this.alreadyStarted = true;
        let startingOrJoining;
        let session = JSON.parse(JSON.stringify(this.props.session));
        if (session.creatingSession) {
          startingOrJoining = session.creatingSession ? true : false;
        } else {
          startingOrJoining = false;
        }
        session.inSession = true;
        session.noCam =
          this.props.match.params.type === "viewer" ? true : false;
        session.sessionKey = this.props.match.params.id;
        session.creatingSession = startingOrJoining;
        if (this.props.auth.user.userName) {
          session.user = this.props.auth.user;
        } else {
          session.user = this.props.auth.guest;
        }

        this.socket.emit("createOrJoin", session);
        this.socket.on("signal", (data, remoteId) => {
          switch (data.type) {
            case "newJoin":
              this.createPeerRtc(remoteId, rtc => {
                this.createOffer(rtc, offer =>
                  this.socket.emit("signal", offer, remoteId)
                );
                if (this.remoteClients.length < 2) {
                  this.remoteClients.push(remoteId);
                }
              });
              break;
            case "offer":
              //console.log(data.type, remoteId)
              if (this.remoteClients.length < 2) {
                this.remoteClients.push(remoteId);
              }
              this.createPeerRtc(remoteId, rtc => {
                //this.dcAnswererEvents(rtc);
                rtc
                  .setRemoteDescription(new RTCSessionDescription(data))
                  .then(() => {
                    this.createAnswer(rtc, answer =>
                      this.socket.emit("signal", answer, remoteId)
                    );
                  })
                  .catch(this.handleRemoteDescError);
              });
              break;
            case "answer":
              //console.log(data.type, remoteId)
              this.rtcs[remoteId]
                .setRemoteDescription(new RTCSessionDescription(data))
                .catch(this.handleRemoteDescError);
              break;
            case "candidate":
              let hisCandidate = new RTCIceCandidate({
                sdpMLineIndex: data.label,
                candidate: data.candidate
              });
              if (
                this.rtcs[remoteId] !== undefined &&
                this.rtcs[remoteId].remoteDescription.type
              ) {
                this.rtcs[remoteId]
                  .addIceCandidate(hisCandidate)
                  .catch(this.handleCandidateError);
              }
              break;
            case "clientLeft":
              this.handleLeavingClient(data.sessionObj, remoteId);
              break;
            case "connected":
              break;
          }
        });
      })
      .catch(err => console.log(err));
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevState.errors !== this.state.errors) {
      setTimeout(() => {
        this.setState({ errors: {} });
      }, 2000);
    }
    if (this.props.session.msgs !== prevProps.session.msgs) {
      const chatBox = document.getElementById("chatMsgsShow");
      if (chatBox !== null) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }
    if (this.props.auth.user !== prevProps.auth.user) {
      ///waiting for props to load
      //if using a invite link /room=:id also handles reloads
      //notShareLink wont exist in props because its a direct enter via share link
      if (!this.props.session.notShareLink && !this.alreadyStarted) {
        this.socket.emit("setup-vid-dms", this.props.auth.user);
        if (/stream/.test(this.props.match.params.type)) {
          this.startAsStreamer();
        } else {
          this.startOrJoin();
        }
      }
    }
    // else if (this.props.session.surfing) {
    //   if (prevProps.location.pathname !== this.props.location.pathname) {
    //     //this.handleSurfCleanUp();
    //     this.socket.emit("leave", prevProps.session.sessionKey);
    //     if (/stream/.test(this.props.match.params.id.sessionType)) {
    //       this.startAsStreamer();
    //     } else {
    //       this.startOrJoin();
    //     }
    //   }
    // }

    if (this.props.session.clients !== prevProps.session.clients) {
      let streams = document.getElementsByClassName("streamWrap");
      let clients = this.props.session.clients.length;
      let constraints = {
        width: "100%",
        height: clients < 3 ? "auto" : "50%"
      };

      for (let stream of streams) {
        stream.style.width = constraints.width;
        stream.style.height = constraints.height;
      }
    }
    /* navigator.mediaDevices.ondevicechange = () => {
			this.updateDevices();
		};*/
    ///////////////////////////////////////////////
  }

  componentDidMount() {
    console.log("MOUNTED");
    this.createSocketChannels();
    ////start session button provides creatingSession = true in props if creating session
    ////notShareLink is provided if clicked via join button
    ///those props being passed to the server which will handle
    ///those entrances accordingly
    ///never pass the whole sessionObj around to everyone
    this.socket.emit("setup-vid-dms", this.props.auth.user);
    navigator.mediaDevices.ondevicechange = () => {
      this.updateDevices();
    };
    if (this.props.session.notShareLink || this.props.session.creatingSession) {
      if (this.props.session.sessionKey && !this.alreadyStarted) {
        if (this.props.match.params.type === "stream") {
          this.startAsStreamer();
        } else {
          this.startOrJoin();
        }
      }
    }
  }

  ///////////////////////////////////////////lifecycle^^^hooks////////////////////////////////////////
  askForVideoCurrentTime = () => {
    setTimeout(() => {
      this.socket.emit("giveMeVideoCurrentTime", "wtf");
    }, 500);
  };
  sendVideoCurrentTime = (playState, cb) => {
    setTimeout(() => {
      this.socket.emit("hereIsVideoCurrentTime", playState);
      cb();
    }, 1000);
  };
  pickPlatform = platform => {
    this.renderPlatformMenu();
    this.props.updateSession({ activePlatform: platform });
  };
  renderPlatform = () => {
    /* 	console.log(this.props.session)
		if(this.props.session.sessionType==='stream' && this.props.session.imStreamer){
			return '';
		} else { */
    if (this.props.session.activePlatform === "youtube") {
      return (
        <SessionContentYoutube
          sendVideoSignal={this.sendVideoSignal}
          saveYoutubeListRedis={this.saveYoutubeListRedis}
          unpickThisVideo={this.unpickThisVideo}
          sendVideoCurrentTime={this.sendVideoCurrentTime}
          askForVideoCurrentTime={this.askForVideoCurrentTime}
          socket={this.socket}
        />
      );
    } else if (this.props.session.activePlatform === "dailymotion") {
      return (
        <SessionContentDailymotion
          sendVideoSignal={this.sendVideoSignal}
          saveYoutubeListRedis={this.saveYoutubeListRedis}
          unpickThisVideo={this.unpickThisVideo}
          sendVideoCurrentTime={this.sendVideoCurrentTime}
          askForVideoCurrentTime={this.askForVideoCurrentTime}
          socket={this.socket}
        />
      );
    } else if (this.props.session.activePlatform === "twitch") {
      return (
        <SessionContentTwitch
          sendVideoSignal={this.sendVideoSignal}
          unpickThisVideo={this.unpickThisVideo}
          sendVideoCurrentTime={this.sendVideoCurrentTime}
          askForVideoCurrentTime={this.askForVideoCurrentTime}
          socket={this.socket}
        />
      );
    } else if (this.props.session.activePlatform === "twitter") {
      return (
        <SessionContentTwitter socket={this.socket} sendTweetToOthers={this.sendTweetToOthers} />
      );
    }
  };
  //};

  updateDevices = () => {
    this.props.getDevices();
  };
  openDMs = dm_user => {
    // let modals = document.querySelectorAll(".profileModal");
    // for (let mod of modals) {
    //   mod.style.display = "none";
    // }
    dm_user.user_id = dm_user._id;
    //console.log(dm_user)
    if (this.props.auth.user.dms[dm_user.user_id]) {
      dm_user.thread_id = this.props.auth.user.dms[dm_user._id].thread_id;
    }
    delete dm_user._id;

    this.props.openDMs(dm_user, user => {
      this.socket.emit("clear-notifs", user);
    });
  };

  addToSurkl = (user, surkl) => {
    surkl.admin = this.props.auth.user._id;
    surkl.adminName = this.props.auth.user.userName;
    surkl.adminAvatar = this.props.auth.user.avatarUrl;
    this.socket.emit("add-to-surkl", user, surkl);
    document.getElementById("feedback-ani-1").style.display = "block";
    setTimeout(() => {
      document.getElementById("feedback-ani-1").style.display = "none";
    }, 1500);
  };

  giveAdminRights = (id) => {
    console.log(id)
    this.socket.emit("change-session-admin", this.props.session, id);
    this.props.updateSession({admin_request: null});
  };
  askForAdminRights = (admin) => {
    console.log(this.socket.socketId)
    let userObj = spliceObj(this.props.auth.user, ['userName', '_id'])
    userObj.socketId = this.socket.id;
    this.socket.emit('admin-switch-request', userObj, admin);
  };
  askForAdminRightsBanner = () =>{
    console.log(this.props.session.admin_request)
    if(this.props.session.admin_request!==null){
      return (
        <div id="admin-ask-banner">
          <div id="admin-ask-text">{this.props.session.admin_request.userName} is asking to take control</div>
          <div id="admin-ask-buttons">
            <button onClick={()=>this.giveAdminRights(this.props.session.admin_request.socketId)}>Give</button>
            <button>Deny</button>
          </div>
        </div>
      )
    } else {
      return "";
    }
  }
  updateClientList = () => {
    if (
      this.props.session.clients !== undefined &&
      this.props.session.clients.length > 0
    ) {
      return this.props.session.clients.map(client => {
        let url = client.avatarUrl ? client.avatarUrl : "/assets/whitehat.jpg";
        if (client.isAdmin) {
          return (
            <div key={client._id} className="clientImgRightWrap">
              <img
                style={{
                  border: "2px solid #FECC44",
                  boxSizing: "border-box"
                }}
                src={url}
                className="clientSquareAv"
              />
              <ProfileModal
                curr_user={this.props.auth.user}
                askForAdminRights={this.askForAdminRights}
                addToSurkl={() =>
                  this.addToSurkl(client, this.props.auth.user.mySurkl)
                }
                openDMs={this.openDMs}
                position={{ bottom: "58px", left: "-10px" }}
                triangle={{ bottom: true, position: { marginLeft: "20px" } }}
                simple={false}
                id={"p-modal-" + client.id}
                user={client}
              />
            </div>
          );
        } else {
          return (
            <div className="clientImgRightWrap" key={client._id}>
              <img src={url} className="clientSquareAv" />
              <ProfileModal
                curr_user={this.props.auth.user}
                giveAdminRights={() =>this.giveAdminRights(client.socketId)}
                addToSurkl={() =>
                  this.addToSurkl(client, this.props.auth.user.mySurkl)
                }
                openDMs={this.openDMs}
                position={{ bottom: "58px", left: "-10px" }}
                triangle={{ bottom: true, position: { marginLeft: "20px" } }}
                simple={false}
                id={"p-modal-" + client.id}
                user={client}
              />
            </div>
          );
        }
      });
    }
  };
  updateViewerList = () => {
    if (
      this.props.session.viewers !== undefined &&
      this.props.session.viewers.length > 0
    ) {
      return this.props.session.viewers.map(viewer => {
        let url = viewer.avatarUrl ? viewer.avatarUrl : "/assets/whitehat.jpg";
        if (viewer.isAdmin) {
          return (
            <div className="viewerImgRightWrap" key={viewer._id}>
              <img
                style={{
                  border: "2px solid #FECC44",
                  boxSizing: "border-box"
                }}
                src={url}
                className="viewerSquareAv"
              />
              <ProfileModal
                addToSurkl={() =>
                  this.addToSurkl(viewer, this.props.auth.user.mySurkl)
                }
                openDMs={this.openDMs}
                position={{ bottom: "52px", left: "-14px" }}
                triangle={{ bottom: true, position: { marginLeft: "20px" } }}
                simple={false}
                id={"p-modal-" + viewer.id}
                user={viewer}
              />
            </div>
          );
        } else {
          return (
            <div className="viewerImgRightWrap" key={viewer._id}>
              <img key={viewer.id} src={url} className="viewerSquareAv" />
              <ProfileModal
                addToSurkl={() =>
                  this.addToSurkl(viewer, this.props.auth.user.mySurkl)
                }
                
                openDMs={this.openDMs}
                position={{ bottom: "52px", left: "-14px" }}
                triangle={{ bottom: true, position: { marginLeft: "20px" } }}
                simple={false}
                id={"p-modal-" + viewer.id}
                user={viewer}
              />
            </div>
          );
        }
      });
    }
  };
  sendMsg = msgText => {
    let date = new Date(Date.now());
    let locale = date.toLocaleDateString();
    let minutes =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let time = date.getHours() + ":" + minutes;
    let fullDate = locale + " " + time;
    let msg = {
      avatar: this.props.auth.user.avatarUrl
        ? this.props.auth.user.avatarUrl
        : this.props.auth.guest.avatar,
      userName: this.props.auth.user.userName
        ? this.props.auth.user.userName
        : this.props.auth.guest.userName,
      date: fullDate,
      msgText: msgText,
      sessionKey: this.props.session.sessionKey
    };
    this.socket.emit("sendMsg", msg);
  };
  onInputChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  renderChatText = () => {
    return this.props.session.msgs.map((msg, ind) => {
      let possibleUrlImg;
      let date = new Date(msg.date);
      let locale = date.toLocaleDateString();
      let minutes =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      let time = date.getHours() + ":" + minutes;
      let fullDate = locale + " " + time;
      let url = msg.avatar ? msg.avatar : "/assets/whitehat.jpg";
      if (msg.image_id) {
        return (
          <div key={ind} className="session-chat-msg-wrap">
            <div
              style={{ paddingTop: msg.userName ? "5px" : "0px" }}
              className="session-chat-msg"
            >
              <div className="session-chat-msg-av-wrap">
                {url ? (
                  <img
                    onClick={() => this.createMention(msg.userName)}
                    data-user={JSON.stringify(msg)}
                    className="session-chat-msgAvatar"
                    src={url}
                  />
                ) : (
                  ""
                )}
              </div>
              <div className="session-chat-HeaderNmsg">
                {msg.userName ? (
                  <div className="session-chat-MsgUserInfo">
                    <div className="session-chat-MsgName">{msg.userName}</div>
                    <div className="session-chat-MsgDate">{fullDate}</div>
                  </div>
                ) : (
                  ""
                )}
                <div className="session-chat-MsgText">
                  <img
                    style={{ display: "none", marginTop: "7px" }}
                    className="img"
                    data-imageid={msg.image_id}
                    src={"oof"}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        if (
          /(http|https)/.test(msg.msgText) &&
          /(.com|.net|.io|.us| .uk |.info|.org|.co)/.test(msg.msgText) &&
          /(jpeg|jpg|gif|png)/.test(msg.msgText)
        ) {
          possibleUrlImg = (
            <img
              style={{ display: "none" }}
              onLoad={this.resizeImg}
              src={msg.msgText}
            />
          );
        } else {
          possibleUrlImg = msg.msgText;
          if (/(\ ?@.*)/g.test(msg.msgText)) {
            let split = msg.msgText.split(" ");
            possibleUrlImg = split.map((msg, key) => {
              if (/^(\ ?@.*)/.test(msg)) {
                return (
                  <span style={{ color: "#FFCD44" }} key={key}>
                    {" " + msg + " "}
                  </span>
                );
              } else {
                return msg;
              }
            });
          }
        }
        return (
          <div key={ind} className="session-chat-msg-wrap">
            <div
              style={{ paddingTop: msg.userName ? "5px" : "0px" }}
              className="session-chat-msg"
            >
              <div className="session-chat-msg-av-wrap">
                {url ? (
                  <img
                    onClick={() => this.createMention(msg.userName)}
                    data-user={JSON.stringify(msg)}
                    className="session-chat-msgAvatar"
                    src={url}
                  />
                ) : (
                  ""
                )}
              </div>
              <div className="session-chat-HeaderNmsg">
                {msg.userName ? (
                  <div className="session-chat-MsgUserInfo">
                    <div className="session-chat-MsgName">{msg.userName}</div>
                    <div className="session-chat-MsgDate">{fullDate}</div>
                  </div>
                ) : (
                  ""
                )}
                <div
                  style={{ padding: msg.userName ? "5px" : "0px" }}
                  className="session-chat-MsgText"
                >
                  {possibleUrlImg}
                </div>
              </div>
            </div>
          </div>
        );
      }
    });
  };

  createVideo = (id = "", muted = null) => {
    return new Promise(resolve => {
      let constraints = {
        width: "100%",
        height: this.props.session.clients.length < 3 ? "auto" : "50%"
      };
      let streamRows = document.getElementById("videoStreams");
      let videoWrap = document.createElement("div");
      videoWrap.setAttribute("class", "streamWrap");
      videoWrap.style.width = constraints.width;
      videoWrap.style.height = constraints.height;
      let video = document.createElement("video");
      video.autoplay = true;
      video.setAttribute("id", id);
      video.setAttribute("class", "stream");
      if (muted !== null) {
        video.muted = true;
      }
      videoWrap.appendChild(video);
      streamRows.appendChild(videoWrap);
      resolve({ vid: video, vidWrap: videoWrap });
    });
  };
  toggleAudio = () => {
    let icon = document.getElementById("mic-icon");
    let sess = this.props.session;
    let videoElId =
      sess.imStreamer && sess.sessionType === "stream"
        ? "streamer_stream"
        : "streamOfMe";
    let aud = document.getElementById(videoElId).srcObject.getAudioTracks();
    if (this.state.talk === true) {
      for (let i = 0; i < aud.length; i++) {
        aud[i].enabled = false;
      }
      this.setState({ talk: false }, () => {
        icon.style.fill = "#353535";
      });
    } else {
      for (let i = 0; i < aud.length; i++) {
        aud[i].enabled = true;
      }
      this.setState({ talk: true }, () => {
        icon.style.fill = "#F4FBFB";
      });
    }
  };
  toggleVideo = () => {
    let sess = this.props.session;
    let icon = document.getElementById("cam-icon");
    let videoElId =
      sess.imStreamer && sess.sessionType === "stream"
        ? "streamer_stream"
        : "streamOfMe";
    let vid = document.getElementById(videoElId).srcObject.getVideoTracks();
    if (this.state.showMyStream === true) {
      for (let i = 0; i < vid.length; i++) {
        vid[i].enabled = false;
      }
      this.setState({ showMyStream: false }, () => {
        icon.style.fill = "#353535";
      });
    } else {
      for (let i = 0; i < vid.length; i++) {
        vid[i].enabled = true;
      }
      this.setState({ showMyStream: true }, () => {
        icon.style.fill = "#F4FBFB";
      });
    }
  };
  startStream = videoEl => {
    return new Promise(resolve => {
      if (/viewer/.test(this.props.match.params.type) === false) {
        resolve();
        // if (videoEl !== null && videoEl.srcObject === null) {
        //   if (this.stream === null) {
        //     navigator.mediaDevices
        //       .getUserMedia({
        //         audio: {
        //           deviceId: this.props.session.mic
        //             ? this.props.session.mic
        //             : "default"
        //         },
        //         video: {
        //           width: 250,
        //           height: 250,
        //           deviceId: this.props.session.cam
        //             ? this.props.session.cam
        //             : "default"
        //         }
        //       })
        //       .then(stream => {
        //         videoEl.srcObject = stream;
        //         this.stream = stream;
        //         stream.getTracks().forEach(track => {
        //           this.track.push(track);
        //         });

        //         resolve();
        //       })
        //       .catch(err => {
        //         console.log(err);
        //       });
        //   } else {
        //     videoEl.srcObject = this.stream;
        //     resolve();
        //   }
        // } else {
        //   resolve();
        // }
      } else {
        resolve();
      }
    });
  };

  openGoogleWindow = () => {
    window.open(
      "https://google.com/",
      "mywin",
      "width=860,height=620,screenX=950,right=50,screenY=50,top=50,status=yes"
    );
  };
  platformsMenu = () => {
    let visibility = this.state.platformMenuVisible ? "flex" : "none";
    return (
      <Dropdown
        menuTitle="Platforms"
        menuTypeArrow="platformsArrow"
        visibility={visibility}
      >
        <div
          onClick={() => this.pickPlatform("youtube")}
          className="menuItem_mutable"
        >
          Youtube
        </div>
        <div
          onClick={() => this.pickPlatform("dailymotion")}
          className="menuItem_mutable"
        >
          Daily Motion
        </div>
        <div
          onClick={() => this.pickPlatform("twitter")}
          className="menuItem_mutable"
        >
          Twitter
        </div>
        <div
          onClick={() => this.pickPlatform("twitch")}
          className="menuItem_mutable"
        >
          Twitch
        </div>
        <div onClick={this.openGoogleWindow} className="menuItem_mutable">
          Google
        </div>
        <div className="menuInputWrap_mutable">
          <input
            onKeyDown={this.shareLink}
            onChange={this.onInputChange}
            placeholder="Share Link"
            value={this.state.shareLink}
            name="shareLink"
            className="menuInput_mutable"
          />
        </div>
        {/*<div className="menuItem_mutable">Soundcloud</div>
				<div className="menuItem_mutable">Medium</div>
				<div className="menuItem_mutable">Instagram</div>
				<div className="menuItem_mutable">Reddit</div> */}
      </Dropdown>
    );
  };
  renderPlatformMenu = () => {
    this.setState({
      platformMenuVisible: this.state.platformMenuVisible ? false : true
    });
  };
  renderErrors = () => {
    let error = this.state.errors.answer
      ? this.state.errors.answer
      : this.state.errors.offer
      ? this.state.errors.offer
      : this.state.errors.candidates
      ? this.state.errors.candidates
      : this.state.errors.localDescription
      ? this.state.errors.localDescription
      : this.state.errors.remoteDescription
      ? this.state.errors.remoteDescription
      : "";
    return (
      <div
        style={{ display: error.length > 1 ? "flex" : "none" }}
        id="streamsErrorModal"
      >
        {error}
      </div>
    );
  };
  videoSettings = () => {
    if (/viewer/.test(this.props.match.params.type)) {
      return (
        <div id="sessionLeftAsideSettings">
          <div id="restOfSettings">
            <div id="viewersInRoom">{this.updateViewerList()}</div>
            {/* <select id="sessVidDevices" />
        <select id="sessAudDevices" /> */}
          </div>
        </div>
      );
    } else {
      return (
        <div id="sessionLeftAsideSettings">
          <video id="streamOfMe" muted="muted" autoPlay />
          <div
            style={{
              marginLeft: /stream/.test(this.props.match.params.type)
                ? "25px"
                : "10px"
            }}
            id="toggleDevices"
          >
            <div onClick={this.toggleAudio} id="toggleAudio">
              <svg
                aria-hidden="true"
                focusable="false"
                id="mic-icon"
                data-prefix="fas"
                data-icon="microphone"
                role="img"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 352 512"
              >
                <path d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z" />
              </svg>
            </div>
            <div onClick={this.toggleVideo} id="toggleVideo">
              <svg
                aria-hidden="true"
                id="cam-icon"
                focusable="false"
                data-prefix="fas"
                data-icon="video"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
              >
                <path d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zm189.4 37.7L416 177.3v157.4l109.6 75.5c21.2 14.6 50.4-.3 50.4-25.8V127.5c0-25.4-29.1-40.4-50.4-25.8z" />
              </svg>
            </div>
          </div>
          <div id="restOfSettings">
            <div id="whosInRoom">
              {/trio/.test(this.props.match.params.type)
                ? this.updateClientList()
                : ""}
            </div>
            <div id="viewersInRoom">{this.updateViewerList()}</div>
            {/* <select id="sessVidDevices" />
					<select id="sessAudDevices" /> */}
          </div>
        </div>
      );
    }
  };
  
  //////////////////////////////////////////////RENDER//////////////////////////////////////////////////
  render() {
    if (this.props.auth.user == null || this.props.session === null) {
      return (
        <div id="spinnerWrap">
          <div className="spinner" />
        </div>
      );
    } else {
      return (
        <div onClick={this.closeMenus} id="session">
         
          <div
            style={{
              display:
                this.state.modalErr.length > 0 &&
                this.state.modalErr.length !== null
                  ? "flex"
                  : "none"
            }}
            id="session-err-modal-bg"
          >
            <div id="session-err-modal">
              <div id="sadIcon" />
              <div id="msg">{this.state.modalErr}</div>
            </div>
          </div>
          {/*////////////////////////////////////*/}
          <div id="sessionLeftAside">
            <div id="videoStreams">
              {/* <div className="streamWrap">
								<video className="streamTest" autoPlay></video>
							</div>  */}
              {this.renderErrors()}
            </div>
            {this.videoSettings()}
          </div>
          <div id="sessionCenterAside">
            <div id="discussContent">
              <div id="platformMenuAligner">
                <div
                  onClick={this.renderPlatformMenu}
                  id="contentDropdownIcon"
                  className="discHeaderIcon"
                />
                {this.platformsMenu()}
              </div>
              {this.renderPlatform()}
            </div>
            <div id="chatSection">
              <div id="chatBox">
                <ChatBox
                  match={this.props.match}
                  type="session"
                  socket={this.props.socket}
                />
              </div>
            </div>
          </div>
          {this.askForAdminRightsBanner()}
        </div>
      );
    }
  }
}
Session.propTypes = {
  auth: PropTypes.object,
  session: PropTypes.object,
  history: PropTypes.object,
  match: PropTypes.object,
  devices: PropTypes.object,
  getDevices: PropTypes.func,
  sendThisVideoAction: PropTypes.func,
  newAdmin: PropTypes.func,
  updateSession: PropTypes.func,
  unpickThisVideoAction: PropTypes.func,
  sendTweetAction: PropTypes.func,
  app: PropTypes.object,
  closeMenus: PropTypes.func,
  socket: PropTypes.object,
  openDMs: PropTypes.func,
  addMultiToDMs: PropTypes.func,
  addSessDMs: PropTypes.func,
  dms: PropTypes.object,
  removeKeys: PropTypes.func,
  location: PropTypes.object
};
function stateToProps(state) {
  return {
    auth: state.auth,
    session: state.session,
    devices: state.devices,
    app: state.app,
    dms: state.dms
  };
}
export default connect(stateToProps, {
  sendTweetAction,
  getDevices,
  sendThisVideoAction,
  newAdmin,
  unpickThisVideoAction,
  updateSession,
  closeMenus,
  openDMs,
  addMultiToDMs,
  addSessDMs,
  removeKeys
})(Session);
