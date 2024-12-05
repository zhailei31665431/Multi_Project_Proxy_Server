<template>
  <div class="siderbar">
    <div class="siderbar-list">
      <div
        v-for="(item, index) in list"
        class="siderbar-item"
        :class="{ active: index === indexData, 'status-open': item.status === 1 }"
        v-on:click="changeSiderbarItem(index)"
      >
        <div class="siderbar-item-value">{{ item.name }}</div>
        <div class="siderbar-item-status"></div>
      </div>
    </div>
    <div class="sidebar-add">
      <el-button @click="add">Add</el-button>
    </div>
  </div>
</template>
<style lang="scss">
.new-dialog {
  .ep-button {
    padding: 0 10px !important;
  }
}
.siderbar {
  padding: 10px 20px 20px 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8e8e8;
  .siderbar-list {
    display: flex;
    flex: 1 1 auto;
    width: 100%;
    flex-direction: column;
    overflow-y: auto;
    padding-right: 20px;
    // padding: 0 20px;
    &::-webkit-scrollbar {
      /* 整个滚动条 */
      -webkit-appearance: none;
      background: transparent;
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      /* 显示滚动滑块背景色 */
      width: 4px;
      height: 4px;
      background: #e8e8e8;
      border-radius: 3px;
    }
  }
  .siderbar-item {
    height: 40px;
    line-height: 40px;
    padding: 0 20px;
    cursor: pointer;

    display: flex;
    flex: 0 1 auto;
    flex-direction: row;
    align-items: center;
    margin-top: 10px;
    &:first-child {
      margin-top: 0;
    }

    .siderbar-item-value {
      display: flex;
      flex: 1;
      margin-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      justify-content: center;
      font-size: 14px;
      max-width: 100%;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    .siderbar-item-status {
      width: 4px;
      height: 4px;
      border-radius: 4px;
      background: #bf0404;
    }
    &:hover {
      background-color: var(--ep-menu-hover-bg-color);
      color: var(--ep-menu-active-color);
    }
    &.active {
      background-color: var(--ep-menu-hover-bg-color);
      color: var(--ep-menu-active-color);
    }
    &.status-open {
      .siderbar-item-status {
        background: #32a62e;
      }
    }
  }
  .sidebar-add {
    margin-top: 20px;
  }
}
</style>
<script lang="ts" setup>
import { reactive, ref } from "vue";
const props = defineProps<{ indexData: any; list: any; add: () => void; changeSiderbarItem: any }>();
console.log(props.list[0], props.indexData, "ipcRenderer");
</script>
