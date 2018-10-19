<template>
  <div id="app">
    <app-toolbar></app-toolbar>
    <div class="main">
      <app-sidebar></app-sidebar>
      <app-dragbarv></app-dragbarv>
      <div class="rightarea">
        <div class="dragsource"></div>
        <div class="stage" ref="stage">
          <app-canvas></app-canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DragBarV from './components/DragBar-V';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
export default {
  name: 'App',
  components: {
    'app-dragbarv': DragBarV,
    'app-toolbar': Toolbar,
    'app-sidebar': Sidebar,
    'app-canvas': Canvas
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
  width: 100%;
  flex: 0 0 80px;
  background-color: rgba(30, 30, 30, 0.6);
}
.stage {
  overflow: auto;
  position: relative;
}
*::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}
*::-webkit-scrollbar-thumb {
  background-color: #c5c5c5;
  border-radius: 10px;
  border: whitesmoke solid 3px;
}
*::-webkit-scrollbar-track {
  background-color: whitesmoke;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.1);
}
</style>
