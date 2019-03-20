import React from 'react';
import {measure} from '@pinyin/measure';
import {inject, observer} from 'mobx-react';
import 'xterm/dist/xterm.css';
import {Terminal as Xterm} from 'xterm';
import * as fit from "xterm/lib/addons/fit/fit";
import {Tabs} from "antd";

Xterm.applyAddon(fit);

// const Div = measure('div');

class Term extends React.Component {
  constructor(props) {
    super(props);

    this.dom = React.createRef();
    this.state = {
      activeKey: props.scenario.terminals[0].id,
    };
  }

  componentDidMount() {

    this.props.scenario.terminals[0].terminal.open(this.dom);
    this.props.scenario.terminals[0].terminal.fit();
  }

  resize = () => {
    // if (this.props.terminal.terminal)
    //   this.props.terminal.terminal.fit()
  }

  onChange = (activeKey) => {
    this.setState({ activeKey });
  }

  add = () => {
    // const panes = this.state.panes;
    // const activeKey = `newTab${this.newTabIndex++}`;
    // panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
    // this.setState({ panes, activeKey });
    // this.props.scenario.addTerminal()
  }

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  }

  remove = (targetKey) => {

  }

  render() {
    return (
      <Tabs
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        type="editable-card"
        onEdit={this.onEdit}
      >
        {this.props.scenario.terminals.map(pane => <Tabs.TabPane tab='Terminal' key={pane.id} closable='true'>
          <div ref={dom => this.dom = dom} style={{width: '100%', height: '100%'}}></div>
        </Tabs.TabPane>)}
      </Tabs>

    )
  }
}

export default inject('store')(observer(Term));
