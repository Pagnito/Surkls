import React, { Component } from 'react'
import {connect} from 'react-redux';
import {updateDashboard, closeMenus} from 'actions/actions';
import PropTypes from 'prop-types';
import "./dashboard.scss";
class Dashboard extends Component {
  constructor(props){
    super(props)
    this.state = {
      search1: '',
      search2: '',
      search3: ''
    }
   
 
  }
  componentDidMount(){
    if(Object.keys(this.props.dashboard.sourcesObj).length===0){
      
    }
   
  }
 onEnter = (e) =>{
   if(e.key=='Enter'){

   }
  }
  onInputChange = (e) =>{
    this.props.updateDashboard({[e.target.name]: e.target.value})
  }
  closeMenus = () =>{
    if(this.props.app.menuState === 'open'){
      this.props.closeMenus({menu:'close-menus'});
    }	
	}

  componentDidUpdate(prevProps){
    let prop = this.props.dashboard;
    if(prop.activeSources!==prevProps.dashboard.activeSources){
   
      }
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
    if(this.props.auth.isAuthenticated){
      return (
        <div onClick={this.closeMenus} id="dashboard">
          <section id="newsSources">
            <div id="newsSourcesHeader">Subscribe To</div>
            <div id="newsSourcesFeed"></div>      
           </section>
          <section id="dashboardCenter">
            <div id="feedInputs">
              <input onChange={this.onInputChange} onKeyDown={this.onEnter} value={this.props.dashboard.search1} id="dashSearch1" className="dashSearch" name="search1" placeholder="Subscribe to a topic"/>
              <input onChange={this.onInputChange} onKeyDown={this.onEnter} value={this.props.dashboard.search2} id="dashSearch2" className="dashSearch" name="search2" placeholder="Subscribe to a topic"/>
              <input onChange={this.onInputChange} onKeyDown={this.onEnter} value={this.props.dashboard.search3} id="dashSearch3" className="dashSearch" name="search3" placeholder="Subscribe to a topic"/>
            </div>
          <div id="dashboardFeed">
          {}
         
          </div>
          </section>
         <section id="dashboardSurkls">
            <div id="dashboardSurklsHeader">My Surkl</div>
         </section>
        </div>
      )
    } else {
      return (
        <div id="notLoggedIn">You are not logged in</div>
      )
    }
   
  }
}
Dashboard.propTypes = {
  auth: PropTypes.object,
  dashboard: PropTypes. object,
  updateDashboard: PropTypes.func,
  closeMenus: PropTypes.func,
  app: PropTypes.object
}
function stateToProps(state){
  return {
    auth: state.auth,
    dashboard: state.dashboard,
    app: state.app
  }
}
export default connect(stateToProps, {closeMenus, updateDashboard})(Dashboard);