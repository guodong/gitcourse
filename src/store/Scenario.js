import {types, flow, getRoot, getSnapshot} from 'mobx-state-tree';
import {Step} from "./Step";
import {Terminal} from "./Terminal";
import io from 'socket.io-client';
const uuidv4 = require('uuid/v4');

export const Scenario = types
  .model('Scenario', {
    title: '',
    description: '',
    steps: types.array(Step),
    terminals: types.array(Terminal),
  }).volatile(self => ({
    socket: null,
    // terminals: []
    // socket: io.connect('//ws.katacoda.com', {
    //   transports: ["websocket"],
    //   timeout: 120 * 1e3,
    //   reconnection: false,
    //   query: 'dockerimage=dind&course=docker&id=deploying-first-container&originalPathwayId='
    // })
  })).views(self => ({
      get store(){
          return getRoot(self);
      }
  })).actions(self => {

    function b64EncodeUnicode(str) {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function(match, p1) {
          return String.fromCharCode('0x' + p1);
        }));
    }

    function setSocket(socket) {
      console.log("11111111",socket);
      self.socket = socket;
    }

    const createContainer = flow(function*() {
      try {

          const workspace = {};
          workspace.dockerImage = 'cpp';
          workspace.type = 'terminal';
        const json = yield fetch('http://api.v1.kfcoding.com/api/basic/eci/workspace', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + b64EncodeUnicode('admin:admin')
          },
          method: 'POST',
          body: JSON.stringify(workspace)
        }).then(resp => resp.json());
        console.log("22222222",json);
        // self.socket.ws = io.connect("http://test.sc.kfcoding.com", {transports: ["websocket"], reconnection: true});
        let socket = io("http://test.sc.kfcoding.com", {'timeout': 5000, 'connect timeout': 5000});
        console.log("666666",socket);
        self.store.setSocket(socket);
        self.store.socket.on('connect',()=>{
            self.store.setConnect(true);
        })
        console.log("3333333",self.store);
        self.store.socket.emit('term.open', {id: '123', cols: self.terminals[0].cols, rows: self.terminals[0].rows, cwd: '/'});
        self.store.socket.emit('fs.readdir', {path: '/'}, res => {console.log(res)})
        // self.socket = io(json.data[0].term);
        self.store.socket.on('term.output', data => {
          self.terminals[0].terminal.write(data.output)
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
      }
    }
  });

