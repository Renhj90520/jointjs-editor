<template>
  <ul class="sidebar">
    <app-sidebar-item v-for="item in items" :key="item.title" :info="item"></app-sidebar-item>
  </ul>
</template>
<script>
import SidebarItem from './SidebarItem';
export default {
  data() {
    return {
      items: [
        {
          title: 'General',
          items: [{ type: 'rectangle' }]
        }
      ]
    };
  },
  components: {
    'app-sidebar-item': SidebarItem
  }
};
</script>
<style scoped>
.sidebar {
  flex: 0 0 200px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0px;
  margin: 0px;
}
</style>

