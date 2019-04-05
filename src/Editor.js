import React from 'react';
import SplitPane from "react-split-pane";
import MonacoEditor from 'react-monaco-editor';
// import MonacoEditor from './MonacoEditor';
// import {Tree} from "antd";
import { Tabs } from 'antd';
import FileTree from './FileTree/index';
// import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import {mimeToType} from "./utils/language";
import {inject, observer} from "mobx-react";
import icons from "file-icons-js";
import IconClose from 'react-icons/lib/md/close';


// const DirectoryTree = Tree.DirectoryTree;
// const { TreeNode } = Tree;
const TabPane = Tabs.TabPane;
const editorOptions = {
    selectOnLineNumbers: true
};

const data = {
  name: 'react-treebeard',
  toggled: true,
  children: [
    {
      name: 'example',
      children: [
        {name: 'app.js'},
        {name: 'data.js'},
        {name: 'index.html'},
        {name: 'styles.js'},
        {name: 'webpack.config.js'}
      ]
    },
    {
      name: 'node_modules',
      loading: true,
      children: []
    },
    {
      name: 'src',
      children: [
        {
          name: 'components',
          children: [
            {name: 'decorators.js'},
            {name: 'treebeard.js'}
          ]
        },
        {name: 'index.js'}
      ]
    },
    {
      name: 'themes',
      children: [
        {name: 'animations.js'},
        {name: 'default.js'}
      ]
    },
    {name: 'Gulpfile.js'},
    {name: 'index.js'},
    {name: 'package.json'}
  ]
};

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    const panes = [
          { title: 'Tab 1', content: 'Content of Tab 1', key: '1' },
          { title: 'Tab 2', content: 'Content of Tab 2', key: '2' },
          {
              title: 'Tab 3', content: 'Content of Tab 3', key: '3', closable: false,
          },
      ];
    this.state = {
          panes,
      };
    this.onToggle = this.onToggle.bind(this);
  }
    onChange = (activeKey) => {
        this.props.store.viewStore.setEditorIndex(activeKey);
    }

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    }

    add = () => {
        const panes = this.state.panes;
        const activeKey = `newTab${this.newTabIndex++}`;
        panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
        this.setState({ panes, activeKey });
    }

    remove = (targetKey) => {
        let activeKey = this.state.activeKey;
        let lastIndex;
        this.state.panes.forEach((pane, i) => {
            if (pane.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const panes = this.state.panes.filter(pane => pane.key !== targetKey);
        if (panes.length && activeKey === targetKey) {
            if (lastIndex >= 0) {
                activeKey = panes[lastIndex].key;
            } else {
                activeKey = panes[0].key;
            }
        }
        this.setState({ panes, activeKey });
    }
  onToggle(node, toggled) {
    if (this.state.cursor) {
      this.state.cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    this.setState({cursor: node});
  }

  editorDidMount(editor, monaco) {
    console.log('editorDidMount', editor);
    editor.focus();
  }

  // onChange(newValue, e) {
  //   console.log('onChange', newValue, e);
  // }

  render() {
    const code = '// code';
    const options = {
      selectOnLineNumbers: true
    };
    return (
        <div style={{height: '100%'}}>
                <SplitPane
                    defaultSize={256}
                    onDragStarted={this.onDragStarted}
                    pane2Style={{overflow: 'hidden'}}
                >
                    <FileTree/>
                    <Tabs
                        onChange={this.onChange}
                        activeKey={`${this.props.store.viewStore.editorIndex}`}
                        type="editable-card"
                        onEdit={this.onEdit}
                    >
                        {this.props.store.fileStore.openedFiles.map(t => <TabPane
                            tab={t.name}
                            key={`${t.id}`}
                            closable="true"
                            style={{
                            height: 'calc(100% - 25px)',
                            background: '#000'
                        }}>
                            <MonacoEditor width='100%' height='2000' language={mimeToType(t.type)} value={t.content} options={editorOptions} file={t}/>
                        </TabPane>
                        )}
                    </Tabs>
                    {/*<Tabs selectedIndex={this.props.store.viewStore.editorIndex}*/}
                          {/*onSelect={tabIndex => this.props.store.viewStore.setEditorIndex(tabIndex)}*/}
                          {/*style={{background: '#1c2022', color: '#e0e0e0', height: '100%'}}>*/}
                        {/*<TabList>*/}
                            {/*{this.props.store.fileStore.openedFiles.map(t =>*/}
                                {/*<Tab key={t}>*/}
                                    {/*<i style={{fontStyle: 'normal'}} className={icons.getClassWithColor(t.name)}></i>*/}
                                    {/*{t.dirty ? <b style={{color: 'red'}}>{t.name}</b> : t.name}*/}
                                    {/*<IconClose style={{marginLeft: '10px'}} onClick={(e) => {this.props.store.fileStore.closeFile(t);e.stopPropagation()}}/>*/}
                                {/*</Tab>*/}
                            {/*)}*/}
                        {/*</TabList>*/}
                        {/*{this.props.store.fileStore.openedFiles.map(t => <TabPanel key={t} style={{*/}
                            {/*height: 'calc(100% - 25px)',*/}
                            {/*background: '#000'*/}
                        {/*}}><MonacoEditor language={mimeToType(t.type)} value={t.content} options={editorOptions}*/}
                                         {/*file={t}/></TabPanel>)}*/}
                    {/*</Tabs>*/}
                </SplitPane>
        </div>
    );
  }
}

// export default Editor;
export default inject('store')(observer(Editor));

