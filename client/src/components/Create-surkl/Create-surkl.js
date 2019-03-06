import React, { Component } from 'react';
import './create-surkl.scss';
class CreateSurkl extends Component {
  constructor(props){
    super(props);
    this.state = {
      name:'',
      image_file: '',
      name_placeholder: ''
    }
    this.categories = ['Gaming', 'Travel', 'Nature', 'Art',
     'Anime', 'Code', 'Sports','Business', 'Entrepreneurship',
     'Health', 'Politics', 'Fashion'
    ]
    this.motto;
  }
componentDidMount(){
  let phrase = ['N','a','m','e', ' ', 'Y', 'o','u','r', ' ', 'S','u','r','k','l'];
  let phraseStr = ''
  let i = 0;
  let nameYourSurkl = document.getElementById('nameYourSurkl');
  if(nameYourSurkl!==null && nameYourSurkl!==undefined){
    setTimeout(()=>{
      let int = setInterval(()=>{
        phraseStr+=phrase[i]
        nameYourSurkl.placeholder = phraseStr
        i++
        if(i===15){
          clearInterval(int)
        }
      },100)
    },600)  
  }
}
  arrows = () => {
    return (
      <div className="create-surkl-arrows">
        <div className="create-surkl-left-arrow create-surkl-arrow"></div>
        <div className="create-surkl-right-arrow create-surkl-arrow"></div>
      </div>
    )
  }
  nameYourSurkl =()=>{
    return (
      <div  className="name-your-surkl">
        <input id="nameYourSurkl"  className="name-your-surkl-input"/>
        {this.arrows()}
      </div>
    )
  }
  startProcess = () =>{
    let steps = [this.nameYourSurkl()]
    return steps
  }
  render() {
    return (
      <div id="create-surkl">
        {this.startProcess()[0]}
      </div>
    )
  }
}

export default CreateSurkl
