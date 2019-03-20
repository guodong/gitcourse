import React, {Component} from 'react';
import './App.css';
import {Layout, Menu, Card, Icon, Col, Row, List, Button} from 'antd';
import {inject, observer} from "mobx-react";
import {Route, BrowserRouter as Router} from "react-router-dom";
import Course from "./Course";
import Scenario from "./Scenario";

const {Header, Content, Footer} = Layout;
const gridStyle = {
  width: '25%',
  textAlign: 'left',
  cursor: 'pointer'
};

class App extends Component {
  render() {console.log(this.props.store.currentScenario)
    return (
      <Router>
        <div className="wrapper">
          <div style={{background: '#345d86'}}>
            <div style={{fontSize: 24, color: '#fff', float: 'left'}}><img
              src='http://kfcoding.com/static/logo-min.d61eb61d.png' style={{height: 64}}/> GitCourse
            </div>
          </div>
          {this.props.store.currentScenario ?
            <Scenario/>
            :
            <Course/>
          }
          {/*<Route exact path="/" component={Course}/>*/}
          {/*<Route path="/scenario" component={Scenario}/>*/}
        </div>
      </Router>
    );
  }
}

export default inject('store')(observer(App));
