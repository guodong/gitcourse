import React from 'react';
import {inject, observer} from "mobx-react/index";
import FileItem from "./FileItem";

const FileTree = inject('store')(
  observer(({store}) => (
    <div style={{background: '#364040', height: '100%', color: '#fff', overflow: 'scroll', whiteSpace: 'nowrap'}}>
      <FileItem parentFile={store.fileStore.root} file={store.fileStore.root}/>
    </div>
  ))
);

export default FileTree;