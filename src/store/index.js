import {types, flow} from 'mobx-state-tree';
import * as browserfs from "browserfs";
import * as pify from "pify";
import * as git from "isomorphic-git";
import {notification} from 'antd';
import {Course} from "./Course";
import {FileStore} from "./FileStore";
import {Scenario} from "./Scenario";
import {ViewStore} from "./ViewStore";

export const Store = types.model('Store', {
  loading: true,
  repo: '',
  course: types.optional(Course, {}),
  stepIndex: 0,
  view: 'terminal',
  dir: new Date().getTime().toString(),
  fileStore: types.optional(FileStore, {openedFiles: [], files: []}),
  connect: false,
  viewStore: types.optional(ViewStore, {}),
}).volatile(self => ({
  bfs: {},
  pfs: {},
  currentScenario: null,
  socket: null,
  completeIndex: 0
})).views(self => ({

})).actions(self => {
  const fetchCourse = flow(function* (repo) {
    git.plugins.set('fs', self.bfs);
    // yield git.pull({
    //   dir: '/',
    //   ref: 'master',
    //   fastForwardOnly: true,
    //   singleBranch: true
    // })
    yield git.clone({
      dir: self.dir,
      corsProxy: 'https://cors.isomorphic-git.org',
      url: repo,
      singleBranch: true,
      depth: 1
    });
    let data = yield self.pfs.readFile(self.dir + '/course.json');
    let config = JSON.parse(data.toString());
    self.course = config;
  })

  const startTrain = flow(function* (repo) {
    const json = yield fetch('http://api.kfcoding.com/api/practice/trains/competition', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZWFjaGVyQGtmY29kaW5nLmNvbSIsInVzZXJJZCI6IjIxZDYyNzI3YWVjYTRiMzViYmQzYTUxZWU0N2ExMjU4IiwibmFtZSI6InRlYWNoZXJAa2Zjb2RpbmcuY29tIiwicm9sZSI6InRlYWNoZXIiLCJleHAiOjE1NTUxNzM3OTl9.fPxoYdlltlRuqxkKLFvh254NU_-sj6N100yIdIwYCzRTuihNP4BhkHxSrO97pbzEFCrKxBp5xR63sGQKSa7pAjRyjdKDlVZJkpbsJO_1KDgEs2hbGwla5vRPDHk1hoExTtpAsObUBiffrb1TUrV2NaGvKNCaNvtjEcbHYJe8qQs'
      },
      method: 'POST',
      body: JSON.stringify({gitUrl: repo})
    }).then(resp => resp.json());
    return json;
  })

  function setSocket(socket) {
    self.socket = socket;
  }

  function setConnect(flag) {
    self.connect = flag;
  }

  function handleSuccess(msg) {
    notification.success({message: "操作成功", description: msg})
  }

  function handleError(data) {
    if (data.error) {
      notification.error({message: "操作失败", description: data.error})
    }
  }

  return {
    afterCreate: flow(function* () {
      let repo = window.location.hash.substr(1);
      self.repo = repo;
      yield pify(browserfs.configure)({fs: "IndexedDB", options: {}});
      self.bfs = browserfs.BFSRequire('fs');
      self.pfs = pify(self.bfs);
      yield fetchCourse(repo);

      yield startTrain(repo);


    }),
    setSocket,
    setConnect,
    handleSuccess,
    handleError,
    setRepo(repo) {
      self.repo = repo
    },
    setCurrentScenario(scenario, index) {
      self.currentScenario = scenario;
      self.stepIndex = 0;
      if (scenario != null) {
        scenario.setVisited(true);
      }
      if (index != undefined) {
        if (index >= self.completeIndex) {
          self.completeIndex = index + 1;
          console.log(self.completeIndex)
        }
      }
    },
    setView(view) {
      self.view = view;
    },
    nextStep() {
      self.stepIndex++;
    },
    prevStep() {
      self.stepIndex--;
    },
  }
})
