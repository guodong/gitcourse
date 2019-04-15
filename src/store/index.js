import {types, flow, getRoot} from 'mobx-state-tree';
import * as browserfs from "browserfs";
import * as pify from "pify";
import * as git from "isomorphic-git";
import {notification} from 'antd';
import {Course} from "./Course";
import {FileStore} from "./FileStore";
import {Scenario} from "./Scenario";
import {ViewStore} from "./ViewStore";
import Cookies from 'js-cookie';

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
  docker_endpoint: window._env_.DOCKER_ENDPOINT
}).volatile(self => ({
  bfs: {},
  pfs: {},
  currentScenario: null,
  socket: null,
  cpId: null
})).views(self => ({
  get completeIndex() {
    return localStorage.getItem('completeIndex') || 0;
  },
  set completeIndex(index) {
    localStorage.setItem('completeIndex', index);
  }
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

  Cookies.set('token', 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZWFjaGVyQGtmY29kaW5nLmNvbSIsInVzZXJJZCI6IjIxZDYyNzI3YWVjYTRiMzViYmQzYTUxZWU0N2ExMjU4IiwibmFtZSI6InRlYWNoZXJAa2Zjb2RpbmcuY29tIiwicm9sZSI6InRlYWNoZXIiLCJleHAiOjE1NTUzMDkyOTl9.Bmt7_qb3JwUdZvNSLVYDjHvL1RK6wKKieJCOkCbR0cnanWozgEhxszS1Jvp3O8zdSR5rJVt7OIskpUWSZl08HDJvVx1uPuCA9A0S1XRyUYiilHBVoSn24NUYgSZaxgQJAs69y3TAxNm5Z41AmAyw_m3Ap1K9mEMXc0WOhNzT31w')

  const startTrain = function (repo) {
    fetch('http://api.kfcoding.com/api/practice/trains/competition/begin', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cookies.get('token')
      },
      method: 'POST',
      body: JSON.stringify({repo: repo})
    }).then(resp => resp.json())
      .then(data => getRoot(self).setCpId(data.data.id));
  }

  const stopTrain = function () {
    fetch('http://api.kfcoding.com/api/practice/trains/competition/end', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cookies.get('token')
      },
      method: 'PUT',
      body: JSON.stringify({id: self.cpId})
    }).then(resp => resp.json());
  }

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

      startTrain(repo);


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
      } else {
        if (self.completeIndex == self.course.scenarios.length) {
          stopTrain()
        }
      }
      if (index != undefined) {
        if (index >= self.completeIndex) {
          let ci = index + 1;
          localStorage.setItem('completeIndex', ci)
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
    setCpId(id) {
      self.cpId = id;
    }
  }
})
