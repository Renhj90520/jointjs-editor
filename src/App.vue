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
import DragBarV from "./components/DragBar-V";
import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
export default {
  name: "App",
  components: {
    "app-dragbarv": DragBarV,
    "app-toolbar": Toolbar,
    "app-sidebar": Sidebar,
    "app-canvas": Canvas
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

.joint-text-editor.joint-theme-default .caret.placeholder:after,
.joint-text-editor.joint-theme-modern .caret.placeholder:after {
  font-style: italic;
  color: #d3d3d3;
}
.joint-text-editor {
  margin: 0;
  padding: 0;
}
@-webkit-keyframes text-editor-caret-blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@-moz-keyframes text-editor-caret-blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@-ms-keyframes text-editor-caret-blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@keyframes text-editor-caret-blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.joint-text-editor .caret {
  position: absolute;
  height: 15px;
  margin-left: -1px;
  margin-top: 2px;
  width: 1px;
  -webkit-animation: text-editor-caret-blink 1s linear 0s infinite;
  -moz-animation: text-editor-caret-blink 1s linear 0s infinite;
  -ms-animation: text-editor-caret-blink 1s linear 0s infinite;
  animation: text-editor-caret-blink 1s linear 0s infinite;
  pointer-events: none;
  white-space: nowrap;
}
.joint-text-editor .caret.placeholder {
  background-color: transparent;
  -webkit-animation: none;
  animation: none;
  width: auto;
}
.joint-text-editor .caret.placeholder:before {
  content: "";
  display: inline-block;
  height: 100%;
  width: 1px;
  -webkit-animation: text-editor-caret-blink 1s linear 0s infinite;
  -moz-animation: text-editor-caret-blink 1s linear 0s infinite;
  -ms-animation: text-editor-caret-blink 1s linear 0s infinite;
  animation: text-editor-caret-blink 1s linear 0s infinite;
  float: left;
}
.joint-text-editor .caret.placeholder:after {
  content: "Enter text...";
  vertical-align: middle;
  display: inline-block;
}
.joint-text-editor .caret[text-anchor="middle"].placeholder:after {
  -ms-transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}
.joint-text-editor .caret[text-anchor="end"].placeholder:after {
  -ms-transform: translateX(-100%);
  -webkit-transform: translateX(-100%);
  transform: translateX(-100%);
}
.joint-text-editor .char-selection-box {
  position: absolute;
  opacity: 0.8;
  padding: 0;
  margin: 2px 0 0;
  pointer-events: none;
}
.joint-text-editor .char-selection-box:hover {
  cursor: text;
}
.joint-text-editor .textarea-container {
  position: absolute;
  height: 0;
  overflow: hidden;
}
.joint-text-editor textarea {
  position: absolute;
  width: 1000px;
  height: 1em;
  outline: 0;
}
.joint-text-editor.joint-theme-default .caret,
.joint-text-editor.joint-theme-default .caret.placeholder:before {
  background-color: #000;
}
.joint-text-editor.joint-theme-default .char-selection-box {
  background-color: #d3d3d3;
}
.joint-text-editor.joint-theme-modern .caret,
.joint-text-editor.joint-theme-modern .caret.placeholder:before {
  background-color: #000;
}
.joint-text-editor.joint-theme-modern .char-selection-box {
  background-color: #afd5ff;
}
</style>
