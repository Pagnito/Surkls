import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'styles/session-content-twitter.scss';
import { connect } from 'react-redux';
import { updateSession } from 'actions/actions';

class SessionContentTwitter extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tweetSearch: '',
			twitterSearch: '',
			twitters: [],
			tweets: [],
			tweetsSearched: false,
			twittersSearched: false,
			renderTrends: false
		};
	}
	handleInput = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};
	shareTweet = (tweetId, twitterId) => {
		let tweetObj = {
			tweetId: tweetId,
			twitterId: twitterId,
			host: 'twitter',
			recievingTweet: true
		};
		this.props.sendTweetToOthers(tweetObj);
	};
	searchTweets = (e) => {
		if (e.key === 'Enter') {
			if (this.state.tweetsSearched === true) {
				this.setState(
					{
						twittersSearched: false,
						tweetsSearched: true,
						renderTrends: false
					},
					() => {
						fetch('/api/search/tweets/' + this.state.tweetSearch)
							.then((res) => res.json())
							.then((tweets) => {
								this.props.updateSession({ tweets: tweets });
							});
					}
				);
			} else {
				fetch('/api/search/tweets/' + this.state.tweetSearch).then((res) => res.json()).then((tweets) => {
					this.setState({ tweetsSearched: true, 
													twittersSearched: false,
													renderTrends: false}, () => {
						this.props.updateSession({ tweets: tweets });
					});
				});
			}
		}
	};
	searchTrends = () => {
		if (this.props.session.trends.length===0) {
			fetch('/api/twitter/trends').then((res) => res.json()).then((trends) => {
				this.setState(
					{
						renderTrends: true,
						twittersSearched: false,
						tweetsSearched: false
					},
					() => {
						this.props.updateSession({
								trends: trends					
						});
					}
				);
			});
		} else {
			this.setState({
				renderTrends: true,
				twittersSearched: false,
				tweetsSearched: false
			});
		}
	};
	searchTwitters = (e) => {
		if (e.key === 'Enter') {
			this.setState(
				{
					twittersSearched: true,
					tweetsSearched: false,
					renderTrends: false
				},
				() => {		
						fetch('/api/search/twitters/' + this.state.twitterSearch)
						.then((res) => res.json())
						.then((twitters) => {
							this.props.updateSession({ twitters: twitters });
						});
					}				
			);
		}
	};
	componentWillUnmount() {
		this.props.updateSession({
			tweeting: {
				tweetId: '',
				twitterId: '',
				recievingTweet: false,
				trends: this.props.session.trends
			}
		});
	}
	componentDidUpdate = (prevProps) => {
		let prop = this.props.session;
		if (prop) {
			if (prop.tweeting !== prevProps.session && prop.tweetId.length > 0) {
				this.openTweet(prop.tweetId, prop.twitterId);
			}
		}
	};
	componentDidMount = () => {
		let prop = this.props.session;
		if(prop){
			if (prop.tweetId.length > 0) {
				this.openTweet(prop.tweetId, prop.twitterId);
			}
			if(prop){
				this.searchTrends();
			}			
		}
	};

	openTweet = (tweetId, userId) => {
		console.log('WTF');
		let url = `https://twitter.com/${userId.toString()}/status/${tweetId}`;
		window.open(url, 'mywin', 'width=660,height=620,screenX=600,right=50,screenY=50,top=50,status=yes');
	};
	openTrend = (url) => {
		window.open(url, 'mywin', 'width=660,height=620,screenX=600,right=50,screenY=50,top=50,status=yes');
	};
	openTwitterProfile = (screen_name) => {
		let url = `https://twitter.com/${screen_name}`;
		window.open(url, 'mywin', 'width=660,height=620,screenX=600,right=50,screenY=50,top=50,status=yes');
	};
	displayTrends = () => {
		if(this.props.session){
			let trends = this.props.session.trends === null ? [] : this.props.session.trends;
			if(!trends.err){
				return trends.map((trend, ind) => {
					return (
						<div onClick={() => this.openTrend(trend.url)} key={ind} className="TWtrendWrap">
							<div>{trend.name}</div>
							<div className="trendTweetsNum">
								Tweets <span style={{ marginLeft: '5px', color: 'rgba(0,0,0,.5)' }}>{trend.tweet_volume}</span>
							</div>
						</div>
					);
				});
			}
		}	
	};
	displayTwitters = () => {
		let twitters = this.props.session.twitters === null ? [] : this.props.session.twitters;
		if (this.props.session) {
			if(!twitters.err){
				return twitters.map((snippet, ind) => {
					return (
						<div
							onClick={() => this.openTwitterProfile(snippet.screen_name)}
							key={ind}
							className="twitterSnippet"
						>
							<div style={{ backgroundImage: `url(${snippet.profile_banner})` }} className="twitterBanner" />
							<div className="twitterInfo">
								<div className="twitterBio">
									<div style={{ backgroundImage: `url(${snippet.avatar})` }} className="twitterAvatar" />
									<div className="twitterName">{snippet.name}</div>
									<div className="twitterScreen_name">@{snippet.screen_name}</div>
								</div>
								<div className="twitterDescript">{snippet.description}</div>
								<div className="twitterStats">
									<div className="tweetCount">
										<div className="twitterStatTitle">Tweets</div>
										<div className="twitterStat">{snippet.statuses_count}</div>
									</div>
									<div className="followingCount">
										<div className="twitterStatTitle">Following</div>
										<div className="twitterStat">{snippet.friends_count}</div>
									</div>
									<div className="followerCount">
										<div className="twitterStatTitle">Followers</div>
										<div className="twitterStat">{snippet.followers_count}</div>
									</div>
								</div>
							</div>
						</div>
					);
				});
			}
		}
	};

	displayTweets = () => {
		let tweets = this.props.session.tweets === null ? [] : this.props.session.tweets;
		if (this.props.session) {
			if(!tweets.err){
				return tweets.map((snippet, ind) => {
					let minutesAgo = (Date.now() - Date.parse(snippet.date)) / 1000 / 60;
					let date =
						minutesAgo < 60
							? Math.floor(minutesAgo) + 'm'
							: minutesAgo < 1440
								? Math.floor(minutesAgo / 60) + 'h'
								: new Date(Date.parse(snippet.date)).toLocaleDateString();
					return (
						<div key={ind} className="TWsnippet">
							<div>
								<img className="tweetUser" src={snippet.user.img} />
							</div>
							<div className="tweetData">
								<div className="tweetUserName">
									{snippet.user.name}
									<img className="tweetBadge" src="/assets/UI-icons/twitter_badge.png" />
									<span style={{ color: 'rgba(0,0,0,.6)', fontSize: '11px' }}>
										@{snippet.user.screen_name}
									</span>
									<div className="tweetDate">{date}</div>
								</div>
								<div className="tweetText">{snippet.text}</div>
								<div className="tweetUI-icons">
									<div
										onClick={() => this.openTweet(snippet.tweetId, snippet.user.id)}
										className="TWreplyIcon TWicon"
									/>
									<div
										onClick={() => this.openTweet(snippet.tweetId, snippet.user.id)}
										className="TWretweetIcon TWicon"
									/>
									<div
										onClick={() => this.openTweet(snippet.tweetId, snippet.user.id)}
										className="TWlikeIcon TWicon"
									/>
									<div
										onClick={() => this.openTweet(snippet.tweetId, snippet.user.id)}
										className="TWdirectMsgIcon TWicon"
									/>
									<div
										onClick={() => this.shareTweet(snippet.tweetId, snippet.user.id)}
										className="shareTweet"
									>
										Share With Others
									</div>
								</div>
							</div>
						</div>
					);
				});
			}
		}
	};

	renderHeader = () => {
		return (
			<div className="TWdiscContentHeader">
				<div onClick={this.searchTrends} id="TWcontentBack" className="TWdiscHeaderIcon" />

				<div className="TWdiscHeaderSearch">
					<input
						placeholder="Search Tweets"
						onKeyDown={this.searchTweets}
						className="TWsearchBar"
						name="tweetSearch"
						value={this.state.tweetSearch}
						onChange={this.handleInput}
					/>
					<div id="TWdiscSearchIcon" className="TWdiscHeaderIcon" />
				</div>
				<div className="TWdiscHeaderSearch">
					<input
						placeholder="Search Tweeters"
						onKeyDown={this.searchTwitters}
						className="TWsearchBar"
						name="twitterSearch"
						value={this.state.twitterSearch}
						onChange={this.handleInput}
					/>
					<div id="TWdiscSearchIcon" className="TWdiscHeaderIcon" />
				</div>
			</div>
		);
	};

	render() {
		if (this.state.renderTrends) {
			return (
				<div className="TWdiscContent">
					{this.renderHeader()}
					<div className="TWdiscContentPreview">
						<div className="trendTitle">TRENDS</div>
						{this.displayTrends()}
					</div>
				</div>
			);
		} else {
			return (
				<div className="TWdiscContent">
					{this.renderHeader()}
					<div className="TWdiscContentPreview">
						{this.state.tweetsSearched ? this.displayTweets() : this.displayTwitters()}
					</div>
				</div>
			);
		}
	}
}

SessionContentTwitter.propTypes = {
	contentType: PropTypes.object,
	region: PropTypes.string,
	session: PropTypes.object,
	updateSession: PropTypes.func,
	sendTweetToOthers: PropTypes.func
};
function stateToProps(state) {
	return {
		session: state.session
	};
}
export default connect(stateToProps, { updateSession })(SessionContentTwitter);
