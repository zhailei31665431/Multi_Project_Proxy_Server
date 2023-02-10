const match = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
const ipcRenderer = require('electron').ipcRenderer;
const checkData = (port, url) => {
  if (port.trim().length !== 0 && parseInt(port) >= 1 && parseInt(port) <= 655535 && url.trim().length !== 0 && match.test(url.trim())) {
    return 0;
  } else {
    return 1
  }
}
let server = localStorage.getItem('server');

let list = [{
  status: 0,
  btn: "Start",
  btnDis: 1,
  local: "localhost",
  port: "",
  target: "",
}];
if (server) {

  let data = JSON.parse(server);
  list = data.map((item) => {
    console.log(item);
    let btnDis = 1;
    if (item.port && item.target) {
      item.btnDis = checkData(item.port, item.target);
    }
    return item;
  })
}

const App = {
  data() {
    return {
      list: list
    };
  },
  watch: {
    list: {
      handler: function (oldVal, newVal) {
        localStorage.setItem('server', JSON.stringify(this.list));
      },
      deep: true
    }
  },
  methods: {
    changePort(index) {
      this.list[index].btnDis = checkData(this.list[index].port, this.list[index].target);
    },
    changeTarget(index) {
      this.list[index].btnDis = checkData(this.list[index].port, this.list[index].target);
    },
    changeStatus(index) {
      if (this.list[index].status == 0) {
        this.list[index].status = 1;
        this.list[index].btn = 'Close';
        ipcRenderer.send('open', {
          port: this.list[index].port, target: this.list[index].target,
          index: index
        });
      } else {
        this.list[index].status = 0;
        this.list[index].btn = 'Start';
        ipcRenderer.send('close', {
          index: index,
        });
      }
    },
    deleteItem(i) {
      if (this.list.length > 1) {
        this.list.splice(i, 1);
        this.list = this.list;
      }
      localStorage.setItem('server', JSON.stringify(this.list));
    },
    add() {
      this.list.push({
        status: 0,
        btn: "Start",
        btnDis: 1,
        local: "localhost",
        port: "",
        target: "",
      })
      console.log(this.list, '123')
    }
  },
  mounted() {
    let self = this;
    ipcRenderer.send('init');
    ipcRenderer.on("success", function (event, arg) {
      new Notification("Success", { body: `Proxy Success` })
    })
    ipcRenderer.on("error", function (event, arg) {
      new Notification("Error", { body: arg })
      self.status = 0;
      self.btn = 'Start';
    })
  },
};
const app = Vue.createApp(App);
app.use(ElementPlus);
app.mount("#app");