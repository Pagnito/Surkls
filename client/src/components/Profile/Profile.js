import React, { Component } from 'react';
import { connect } from 'react-redux';
import './profile.scss'
 class Profile extends Component {
   constructor(props){
     super(props)
     this.newsApiKey = 'sBBqsGXiYgF0Db5OV5tAw5fWsi6ohXXrTh3bhrZNQ5eIafeoD9rJTRDXrxzrrNwan2pHZrSf1gT2PUujH1YaQA'
   }
   componentDidMount(){
     
   }
  render() {
    return (
      <div id="profile">
        <section id="profileInfo">
          {/* <div id="profileBanner"></div> */}
        </section>
        <section id="surklMembers">
          <div id="surklMembersHeader">Pick a surkle</div>
        </section>
      </div>
    )
  }
}
function stateToProps(state){
  return {
    auth: state.auth
  }
}
export default connect(stateToProps)(Profile);