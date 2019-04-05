import React from 'react';
import * as monaco from 'monaco-editor';
import { measure } from '@pinyin/measure'
import {autorun} from 'mobx'

// const Div = measure('div');

class MonacoEditor extends React.PureComponent {
  constructor(props) {
    super(props);

    this.dom = React.createRef();
    this.editor = null;

    autorun(() => {
      if (this.editor)
        this.editor.setValue(props.file.content)
    })
  }

  componentWillReceiveProps(next) {
    if (next.file) {
      if (!this.editor.getValue())
        this.editor.setValue(next.file.content)
    }
  }

  componentDidMount() {
    this.editor = monaco.editor.create(this.dom, {
      value: this.props.file.content,
      language: this.props.language || 'javascript',
      theme: 'vs-dark'
    });

    this.editor.onDidChangeModelContent(e => {
      this.props.file.setContent(this.editor.getValue());
      this.props.file.setDirty(true);
    })
  }

  handleResize = () => {
    if (this.editor) {
      this.editor.layout();
    }
  };

  render() {

    return (
      <div
        style={{width: '100%', height: '100%'}}
        onWidthChange={this.handleResize}
      >
        <div ref={dom => this.dom = dom} style={{width: '100%', height: '100%'}}></div>
      </div>
    );
  }
}

export default MonacoEditor;