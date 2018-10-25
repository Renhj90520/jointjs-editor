// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import 'normalize.css';
Vue.config.productionTip = false;
window.$ = require('jquery');
window.Backbone = require('backbone');
Backbone.$ = $;
import 'jointjs/dist/joint.css';
window.joint = require('jointjs');
import { extendTextEditor } from './rappid/TextEditor';
import { extendSelection } from './rappid/Selection';
import { extendHalo } from './rappid/Halo';
import { extendFreeTransform } from './rappid/FreeTransform';
import { defineDefaultLink } from './rappid/Link';
import { extendCommandManager } from './rappid/CommandManager'
extendTextEditor();
extendSelection();
extendHalo();
extendFreeTransform();
defineDefaultLink();
extendCommandManager();
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faSearchPlus,
  faSearchMinus,
  faRedoAlt,
  faUndoAlt,
  faCaretDown,
  faCaretRight
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faSearchPlus,
  faSearchMinus,
  faRedoAlt,
  faUndoAlt,
  faCaretDown,
  faCaretRight
);
Vue.component('font-awesome-icon', FontAwesomeIcon);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
});
