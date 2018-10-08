<template>
  <div id="app">
    <app-toolbar></app-toolbar>
    <div class="main">
      <app-sidebar></app-sidebar>
      <app-dragbarv></app-dragbarv>
      <div class="rightarea">
        <div class="dragsource"></div>
        <div class="stage"></div>
      </div>
    </div>
  </div>
</template>

<script>
import DragBarV from "./components/DragBar-V";
import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
export default {
  name: "App",
  components: {
    "app-dragbarv": DragBarV,
    "app-toolbar": Toolbar,
    "app-sidebar": Sidebar
  }
};
</script>

<style>
body {
  width: 100%;
  height: 100vh;
}
#app {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.main {
  display: flex;
  flex: 1 1 auto;
}

.rightarea {
  display: flex;
  position: relative;
  flex-direction: column;
  overflow: auto;
  flex: 1 1 auto;
}
.dragsource {
  position: absolute;
  width: 100%;
  height: 80px;
  background-color: rgba(30, 30, 30, 0.6);
}
.stage {
  min-width: 2571px;
}
</style>
