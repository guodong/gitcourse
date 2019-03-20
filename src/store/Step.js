import {types, flow, getRoot, getSnapshot} from 'mobx-state-tree';

export const Step = types
  .model('Step', {
    title: '',
    text: '',
    content: '',
    // scenarios: types.array(Scenario)
  }).volatile(self => ({
    // scenarioDirs: []
  })).actions(self => {
    const fetchText = flow(function* () {
      let data = yield getRoot(self).pfs.readFile(self.text);
      self.content = data.toString();
    })
    return {
      afterCreate() {
        fetchText()
      },
      setTitle(title) {
        self.title = title;
      },
      setDescription(desc) {
        self.description = desc;
      },
      setAuthor(author) {
        self.author = author;
      },
      addScenario(scenario) {
        self.scenarios.push(scenario);
      },
      setScenarioDirs(dirs) {
        self.scenarioDirs = dirs;
      },
      // fetchScenarios,
      getProgress() {
        let vss = localStorage.getItem('visitedScenarios');
        if (!vss) {
          return 0;
        }
        return Math.floor(vss.length / self.scenarios.length)
      }
    }
  });
