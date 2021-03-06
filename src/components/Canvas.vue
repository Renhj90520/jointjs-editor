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
      selection: null,
      commandManager: null
    };
  },
  mounted() {
    this.graph = new joint.dia.Graph();
    this.commandManager = new joint.dia.CommandManager({ graph: this.graph });
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

    const cloud = new joint.shapes.custom.Cloud();
    cloud.position(120, 80);
    cloud.addTo(this.graph);

    const clipboard = new joint.shapes.basic.Path({
      size: { width: 120, height: 80 },
      attrs: {
        path: {
          d:
            'M384 112v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h80c0-35.29 28.71-64 64-64s64 28.71 64 64h80c26.51 0 48 21.49 48 48zM192 40c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24m96 114v-20a6 6 0 0 0-6-6H102a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6h180a6 6 0 0 0 6-6z',
          fill: {
                type:'linearGradient',
                stops:[
                  {offset:'20%',color:'#39F'},
                  {offset:'90%',color:'#F3F'},
                ]
              },
              'stroke-width':0,
               filter: {
                  name: "dropShadow",
                  args: { dx: 1, dy: 2, blur: 8, color: "#000", opacity: 0.1 }
                },
        },
        text: {
          ref: 'path',
          'font-size': 14,
          'ref-x': 0.5,
          'ref-y': 0,
          'y-alignment': 'middle',
          'x-alignment': 'middle',
          text: 'text'
        }
      }
    });
    clipboard.addTo(this.graph);

    this.$refs.paperWrapper.parentElement.scrollLeft = 700;
    this.$refs.paperWrapper.parentElement.scrollTop = 460;
    this.selection = new joint.ui.Selection({
      paper: this.paper,
      graph: this.graph
    }).on({
      'selection-box:pointerdown': (cellView, evt) => {
        // deselect
      }
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

    Bus.$on('redo', () => {
      this.commandManager.redo();
      this.selection.cancelSelection();
    });
    Bus.$on('undo', () => {
      this.commandManager.undo();
      this.selection.cancelSelection();
    });

    Bus.$on('export', () => {
      const aTag = document.createElement('a');
      let blob;
      aTag.download = 'graph.json';

      blob = new Blob([JSON.stringify(this.graph)]);

      const url = URL.createObjectURL(blob);
      aTag.href = url;
      aTag.click();
      URL.revokeObjectURL(url);
    });

    Bus.$on('import', e => {
      this.graph.fromJSON(JSON.parse(e));
    });
    this.initializeInlineTextEditor();
    this.initializeTools();
  },
  methods: {
    drop(event) {
      const position = this.calculateXY(event);
      if (this.dragSource) {
        switch (this.dragSource.type) {
          case 'rectangle':
            this.drawRect(position.x, position.y, this.dragSource);
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
    drawRect(x, y, data) {
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
      rect.data = data;
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

      this.paper.on('blank:pointerdown', () => {
        // that.selection.collection.reset([]);
        that.selection.cancelSelection();
        that.paper.removeTools();
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
    initializeTools() {
      const that = this;
      this.paper.on({
        'element:pointerup': elementView => {
          that.openTools(elementView);
        },
        // 'element:mouseenter': elementView => {
        //   that.openTools(elementView, true);
        // },
        'link:pointerup': linkView => {
          const link = linkView.model;
          const linkTools = joint.linkTools;
          const toolsView = new joint.dia.ToolsView({
            name: 'link-pointerdown',
            tools: [
              new linkTools.Vertices(),
              new linkTools.SourceAnchor(),
              new linkTools.TargetAnchor(),
              new linkTools.SourceArrowhead(),
              new linkTools.TargetArrowhead(),
              new linkTools.Segments(),
              new linkTools.Boundary({ padding: 15 }),
              new linkTools.Remove({ offset: -20, distance: 40 })
            ]
          });
          that.selection.collection.reset([]);
          that.selection.collection.add(link, { silent: true });
          const paper = that.paper;
          joint.ui.Halo.clear(paper);
          joint.ui.FreeTransform.clear(paper);
          paper.removeTools();

          linkView.addTools(toolsView);
        },
        'link:mouseenter': linkView => {
          if (linkView.hasTools()) return;

          const linkTools = joint.linkTools;
          const toolsView = new joint.dia.ToolsView({
            name: 'link-hover',
            tools: [
              new linkTools.Vertices({ vertexAdding: false }),
              new linkTools.SourceArrowhead(),
              new linkTools.TargetArrowhead()
            ]
          });
          linkView.addTools(toolsView);
        },
        'link:mouseleave': linkView => {
          if (linkView.hasTools('link-hover')) {
            linkView.removeTools();
          }
        }
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
    openTools(cellView, isMouseEnter = false) {
      const cell = cellView.model;
      if (!cell.isLink() && !this.selection.collection.contains(cell)) {
        if (!isMouseEnter) {
          this.selection.collection.reset([]);

          this.selection.collection.add(cell, { silent: true });

          const freeTransform = new joint.ui.FreeTransform({
            cellView,
            allowOrthogonalResize: true,
            allowRotation: true
          });
          freeTransform.render();
        }

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
        if (isMouseEnter) {
          halo.removeHandle('rotate');
          halo.removeHandle('remove');
        }
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

