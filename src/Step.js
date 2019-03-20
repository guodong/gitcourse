import React, {Component} from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import {inject, observer} from 'mobx-react';
import {Button, Icon} from "antd";

class Step extends Component {

  state = {
    source: '123'
  }

  render() {
    let scenario = this.props.scenario;
    return (
      <div style={{padding: 20, height: 'calc(100% - 40px)', overflow: 'auto'}}>
        <ReactMarkdown source={this.props.step.content} renderers={{inlineCode: CodeBlock, code: CodeBlock}}/>
        <div style={{height: 40}}>
          {this.props.store.stepIndex != 0 &&
          <Button type="default" onClick={() => {
            this.props.store.prevStep()
          }}>
            <Icon type="left"/>上一步
          </Button>
          }
          {this.props.store.stepIndex != scenario.steps.length - 1 &&
          <Button type="primary" style={{float: 'right'}} onClick={() => {
            this.props.store.nextStep();
          }}>
            下一步<Icon type="right"/>
          </Button>
          }
          {this.props.store.stepIndex == scenario.steps.length - 1 &&
          <Button type="primary" style={{float: 'right'}} onClick={() => {
            // this.props.store.setPage('');
          }}>
            返回目录<Icon type="book"/>
          </Button>
          }

        </div>
      </div>
    )
  }
}

export default inject('store')(observer(Step));
