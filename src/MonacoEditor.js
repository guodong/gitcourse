import React from 'react';
import * as monaco from 'monaco-editor';
// import { measure } from '@pinyin/measure'
import {autorun} from 'mobx'
import { measure } from '@pinyin/measure';
import {inject, observer} from "mobx-react";


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
      console.log("000000000000");
      this.props.file.setContent(this.editor.getValue());
      this.props.file.setDirty(true);
      let index = this.props.store.viewStore.editorIndex;
      let removeKey = this.props.store.viewStore.removeEditorKey;
      //这段代码是因为当删除的tab不是正选中的activekey的tab时会触发onDidChangeModelContent事件
      if(this.props.store.viewStore.removeEditorKeyEvent){
        return;
      }
      if(index !== -1){
          let file = this.props.store.fileStore.openedFiles[index];
          console.log('9999999999999');
          this.props.store.fileStore.writeFile(file.path, file.content);
      }
    })
  }

  handleResize = () => {
    if (this.editor) {
      this.editor.layout();
    }
  };

  getDivHeight(){
        let editorHeight = document.body.clientHeight - 150;
        return editorHeight+"px";
    }


  render() {
    return (
      <div
        style={{width: '100%', height: '100%'}}
        onWidthChange={this.handleResize}
      >
        <div ref={dom => this.dom = dom} style={{width: '100%', height:`${this.getDivHeight()}` }}></div>
      </div>
    );
  }
}

export default inject('store')(observer(MonacoEditor));
