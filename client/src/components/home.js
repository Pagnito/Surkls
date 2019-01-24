import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import {tester} from '../actions/actions'
import '../styles/App.scss';

class Home extends Component {
  componentDidMount(){
    this.props.tester();
  }
  componentDidUpdate(prevProps){
    if(this.props.test!==prevProps.test){
      console.log(this.props.test)
    }
  }
  render() {
    return (
      <div>Home</div>
    );
  }
}
Home.propTypes = {
  test: PropTypes.object,
  tester: PropTypes.func
}
function mapStateToProps(state){
  return {
    test: state.test,
  }
}

export default connect(mapStateToProps, {tester})(Home);
