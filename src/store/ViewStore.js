import {types} from 'mobx-state-tree';

export const ViewStore = types
  .model({
    editorIndex: -1,
    loading: true,
    loadingMsg: 'Loading...',
    bottomHeight: 30,
    workOpen: false
  }).actions(self => ({
    setEditorIndex(idx) {
      self.editorIndex = parseInt(idx);
      console.log("7777777",self.editorIndex);
    },
    setLoading(loading) {
      self.loading = loading;
    },
    setLoadingMsg(msg) {
      self.loadingMsg = msg;
    },
    setBottomHeight(height) {
      self.bottomHeight = height;
    },
    showWork() {
      self.workOpen = true;
    },
    hideWork() {
      self.workOpen = false;
    }
  }));