<template>
    <li class="sidebar-item">
        <a class="title">
          <font-awesome-icon icon="caret-right"></font-awesome-icon>
          <span>{{info.title}}</span>
        </a>
        <div class="item-container" :style="{'height':isCollapsed?'0px':'auto'}">
            <a class="item" @dragstart="dragstart($event,item)" @dragend="dragend($event,item)" draggable="true" v-for="item in info.items" :key="item.type">
              <img width="36px" height="36px" :src="'/static/shapes/'+item.type+'.svg'" alt="aaa">
            </a>
        </div>
    </li>
</template>
<script>
export default {
  props: ["info"],
  data() {
    return {
      isCollapsed: false
    };
  },
  methods: {
    dragstart(event, data) {
      console.log(event);
      console.log(data);
      event.target.style.opacity = 0.5;
    },
    dragend(event, data) {
      console.log(event);
      console.log(data);
      event.target.style.opacity = "";
    }
  }
};
</script>
<style scoped>
.sidebar-item {
}
.item-container {
  overflow: hidden;
  padding: 4px;
}
.title {
  cursor: pointer;
  display: block;
  background-color: #eee;
  border-top: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
  padding: 6px 12px;
}

.title:hover {
  background-color: #e5e5e5;
}

.item {
  width: 40px;
  height: 40px;
  padding: 1px;
  display: block;
  cursor: move;
  border: 1px solid transparent;
  border-radius: 2px;
}

.item:hover {
  border: 1px solid gray;
}

.item > img {
  display: block;
}
</style>
