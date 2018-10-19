<template>
    <div class="toolbar">
      <a class="icon" @click="zoomin">
        <font-awesome-icon icon="search-plus"></font-awesome-icon>
      </a>
      <a class="icon" @click="zoomout">
        <font-awesome-icon icon="search-minus"></font-awesome-icon>
      </a>
      <span class="split"></span>
      <a class="icon">
        <font-awesome-icon icon="undo-alt"></font-awesome-icon>
      </a>
      <a class="icon">
        <font-awesome-icon icon="redo-alt"></font-awesome-icon>
      </a>
    </div>
</template>
<script>
import Bus from '@/bus';
export default {
  methods: {
    zoomin() {
      Bus.$emit('zoomin');
    },
    zoomout() {
      Bus.$emit('zoomout');
    }
  }
};
</script>
<style scoped>
.toolbar {
  flex: 0 0 34px;
  background-color: whitesmoke;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0px 12px;
}

.icon {
  margin-left: 12px;
  cursor: pointer;
  color: #c4c4c4;
  width: 21px;
  height: 21px;
  text-align: center;
  line-height: 20px;
}
.icon:hover {
  color: #191919;
}
.split {
  width: 1px;
  background-color: #e5e5e5;
  height: 100%;
  margin-left: 12px;
}
</style>

