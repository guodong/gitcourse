import {getParent, getRoot, hasParentOfType, types} from 'mobx-state-tree';

export const File = types
  .model('File', {
    name: types.string,
    isDir: types.boolean,
    type: types.string,
    size: types.number,
    path: types.identifier,
    children: types.late(() => types.array(File)),
    content: '',
    dirty: false,
    expanded: false,
    add: '',
    reName: false,
    id: types.optional(types.number,0),
  }).views(self => ({
    get store() {
      return getRoot(self);
    },
    get depth() {
      if (!hasParentOfType(self, File)) {
        return 0;
      } else {
        return getParent(self, 2).depth + 1;
      }
    }
  })).actions(self => {
    function setReName(flag) {
      self.reName = flag;
    }

    function setId(index) {
        self.id = index;
    }

    function setName(name) {
      self.name = name;
    }

    function setAdd(flag) {
      self.add = flag;
    }

    function setDirty(flag) {
      self.dirty = flag;
    }

    function setContent(content) {
      self.content = content;
    }

    function setChildren(data) {
      self.children = data;
    }

    function pushChildren(file) {
      self.children.push(file)
    }

    function popChildren() {
      self.children.pop()
    }

    function removeChildren(file) {
      self.children.remove(file)
    }

    function setExpanded(flag) {
      self.expanded = flag;
    }

    function setPath(path) {
      self.path = path;
    }

    //TODO
    function loadChildren(fn) {
      self.store.socket.emit('fs.readdir', {path: self.path}, res => {
        if (!res.error) {
          // 适配不同的workspace server 版本
          let content = '';
          if ('data' in res) {
            if (res.data) {
              content = res.data
            }
          } else if (res) {
            content = res
          }
          self.setChildren(content);
          self.setExpanded(true);
          fn && fn(res.data)
        } else {
          self.store.handleError(res.error)
        }
      })
    }

    // TODO need notification?
    function toggleDir(fn) {
      console.log("toggleDir--->");
      for (let i = 0; i < self.store.fileStore.openedFiles.length; i++) {
        if (!self.store.fileStore.openedFiles[i].path) {
          console.log("not exist");
          // self.store.fileStore.openedFiles.splice(i, 1);
        } else {
          console.log("path", self.store.fileStore.openedFiles[i].path);
        }
      }
      for (let i = 0; i < self.store.fileStore.openedFiles.length; i++) {
        console.log("--->");
        console.log(self.store.fileStore.openedFiles[i]);
      }
      if (self.isDir) {
        if (self.expanded) {
          self.expanded = false;
        } else {
          loadChildren(fn);
          self.expanded = true;
        }
      }
    }

    function open() {
      console.log("--->length", self.store.fileStore.openedFiles.length);
      let exist = false;
      if (self) {
        for (let i = 0; i < self.store.fileStore.openedFiles.length; i++) {
          if (self.store.fileStore.openedFiles[i].path === self.path) {
            exist = true;
            break;
          }
        }
      }
      if (!exist) {
        self.store.socket.emit('fs.readfile', {path: self.path}, res => {
          if (!res.error) {
            // 适配不同的workspace server 版本
            let content = '';
            if ('data' in res) {
              if (res.data) {
                content = res.data
              }
            } else if (res) {
              content = res
            }

            self.setContent(content);
            let key = self.store.fileStore.openedFileKey;
            self.setId(key);
            self.store.viewStore.setEditorIndex(key);
            key = key+1;
            self.store.fileStore.setOpenedFileKey(key);
            console.log("每个被装进openedfile中的文件为",self);
            self.store.fileStore.pushOpenedFile(self);
            // self.store.viewStore.setEditorIndex(self.store.fileStore.openedFiles.length - 1);
          } else {
            self.store.handleError(res.error)
          }
        })
      } else {
        console.log("already exist in opened file list");
      }
    }

    return {
      setId,
      setReName,
      setPath,
      setName,
      setAdd,
      setDirty,
      setContent,
      loadChildren,
      setChildren,
      pushChildren,
      popChildren,
      removeChildren,
      setExpanded,
      toggleDir,
      open
    }
  });

export const FileStore = types
  .model("FileStore", {
    currentFilePath: '',
    openedFiles: types.array(types.reference(File)),

    root: types.optional(File, {
      name: 'workspace',
      path: '/workspace',
      isDir: true,
      size: 0,
      type: 'file',
      children: [],
    }),
    openedFileKey: types.optional(types.number,0)
  }).views(self => ({
    get store() {
      return getParent(self)
    }
  })).actions(self => {

    function mkdir(path) {
      if (self.store.connect) {
        self.store.socket.emit('fs.mkdir', {path: path}, self.store.handleError);
      } else {
        self.store.handleError({error: "连接已断开"});
      }
    }

    function setOpenedFileKey(index) {
        self.openedFileKey = index;
    }

    // TODO
    function isExist(path, fn) {
      self.store.socket.emit('fs.checkfile', {path: path}, fn);
    }

    function writeFile(path, content) {
      if (self.store.connect) {
        self.store.socket.emit('fs.writefile', {path: path, content: content || ''}, (res) => {
          if (res.error) {
            self.store.handleError(res);
          } else {
            self.store.handleSuccess("保存成功");
          }
        });
      } else {
        self.store.handleError({error: "连接已断开"});
      }
    }

    function unlink(file) {
      if (self.store.connect) {
        self.store.socket.emit('fs.unlink', {path: file.path}, self.store.handleError);
      } else {
        self.store.handleError({error: "连接已断开"});
      }
    }

    function rename(file, newPath) {
      if (self.store.connect) {
        self.store.socket.emit('fs.rename', {oldPath: file.path, newPath: newPath}, self.store.handleError);
      } else {
        self.store.handleError({error: "连接已断开"});
      }
    }

    function rmdir(file) {
      if (self.store.connect) {
        self.store.socket.emit('fs.rmdir', {path: file.path}, self.store.handleError);
      } else {
        self.store.handleError({error: "连接已断开"});
      }
    }

    function saveFiles(e) {
      if (self.store.connect) {
        e.preventDefault();
        self.openedFiles.map(f => {
          self.store.socket.emit('fs.writefile', {path: f.path, content: f.content}, (res) => {
            if (!res.error) {
              f.setDirty(false);
              self.store.handleSuccess("保存成功");
            } else {
              self.store.handleError(res);
            }
          });
        })
      } else {
        self.store.handleError({error: "连接已断开"});
      }
    }

    function closeFile(file) {
      let idx = self.openedFiles.findIndex(item => item === file);
      if (idx <= self.store.viewStore.editorIndex) {
        self.store.viewStore.setEditorIndex(self.store.viewStore.editorIndex - 1);
      }
      console.log(self);
      self.openedFiles.remove(file);
    }

    function pushOpenedFile(file) {
      self.openedFiles.push(file)
    }

    function removeOpenedFile(file) {
      self.openedFiles.remove(file)
    }

    function setCurrentFilePath(path) {
      self.currentFilePath = path;
    }

    return {
      isExist,
      mkdir,
      writeFile,
      unlink,
      rename,
      rmdir,

      saveFiles,
      closeFile,
      setOpenedFileKey,
      pushOpenedFile,
      removeOpenedFile,
      setCurrentFilePath,
    }
  });
