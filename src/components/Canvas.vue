<template>
    <div class="paper-wrapper" ref="paperWrapper">
        <div @drop="drop" @dragenter="dragenter" @dragleave="dragleave" @dragover="dragover" id="paper" ref="paper"></div>
    </div>
</template>
<script>
import Bus from "@/bus";
export default {
  data() {
    return {
      graph: null,
      dragSource: null
    };
  },
  mounted() {
    this.graph = new joint.dia.Graph();
    const paper = new joint.dia.Paper({
      el: this.$refs.paper,
      model: this.graph,
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
    Bus.$on("drag-start", data => {
      this.dragSource = data;
    });
    Bus.$on("drag-end", () => {
      this.dragSource = null;
    });
  },
  methods: {
    drop(event) {
      console.log(event);
      console.log(this.dragSource);
      if (this.dragSource) {
        switch (this.dragSource.type) {
          case "rectangle":
            this.drawRect();
            break;
          default:
            break;
        }
      }
    },
    dragenter(event) {
      console.log(event);
      event.dataTransfer.dropEffect = "linkMove";
    },
    dragleave(event) {
      console.log(event);
    },
    dragover(event) {
      console.log(event);
      event.preventDefault(); // Prevent default to allow drop
    },
    drawRect() {
      const rect = new joint.shapes.standard.Rectangle();
      rect.position(100, 30);
      rect.resize(100, 40);
      rect.attr({
        body: { fill: "blue" },
        label: {
          text: "Hello",
          fill: "white"
        },
        highlighter: {
          name: "stroke",
          options: {
            padding: 10,
            rx: 5,
            ry: 5,
            attrs: {
              "stroke-width": 3,
              stroke: "#FF0000"
            }
          }
        }
      });
      rect.addTo(this.graph);
    }
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

