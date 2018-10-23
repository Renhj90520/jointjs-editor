<template>
    <div class="paper-wrapper" ref="paperWrapper">
        <div @drop="drop" @dragenter="dragenter" @dragleave="dragleave" @dragover="dragover" id="paper" ref="paper"></div>
    </div>
</template>
<script>
import Bus from '@/bus';
import '../rappid/halo.css';
import '../rappid/freetransform.css';
export default {
  data() {
    return {
      graph: null,
      paper: null,
      dragSource: null,
      scaleLevel: 1,
      textEditor: null,
      cellViewUnderEdit: null,
      selection: null
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
      defaultLink: new joint.shapes.app.Link(),
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
    this.selection = new joint.ui.Selection({
      paper: this.paper,
      graph: this.graph
    }).on({
      'selection-box:pointerdown': (cellView, evt) => {}
    });

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

      const newWidth = 800 * that.scaleLevel;
      const newHeight = 1150 * that.scaleLevel;
      that.$refs.paperWrapper.style.width = newWidth + 'px';
      that.paper.setDimensions(newWidth, newHeight);
    });
    Bus.$on('zoomout', () => {
      this.scaleLevel = Math.max(0.2, this.scaleLevel - 0.2);
      this.paper.scale(this.scaleLevel, this.scaleLevel);

      const newWidth = 800 * that.scaleLevel;
      const newHeight = 1150 * that.scaleLevel;
      that.$refs.paperWrapper.style.width = newWidth + 'px';
      that.paper.setDimensions(newWidth, newHeight);
    });
    this.initializeInlineTextEditor();
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
          text: '            ',
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
    },
    initializeInlineTextEditor() {
      const that = this;
      this.paper.on('cell:pointerdblclick', (cellView, evt) => {
        // clean up the old text editor if there was one
        this.closeEditor();
        const vTarget = joint.V(evt.target);
        const text = joint.ui.TextEditor.getTextElement(evt.target);
        if (text) {
          this.textEditor = new joint.ui.TextEditor({ text });
          this.textEditor.render(this.paper.el);
          this.textEditor.on('text:change', newText => {
            const cell = that.cellViewUnderEdit.model;
            cell.prop(that.cellViewUnderEdit.textEditPath, newText);
          });
          this.cellViewUnderEdit = cellView;
          this.cellViewUnderEdit.textEditPath = 'attrs/label/text';
          this.cellViewUnderEdit.setInteractivity(false);
        }
      });

      this.paper.on('element:pointerup', elementView => {
        that.openTools(elementView);
      });
      this.paper.on('blank:pointerdown', () => {
        that.selection.collection.reset([]);
      });

      $(document.body).on('click', evt => {
        const text = joint.ui.TextEditor.getTextElement(evt.target);
        if (this.textEditor && !text) {
          this.closeEditor();
        }
      });
      document.body.addEventListener('keydown', evt => {
        const code = evt.which || evt.keyCode;
        if ((code === 8 || code === 46) && !that.textEditor) {
          that.graph.removeCells(that.selection.collection.toArray());
          return false;
        }
        return true;
      });
    },
    closeEditor() {
      if (this.textEditor) {
        this.textEditor.remove();
        // reenable dragging after inline editing
        this.cellViewUnderEdit.setInteractivity(true);
        this.textEditor = null;
        this.cellViewUnderEdit = null;
      }
    },
    openTools(cellView) {
      const cell = cellView.model;
      if (!cell.isLink() && !this.selection.collection.contains(cell)) {
        this.selection.collection.reset([]);

        this.selection.collection.add(cell, { silent: true });

        const freeTransform = new joint.ui.FreeTransform({
          cellView,
          allowOrthogonalResize: true,
          allowRotation: true
        });
        freeTransform.render();

        const halo = new joint.ui.Halo({
          cellView,
          theme: 'default',
          boxContent: function(cellView) {
            return cellView.model.get('type');
          }
        });
        halo.render();
        halo.removeHandle('resize');
        halo.removeHandle('clone');
        halo.removeHandle('fork');
        halo.removeHandle('unlink');
      }
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

