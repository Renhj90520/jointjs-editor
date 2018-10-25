<template>
    <div class="toolbar">
      <a class="icon" @click="zoomin" title="zoomin">
        <font-awesome-icon icon="search-plus"></font-awesome-icon>
      </a>
      <a class="icon" @click="zoomout" title="zoomout">
        <font-awesome-icon icon="search-minus"></font-awesome-icon>
      </a>
      <span class="split"></span>
      <a class="icon" @click="undo" title="undo">
        <font-awesome-icon icon="undo-alt"></font-awesome-icon>
      </a>
      <a class="icon" @click="redo" title="redo">
        <font-awesome-icon icon="redo-alt"></font-awesome-icon>
      </a>
      <span class="split"></span>
      <a class="icon" @click="importJoint" title="import">
        <font-awesome-icon icon="file-import"></font-awesome-icon>
      </a>
      <a class="icon" @click="exportJoint" title="export">
        <font-awesome-icon icon="file-export"></font-awesome-icon>
      </a>
      <input type="file" ref="fileinput" @change="onChange" accept=".json" :multiple="false" style="display: none;">
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
    },
    redo() {
      Bus.$emit('redo');
    },
    undo() {
      Bus.$emit('undo');
    },
    importJoint() {
      this.$refs.fileinput.value = null;
      this.$refs.fileinput.click();
    },
    exportJoint() {
      Bus.$emit('export');
    },
    onChange(e) {
      const files = e.target.files;
      if (files && files.length > 0) {
        const reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onload = file => {
          const data = file.target.result;
          Bus.$emit('import', data);
        };
      }
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

