import {types, flow, getRoot, getSnapshot} from 'mobx-state-tree';
import {Step} from "./Step";
import {Terminal} from "./Terminal";
import io from 'socket.io-client';

export const Scenario = types
  .model('Scenario', {
    title: '',
    description: '',
    environment: '',
    steps: types.array(Step),
    terminals: types.array(Terminal),
  }).volatile(self => ({
    socket: {},
    visited: false
  })).views(self => ({
    get store() {
      return getRoot(self);
    }
  })).actions(self => {

    function b64EncodeUnicode(str) {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function (match, p1) {
          return String.fromCharCode('0x' + p1);
        }));
    }

    function setSocket(socket) {
      self.socket = socket;
    }

    const createContainer = flow(function* () {
      try {

        const workspace = {};
        workspace.dockerImage = 'cpp';
        workspace.type = 'terminal';
        const json = yield fetch(window._env_.CONTAINER_ENDPOINT + '/container/workspace', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + b64EncodeUnicode('admin:admin')
          },
          method: 'POST',

          body: JSON.stringify({image: 'git'})
        }).then(resp => resp.json());
        // let containerName = JSON.parse(json.data.containerName);
        self.socket = io.connect(json.data[0].term, {transports: ["websocket"], reconnection: true});
        getRoot(self).setSocket(self.socket);
        self.socket.emit('term.open', {id: '123', cols: self.terminals[0].cols, rows: self.terminals[0].rows, cwd: '/'});
        self.socket.emit('fs.readdir', {path: '/'}, res => {console.log(res)})
        self.socket.on('term.output', data => {
          self.terminals[0].terminal.write(data.output)
        })
        self.socket.on('connect', () => {
          self.store.setConnect(true);
        })

      } catch (e) {
        console.log(e)
      }
    })

    return {
      afterCreate() {
        self.terminals.push({})

        // self.socket.on('data', function (data) {
        //   self.terminals[0].terminal.write(data.data)
        // });
      },
      setTitle(title) {
        self.title = title;
      },
      setDescription(desc) {
        self.description = desc;
      },
      createContainer,
      setSocket,
      addTerminal() {
        self.terminals.push({})
      },
      setVisited(flag) {
        self.visited = flag;
      }
    }
  });

