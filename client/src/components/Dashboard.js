import React, { Component } from 'react'
import {connect} from 'react-redux';
import {updateDashboard} from 'actions/actions';
import PropTypes from 'prop-types';
import "styles/dashboard.scss";
class Dashboard extends Component {
  constructor(props){
    super(props)
    this.state = {
      search1: '',
      search2: '',
      search3: ''
    }
   
    this.newsSourcesApi = 'https://newsapi.org/v2/sources?apiKey=97956770cdd74961adbd7079b5dd6257';
    this.newsApi = 'https://newsapi.org/v2/everything?apiKey=97956770cdd74961adbd7079b5dd6257&q=';
    this.topHeadlines = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=97956770cdd74961adbd7079b5dd6257'
  }
  componentDidMount(){
    this.fetchNewsSources()
    this.fetchNews()
    setInterval(()=>{
      this.fetchNews()
    },1000*60)
 
  }
 onEnter = (e) =>{
   if(e.key=='Enter'){
    this.fetchNews()
   }
  }
  onInputChange = (e) =>{
    this.setState({[e.target.name]: e.target.value})
  }
  componentDidUpdate(prevProps){
    let prop = this.props.dashboard;
  
    if(prop.activeSources!==prevProps.dashboard.activeSources){
        this.fetchNews()
      }
  }
  fetchNewsSources = () => {
    fetch(this.newsSourcesApi).then(res=>res.json())
      .then(data=>{
        let sourcesObj = {};
        //this.props.updateDashboard({newsSources:data.sources});
        data.sources.forEach(source=>{
          sourcesObj[source.id] = source;
        })
        this.props.updateDashboard({sourcesObj:sourcesObj});
      }).catch(err=>console.log(err))
  }
   renderNewsSources = () =>{
     let sources = this.props.dashboard.sourcesObj;
     let feed = [];
     let color;
     let bgcolor;
      for(let source in sources) {
        bgcolor = sources[source].isActive ? '#DEB23B' : '';
        color = sources[source].isActive ? '#282828' : '';
        let imgUrl = "https://icon-locator.herokuapp.com/icon?url=" + sources[source].url +"&amp;size=70..120..200"
        feed.push(
        <div style={{backgroundColor: bgcolor, color: color}} onClick={()=>this.subscribeToSource(sources[source].id)} key={source} className="newsSource">
          <img className="newsSourceImg" src={imgUrl}/>
          {sources[source].name}
        </div>
        )
     }
     return feed;
   }
   fetchNews = async () => { 
     console.log('FETCHING')
      let responsesObj = {};
      let length1 = this.state.search1.length;
      let length2 = this.state.search2.length;
      let length3 = this.state.search3.length;
      if(length1===0 && length2===0 && length3===0){
        let tops = await fetch(this.topHeadlines);
        let topsJson = await tops.json();
        if(this.props.dashboard.activeSources.length>0){
          topsJson.articles = topsJson.articles.filter(article=>{
            return this.props.dashboard.activeSources.indexOf(article.source.id) >-1;
          }) 
        }   
        responsesObj["Top Headlines"] = topsJson.articles;      
      } else {
        if(length1>0){
          let promise1 = await fetch(this.newsApi+this.state.search1);
          let json1 = await promise1.json();
          json1 = json1.articles.filter(article=>{
            return this.props.dashboard.activeSources.indexOf(article.source.id) >-1;
          }) 
          responsesObj[this.state.search1] = json1;
        }
        ////////////
        if(length2>0){
          let promise2 = await fetch(this.newsApi+this.state.search2);
          let json2 = await promise2.json();
  
        if(json2.articles.length>0 ){
          json2 = json2.articles.filter(article=>{
            return this.props.dashboard.activeSources.indexOf(article.source.id) >-1;
            });
            responsesObj[this.state.search2] = json2;  
          }
        }
        ///////////
        if(length3>0){
          let promise3 = await fetch(this.newsApi+this.state.search3)
          let json3 = await promise3.json();
          if(json3.articles.length>0 ){
            json3 = json3.articles.filter(article=>{
              return this.props.dashboard.activeSources.indexOf(article.source.id) >-1;
            }) 
            responsesObj[this.state.search3] = json3;  
          } 
        }  
      }
      this.props.updateDashboard({activeFeed: responsesObj});
    }
   
   renderNewsSection = (newsSection) =>{
     if(newsSection.length>0){
      return newsSection.map((article,ind)=>{
        let author = typeof(article.author)==='string' ? article.author : '';
        let date = new Date(Date.parse(article.publishedAt)).toLocaleDateString();
        return (
          <div key={ind} className="article">
            <a href={article.url} rel="noopener noreferrer" target="_blank" >
            <div style={{backgroundImage:`url(${article.urlToImage})`}} className="articleImg"></div>
            <div className="articleAuthor">By<span style={{marginLeft:'5px',color:'#DEB23B'}}>{author}</span>
              <span style={{marginLeft: '10px'}}>{article.source.name}</span>
              <span style={{marginLeft: '10px'}}>{date}</span>
            </div>
            <div className="articleTitle">{article.title}</div>
            <div className="articleText">{article.content}</div>
            </a>
          </div>
        )
      })
    }
   }
   renderNews = () =>{
     let sections = [];
     let activeFeed = this.props.dashboard.activeFeed
     if(Object.keys(activeFeed).length>0){
      for(let section in activeFeed){
        if(activeFeed[section].length>0){
          sections.push(
            <div key={section} className="newsSection">
              <div className="sectionTitle">{section}</div>
              <div className="sectionFeed">{this.renderNewsSection(activeFeed[section])}</div>
            </div>      
          )
        }
      }
     }    
      return sections;
   }
   subscribeToSource = (sourceId) => {
      let activeSources = this.props.dashboard.activeSources.slice(0)
      let sources = this.props.dashboard.sourcesObj
      if(sources[sourceId].isActive){
        sources[sourceId].isActive = false;
        activeSources = activeSources.filter(source=>{
          return source!==sourceId
        })
      } else {
        sources[sourceId].isActive = true;
        activeSources.push(sourceId);       
      }
      this.props.updateDashboard({activeSources:activeSources,
        sourcesObj: sources})    
   }
  render() {
    return (
      <div id="dashboard">
        <section id="newsSources">
          <div id="newsSourcesHeader">Subscribe To</div>
          <div id="newsSourcesFeed">{this.renderNewsSources()}</div>      
         </section>
        <section id="dashboardCenter">
          <div id="feedInputs">
            <input onChange={this.onInputChange} onKeyDown={this.onEnter} value={this.state.search1} id="dashSearch1" className="dashSearch" name="search1" placeholder="Subscribe to a topic"/>
            <input onChange={this.onInputChange} onKeyDown={this.onEnter} value={this.state.search2} id="dashSearch2" className="dashSearch" name="search2" placeholder="Subscribe to a topic"/>
            <input onChange={this.onInputChange} onKeyDown={this.onEnter} value={this.state.search3} id="dashSearch3" className="dashSearch" name="search3" placeholder="Subscribe to a topic"/>
          </div>
        <div id="dashboardFeed">
        {this.renderNews()}
       
        </div>
        </section>
       <section id="dashboardSurkls">
          <div id="dashboardSurklsHeader">Surkls</div>
       </section>
      </div>
    )
  }
}
Dashboard.propTypes = {
  auth: PropTypes.object,
  dashboard: PropTypes. object,
  updateDashboard: PropTypes.func
}
function stateToProps(state){
  return {
    auth: state.auth.user,
    dashboard: state.dashboard
  }
}
export default connect(stateToProps, {updateDashboard})(Dashboard);