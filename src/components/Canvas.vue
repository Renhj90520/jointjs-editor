<template>
    <div class="paper-wrapper" ref="paperWrapper">
        <div @drop="drop" @dragenter="dragenter" @dragleave="dragleave" @dragover="dragover" id="paper" ref="paper"></div>
    </div>
</template>
<script>
import Bus from '@/bus';
export default {
  data() {
    return {
      graph: null,
      paper: null,
      dragSource: null,
      scaleLevel: 1
    };
  },
  mounted() {
    this.graph = new joint.dia.Graph();
    this.paper = new joint.dia.Paper({
      el: this.$refs.paper,
      model: this.graph,
      width: 800,
      height: 1150,
      gridSize: 10,
      drawGrid: {
        name: 'doubleMesh',
        args: [
          { color: '#f6f6f6', thickness: 1 }, // settings for the primary mesh
          { color: '#efefef', scaleFactor: 5, thickness: 2 } //settings for the secondary mesh
        ]
      },
      background: { color: '#fff' }
    });

    this.$refs.paperWrapper.parentElement.scrollLeft = 700;
    this.$refs.paperWrapper.parentElement.scrollTop = 460;
    Bus.$on('drag-start', data => {
      this.dragSource = data;
    });
    Bus.$on('drag-end', () => {
      this.dragSource = null;
    });

    const that = this;
    Bus.$on('zoomin', () => {
      that.scaleLevel = Math.min(3, that.scaleLevel + 0.2);
      that.paper.scale(that.scaleLevel, that.scaleLevel);

      // TODO set size
    });
    Bus.$on('zoomout', () => {
      this.scaleLevel = Math.max(0.2, this.scaleLevel - 0.2);
      this.paper.scale(this.scaleLevel, this.scaleLevel);
    });
  },
  methods: {
    drop(event) {
      const position = this.calculateXY(event);
      if (this.dragSource) {
        switch (this.dragSource.type) {
          case 'rectangle':
            this.drawRect(position.x, position.y);
            break;
          default:
            break;
        }
      }
    },
    dragenter(event) {
      event.dataTransfer.dropEffect = 'linkMove';
    },
    dragleave(event) {},
    dragover(event) {
      event.preventDefault(); // Prevent default to allow drop
    },
    drawRect(x, y) {
      const rect = new joint.shapes.standard.Rectangle();
      rect.position(x, y);
      rect.resize(120, 60);
      rect.attr({
        body: { fill: '#fff' },
        label: {
          fill: '#000'
        },
        highlighter: {
          name: 'stroke',
          options: {
            padding: 10,
            rx: 5,
            ry: 5,
            attrs: {
              'stroke-width': 3,
              stroke: '#FF0000'
            }
          }
        }
      });
      rect.addTo(this.graph);
    },
    calculateXY(event) {
      const paper = this.$refs.paper;
      const stage = this.$refs.paper.parentElement.parentElement;
      const paperOffsetLeft =
        paper.offsetLeft - stage.scrollLeft + stage.parentElement.offsetLeft;
      const paperOffsetTop =
        paper.offsetTop -
        stage.scrollTop +
        stage.offsetTop +
        stage.parentElement.offsetTop;
      const x = event.pageX - paperOffsetLeft;
      const y = event.pageY - paperOffsetTop;
      return { x, y };
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

