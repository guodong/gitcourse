import {types, flow, getRoot, getSnapshot} from 'mobx-state-tree';
import {Group} from "./Group";
import {Scenario} from "./Scenario";

export const Desktop = types
  .model('Desktop', {
    ws: 'ws://desk.sc.kfcoding.com:80'
  }).volatile(self => ({
    socket: null
  })).actions(self => {

    return {
      afterCreate() {

      },
    }
  });
