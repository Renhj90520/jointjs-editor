// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import "normalize.css";
Vue.config.productionTip = false;

import "jointjs/dist/joint.css";
window.joint = require("jointjs");

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faSearchPlus,
  faSearchMinus,
  faRedoAlt,
  faUndoAlt,
  faCaretDown,
  faCaretRight
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faSearchPlus,
  faSearchMinus,
  faRedoAlt,
  faUndoAlt,
  faCaretDown,
  faCaretRight
);
Vue.component("font-awesome-icon", FontAwesomeIcon);

/* eslint-disable no-new */
new Vue({
  el: "#app",
  components: { App },
  template: "<App/>"
});
