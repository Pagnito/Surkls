import React, { Component } from 'react';
import './surkls.scss';
 class Surkls extends Component {
   constructor(props){
     super(props);
     this.state = {
       surkls: []
     }
   }
  componentDidMount(){
     fetch('/api/surkls').then(res=>res.json())
     .then(surkls=>{
      this.setState({surkls})
     })
   }
   displaySurkls = () => {
     return this.state.surkls.map((surkl, ind)=>{
      return (
        <div key={ind} className="surkl">
          <div className="surkls-surkl-banner">
            <div className="surkls-surkl-logo"></div>
          </div>
          <div className="surkls-surkl-info">
            <div className="surkls-surkl-name">{surkl.name}</div>
            <div className="surkls-surkl-motto">{'"'+surkl.motto+'"'}</div>
          </div>
          <div className="surkls-surkl-top-users">
            {surkl.members.map((member, ind)=>{
              return (
                <img key={ind} src={member.avatarUrl} className="surkls-surkl-member"/>
              )
            })}
          </div>
          <div className="surkls-surkl-actionbtns">
            <div className="surkls-surkl-actionbtn" >Join Surkl</div>
          </div>
        </div>
      )
     })
   }

  render() {
    return (
      <div id="surkls-list">
        {this.displaySurkls()}
      </div>
    )
  }
}
export default Surkls;