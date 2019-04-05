import {types, flow} from 'mobx-state-tree';
import * as browserfs from "browserfs";
import * as pify from "pify";
import * as git from "isomorphic-git";
import {Course} from "./Course";
import { FileStore } from "./FileStore";
import {Scenario} from "./Scenario";

export const Store = types.model('Store', {
  loading: true,
  repo: '',
  course: types.optional(Course, {}),
  stepIndex: 0,
  view: 'terminal',
  fileStore: types.optional(FileStore, {openedFiles: [], files: []}),
  connect: false,
  // currentScenario: types.maybe(types.reference(Scenario))
}).volatile(self => ({
  bfs: {},
  pfs: {},
  currentScenario: null,
  socket: null,
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
      dir: '.',
      corsProxy: 'https://cors.isomorphic-git.org',
      url: repo,
      singleBranch: true,
      depth: 1
    });
    let data = yield self.pfs.readFile('course.json');
    let config = JSON.parse(data.toString());
    self.course = config;

  })

    function setSocket(socket) {
        self.socket = socket;
    }

    function setConnect(flag) {
        self.connect = flag;
    }
  return {
    afterCreate: flow(function*() {
      let repo = window.location.hash.substr(1);
      self.repo = repo;
      yield pify(browserfs.configure)({fs: "IndexedDB", options: {}});
      self.bfs = browserfs.BFSRequire('fs');
      self.pfs = pify(self.bfs);
      yield fetchCourse(repo);

    }),
    setSocket,
    setConnect,
    setRepo(repo) {
      self.repo = repo
    },
    setCurrentScenario(scenario) {
      self.currentScenario = scenario;
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
