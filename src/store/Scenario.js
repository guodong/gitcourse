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
    socket: {ws: null},
    // terminals: []
    // socket: io.connect('//ws.katacoda.com', {
    //   transports: ["websocket"],
    //   timeout: 120 * 1e3,
    //   reconnection: false,
    //   query: 'dockerimage=dind&course=docker&id=deploying-first-container&originalPathwayId='
    // })
  })).views(self => ({

  })).actions(self => {

    function b64EncodeUnicode(str) {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function(match, p1) {
          return String.fromCharCode('0x' + p1);
        }));
    }

    const createContainer = flow(function*() {
      try {
        const json = yield fetch('http://container.eci.kfcoding.com/containers/workspace', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + b64EncodeUnicode('admin:admin')
          },
          method: 'POST',
          body: JSON.stringify({image: 'cpp'})
        }).then(resp => resp.json());
        console.log(json)
        self.socket.ws = io.connect(json.data[0].term, {transports: ["websocket"], reconnection: true});
        self.socket.ws.emit('term.open', {id: '123', cols: self.terminals[0].cols, rows: self.terminals[0].rows, cwd: '/'});
        self.socket.ws.emit('fs.readdir', {path: '/'}, res => {console.log(res)})
        // self.socket = io(json.data[0].term);
        self.socket.ws.on('term.output', data => {
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
      addTerminal() {
        self.terminals.push({})
      }
    }
  });
