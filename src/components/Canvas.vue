<template>
    <div class="paper-wrapper" ref="paperWrapper">
        <div id="paper" ref="paper"></div>
    </div>
</template>
<script>
export default {
  mounted() {
    const graph = new joint.dia.Graph();
    const paper = new joint.dia.Paper({
      el: this.$refs.paper,
      model: graph,
      width: 800,
      height: 1150,
      gridSize: 10,
      drawGrid: {
        name: "doubleMesh",
        args: [
          { color: "#f6f6f6", thickness: 1 }, // settings for the primary mesh
          { color: "#efefef", scaleFactor: 5, thickness: 2 } //settings for the secondary mesh
        ]
      },
      background: { color: "#fff" }
    });

    this.$refs.paperWrapper.parentElement.scrollLeft = 700;
    this.$refs.paperWrapper.parentElement.scrollTop = 500;
  }
};
</script>
<style scoped>
.paper-wrapper {
  padding: 500px 872px;
  background-color: #ebebeb;
  width: 800px;
}
#paper {
  box-shadow: 0px 0px 3px 0px #d9d9d9;
}
</style>

