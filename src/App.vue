<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="flex main-container" style="-webkit-app-region: no-drag">
      <BaseSide :list="list" :indexData="indexRef" :add="addItem" :changeSiderbarItem="changeSiderbarItem" />
      <div class="main-container-w">
        <div class="server-status">
          <el-button v-if="activeData.status === 0" type="primary" class="ep-button" v-on:click="changeStatus(1)" :disabled="checkData()">Start</el-button>
          <el-button v-if="activeData.status === 1" class="ep-button" v-on:click="changeStatus(0)" type="warning">Stop</el-button>
          <el-button v-if="activeData.status === 0 && list.length > 1" class="ep-button" type="danger" v-on:click="deleteItem">Delete</el-button>
        </div>
        <div class="server-data">
          <div class="server-data-item">
            <label>名称</label>
            <section>
              <el-input
                :disabled="activeData.status === 1"
                v-model="activeData.name"
                @input="(value) => changeData(value, 'name')"
                placeholder="Please input"
              />
            </section>
          </div>
          <div class="server-data-item">
            <label>ip</label>
            <section>
              <el-input :disabled="true" v-model="activeData.ip" placeholder="Please input" @input="(value) => changeData(value, 'ip')" />
            </section>
          </div>
          <div class="server-data-item">
            <label>端口号</label>
            <section>
              <el-input
                :disabled="activeData.status === 1"
                v-model="activeData.port"
                placeholder="Please input"
                @input="(value) => changeData(value, 'port')"
              />
            </section>
          </div>
          <div class="server-data-item">
            <label>target</label>
            <section>
              <el-input
                :disabled="activeData.status === 1"
                v-model="activeData.target"
                placeholder="Please input"
                @input="(value) => changeData(value, 'target')"
              />
            </section>
          </div>
          <div class="server-data-item specail">
            <label>参数</label>
            <section id="jsoneditor"></section>
          </div>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<style>
body,
html {
  height: 100%;
  /* display: flex; */
}
#app {
  /* display: flex; */
  /* flex: 1; */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
  color: var(--ep-text-color-primary);
}

.main-container {
  flex: 1;
  height: calc(100vh - var(--ep-menu-item-height) - 4px);
  margin: 0 20px;
}
.main-container-w {
  margin: 0 auto;
  max-width: 800px;
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
}
.jsoneditor {
  border: none;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
}
.jsoneditor-menu {
  display: none !important;
}
.jsoneditor-statusbar {
  display: none !important;
}
div.jsoneditor-outer.has-status-bar {
  margin: 0;
  padding: 0;
}
.server-data {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  flex: 1;
  .server-data-item {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    flex: 0 1 auto;
    &:first-child {
      margin-top: 0;
    }
    &.specail {
      flex: 1;
    }
    label {
      font-weight: bold;
      width: 70px;
      text-align: right;
      min-height: 30px;
      line-height: 30px;
    }
    section {
      min-height: 30px;
      margin-left: 15px;
      flex: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      section {
        flex: 1;
      }
    }
  }
}
div.jsoneditor.jsoneditor-mode-preview pre.jsoneditor-preview {
  text-align: left;
  border-left: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;
  padding: 10px;
}
</style>
<script lang="ts" setup>
import "jsoneditor/dist/jsoneditor.min.css";
// import electron, { ipcRenderer } from "electron";
// import { Message } from "element-ui";
import { ElMessage } from "element-plus";
const { ipcRenderer } = (window as any)["electron"] || {};
// const ipcRenderer: any = null;
import { reactive, ref, onMounted } from "vue";
import JSONEditor from "jsoneditor";
let server = localStorage.getItem("server");
let normalData = [
  {
    status: 0,
    name: "代理1",
    ip: "localhost",
    port: "",
    target: "",
    params: "{}",
  },
];
if (server) {
  let data = JSON.parse(server);
  normalData = data.map((item: any) => {
    item["status"] = 0;
    return item;
  });
}

let list = ref<Array<any>>(normalData);
let indexRef = ref(0);
let activeData = reactive(list.value[indexRef.value]);

const match = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
const checkData = () => {
  let port = activeData.port;
  let url = activeData.target?.toString() || "";
  if (port.trim().length !== 0 && parseInt(port) >= 1 && parseInt(port) <= 655535 && url.trim().length !== 0 && match.test(url.trim())) {
    return false;
  } else {
    return true;
  }
};

console.log(list.value[0], "list");

const changeSiderbarItem = (number: number) => {
  indexRef.value = number;
  activeData = list.value[number];
  const container: any = document.getElementById("jsoneditor");
  initJSON(activeData);
};

let editor: any;
const initJSON = (data: any) => {
  const container: any = document.getElementById("jsoneditor");
  container.innerHTML = "";
  const options = {
    history: false,
    modes: [],
    mode: data.status === 0 ? "code" : "preview",
    onChangeText: (jsonString: string) => {
      changeData(jsonString, "params");
    },
  };
  editor = new JSONEditor(container, options);
  editor.setText(data.params);
};
const addItem = () => {
  list.value.push({ status: 0, name: "未命名代理", ip: "localhost", port: "", target: "", params: "{\n}" });
  indexRef.value = list.value.length - 1;
  activeData = list.value[list.value.length - 1];
  localStorage.setItem("server", JSON.stringify(list.value));
  initJSON(activeData);
};
const deleteItem = () => {
  let newIndex = indexRef.value - 1 < 0 ? 0 : indexRef.value - 1;
  list.value.splice(indexRef.value, 1);
  console.log(newIndex, list.value.length, "123");
  indexRef.value = newIndex;
  activeData = JSON.parse(JSON.stringify(list.value[newIndex]));
  localStorage.setItem("server", JSON.stringify(list.value));
  initJSON(activeData);
};

const changeStatus = (number: number) => {
  list.value[indexRef.value].status = number;
  activeData.status = number;

  if (number === 1) {
    editor.setMode("preview");
  } else {
    editor.setMode("code");
  }

  if (typeof ipcRenderer !== "undefined" && ipcRenderer) {
    if (number === 1) {
      ipcRenderer.send("open", {
        port: activeData.port,
        target: activeData.target,
        index: indexRef.value,
        params: activeData.params,
      });
    } else {
      ipcRenderer.send("close", {
        index: indexRef.value,
      });
    }
  }
};
const changeData = (value: any, type: string) => {
  list.value[indexRef.value][type] = value;
  activeData[type] = value;
  console.log(activeData, "12312312312312");
  localStorage.setItem("server", JSON.stringify(list.value));
  // editor.setMode("code");
};

onMounted(() => {
  initJSON(activeData);

  if (typeof ipcRenderer !== "undefined" && ipcRenderer) {
    console.log(ipcRenderer, "123");
    ipcRenderer.send("init");
    ipcRenderer.on("success", function (event: any, arg: any) {
      ElMessage({
        message: "Proxy Success",
        type: "success",
      });
      // new Notification("Success", { body: `Proxy Success` });
    });
    ipcRenderer.on("error", function (event: any, arg: any) {
      ElMessage({
        message: arg.error,
        type: "error",
      });
      list.value[indexRef.value].status = 0;
      activeData.status = 0;
      // new Notification("Error", { body: arg.error });
      // self.status = 0;
      // self.btn = 'Start';
      // self.list[arg["index"]].status = 0;
      // self.list[arg["index"]].btn = "Start";
    });
  }

  // console.log(electron, "123");
});
</script>
