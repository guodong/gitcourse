import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import SplitPane from "react-split-pane";
import {resolvePath} from "mobx-state-tree";
import Step from "./Step";
import Term from "./Term";
import Editor from "./Editor";
import {Button, Icon} from "antd";

class Scenario extends Component {
  componentDidMount() {
    this.props.store.currentScenario.createContainer();
  }

  render() {
    let scenario = this.props.store.currentScenario;
    return (
      <SplitPane split="vertical" minSize={50} defaultSize={400} style={{position: 'relative'}}>
        <div style={{height: '100%'}}>
          <div style={{
            height: 40,
            lineHeight: '40px',
            textAlign: 'center',
            fontSize: 24,
            background: '#3095d2',
            color: '#fff'
          }}>{scenario.title}</div>
          <Step step={scenario.steps[this.props.store.stepIndex]} scenario={scenario}/>

        </div>
        <div style={{height: '100%', background: '#000', overflow: 'hidden'}}>
          {/*<div style={{height: 40, background: '#333', paddingRight: 10, textAlign: 'right'}}>*/}
            {/*<Icon type="code" style={{fontSize: '20px', marginTop: 10, marginRight: 10, color: '#fff'}}*/}
                  {/*onClick={() => this.props.store.setView('terminal')}/>*/}
            {/*<Icon type="appstore" style={{fontSize: '20px', marginTop: 10, marginRight: 10, color: '#fff'}}*/}
                  {/*onClick={() => this.props.store.setView('ide')}/>*/}
            {/*<Icon type="desktop" style={{fontSize: '20px', marginTop: 10, color: '#fff'}}*/}
                  {/*onClick={() => this.props.store.setView('ide')}/>*/}
          {/*</div>*/}
          {this.props.store.view == 'terminal' &&
          <Term scenario={scenario} style={{height: '100%'}}/>
          }
          {this.props.store.view == 'ide' &&
          <Editor/>
          }
        </div>
      </SplitPane>
    )
  }
}

export default inject('store')(observer(Scenario));
