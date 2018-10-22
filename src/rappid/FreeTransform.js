export function extendFreeTransform() {
  joint.ui.FreeTransform = joint.mvc.View.extend(
    {
      className: 'free-transform',
      events: {
        'mousedown .resize': 'startResizing',
        'mousedown .rotate': 'startRotating',
        'touchstart .resize': 'startResizing',
        'touchstart .rotate': 'startRotating'
      },
      DIRECTIONS: ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'],
      POSITIONS: [
        'top-left',
        'top',
        'top-right',
        'right',
        'bottom-right',
        'bottom',
        'bottom-left',
        'left'
      ],
      options: {
        cellView: void 0,
        rotateAngleGrid: 15,
        preserveAspectRatio: !1,
        minWidth: 0,
        minHeight: 0,
        maxWidth: 1 / 0,
        maxHeight: 1 / 0,
        allowOrthogonalResize: !0,
        allowRotation: !0,
        clearAll: !0,
        clearOnBlankPointerdown: !0
      },
      init: function() {
        var options = this.options;
        options.cellView &&
          joint.util.defaults(options, {
            cell: options.cellView.model,
            paper: options.cellView.paper,
            graph: options.cellView.paper.model
          }),
          joint.util.bindAll(
            this,
            'update',
            'remove',
            'pointerup',
            'pointermove'
          );
        var paper = options.paper,
          graph = options.graph;
        options.clearAll && this.constructor.clear(paper),
          $(document.body).on('mousemove touchmove', this.pointermove),
          $(document).on('mouseup touchend', this.pointerup),
          this.listenTo(graph, 'all', this.update),
          this.listenTo(paper, 'scale translate', this.update),
          this.listenTo(graph, 'reset', this.remove),
          this.listenTo(options.cell, 'remove', this.remove),
          options.clearOnBlankPointerdown &&
            this.listenTo(paper, 'blank:pointerdown', this.remove),
          paper.$el.append(this.el),
          this.constructor.registerInstanceToPaper(this, paper);
      },
      renderHandles: function() {
        var a = $('<div/>').prop('draggable', !1),
          c = this.POSITIONS.map(function(b) {
            return a
              .clone()
              .addClass('resize')
              .attr('data-position', b);
          });
        this.$el.empty().append(c);
      },
      render: function() {
        this.renderHandles(),
          this.$el.attr('data-type', this.options.cell.get('type')),
          this.$el.toggleClass(
            'no-orthogonal-resize',
            this.options.preserveAspectRatio ||
              !this.options.allowOrthogonalResize
          ),
          this.$el.toggleClass('no-rotation', !this.options.allowRotation),
          this.update();
      },
      update: function() {
        var paperMatrix = this.options.paper.matrix(),
          cellBBox = this.options.cell.getBBox();
        (cellBBox.x *= paperMatrix.a),
          (cellBBox.x += paperMatrix.e),
          (cellBBox.y *= paperMatrix.d),
          (cellBBox.y += paperMatrix.f),
          (cellBBox.width *= paperMatrix.a),
          (cellBBox.height *= paperMatrix.d);
        var c = joint.g.normalizeAngle(this.options.cell.get('angle') || 0),
          d = 'rotate(' + c + 'deg)';
        this.$el.css({
          width: cellBBox.width + 4,
          height: cellBBox.height + 4,
          left: cellBBox.x - 3,
          top: cellBBox.y - 3,
          transform: d,
          '-webkit-transform': d,
          '-ms-transform': d
        });
        var e = Math.floor(c * (this.DIRECTIONS.length / 360));
        if (e != this._previousDirectionsShift) {
          var f = this.DIRECTIONS.slice(e).concat(this.DIRECTIONS.slice(0, e));
          this.$('.resize')
            .removeClass(this.DIRECTIONS.join(' '))
            .each(function(a, b) {
              $(b).addClass(f[a]);
            }),
            (this._previousDirectionsShift = e);
        }
      },
      calculateTrueDirection: function(a) {
        var cell = this.options.cell,
          normalizeAngle = joint.g.normalizeAngle(cell.get('angle')),
          index = this.POSITIONS.indexOf(a);
        return (
          (index += Math.floor(normalizeAngle * (this.POSITIONS.length / 360))),
          (index %= this.POSITIONS.length),
          this.POSITIONS[index]
        );
      },
      startResizing: function(evt) {
        evt.stopPropagation(),
          this.options.graph.startBatch('free-transform', {
            freeTransform: this.cid
          });
        var b = $(evt.target).data('position'),
          c = this.calculateTrueDirection(b),
          d = 0,
          e = 0;
        b.split('-').forEach(function(a) {
          (d = { left: -1, right: 1 }[a] || d),
            (e = { top: -1, bottom: 1 }[a] || e);
        });
        var f = this.toValidResizeDirection(b),
          h = {
            'top-right': 'bottomLeft',
            'top-left': 'corner',
            'bottom-left': 'topRight',
            'bottom-right': 'origin'
          }[f];
        (this._initial = {
          angle: joint.g.normalizeAngle(this.options.cell.get('angle') || 0),
          resizeX: d,
          resizeY: e,
          selector: h,
          direction: f,
          relativeDirection: b,
          trueDirection: c
        }),
          (this._action = 'resize'),
          this.startOp(evt.target);
      },
      toValidResizeDirection: function(a) {
        return (
          {
            top: 'top-left',
            bottom: 'bottom-right',
            left: 'bottom-left',
            right: 'top-right'
          }[a] || a
        );
      },
      startRotating: function(a) {
        a.stopPropagation(),
          this.options.graph.startBatch('free-transform', {
            freeTransform: this.cid
          });
        var b = this.options.cell.getBBox().center(),
          c = this.options.paper.snapToGrid({ x: a.clientX, y: a.clientY });
        (this._initial = {
          centerRotation: b,
          modelAngle: joint.g.normalizeAngle(
            this.options.cell.get('angle') || 0
          ),
          startAngle: joint.g.point(c).theta(b)
        }),
          (this._action = 'rotate'),
          this.startOp(a.target);
      },
      pointermove: function(evt) {
        if (this._action) {
          evt = joint.util.normalizeEvent(evt);
          var options = this.options,
            c = options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY }),
            gridSize = options.paper.options.gridSize,
            cell = options.cell,
            f = this._initial;
          switch (this._action) {
            case 'resize':
              var h = cell.getBBox(),
                i = joint.g.point(c).rotate(h.center(), f.angle),
                j = i.difference(h[f.selector]()),
                k = f.resizeX ? j.x * f.resizeX : h.width,
                l = f.resizeY ? j.y * f.resizeY : h.height;
              if (
                ((k = joint.g.snapToGrid(k, gridSize)),
                (l = joint.g.snapToGrid(l, gridSize)),
                (k = Math.max(k, options.minWidth || gridSize)),
                (l = Math.max(l, options.minHeight || gridSize)),
                (k = Math.min(k, options.maxWidth)),
                (l = Math.min(l, options.maxHeight)),
                options.preserveAspectRatio)
              ) {
                var m = (h.width * l) / h.height,
                  n = (h.height * k) / h.width;
                m > k ? (l = n) : (k = m);
              }
              (h.width == k && h.height == l) ||
                cell.resize(k, l, {
                  freeTransform: this.cid,
                  direction: f.direction,
                  relativeDirection: f.relativeDirection,
                  trueDirection: f.trueDirection,
                  ui: !0,
                  minWidth: options.minWidth,
                  minHeight: options.minHeight,
                  maxWidth: options.maxWidth,
                  maxHeight: options.maxHeight,
                  preserveAspectRatio: options.preserveAspectRatio
                });
              break;
            case 'rotate':
              var o = f.startAngle - joint.g.point(c).theta(f.centerRotation);
              cell.rotate(
                joint.g.snapToGrid(f.modelAngle + o, options.rotateAngleGrid),
                !0
              );
          }
        }
      },
      pointerup: function(a) {
        this._action &&
          (this.stopOp(),
          this.options.graph.stopBatch('free-transform', {
            freeTransform: this.cid
          }),
          (this._action = null),
          (this._initial = null));
      },
      onRemove: function() {
        $(document.body).off('mousemove touchmove', this.pointermove),
          $(document).off('mouseup touchend', this.pointerup),
          joint.ui.FreeTransform.unregisterInstanceFromPaper(
            this,
            this.options.paper
          );
      },
      startOp: function(a) {
        a && ($(a).addClass('in-operation'), (this._elementOp = a)),
          this.$el.addClass('in-operation');
      },
      stopOp: function() {
        this._elementOp &&
          ($(this._elementOp).removeClass('in-operation'),
          (this._elementOp = null)),
          this.$el.removeClass('in-operation');
      }
    },
    {
      instancesByPaper: {},
      clear: function(a) {
        a.trigger('freetransform:create'), this.removeInstancesForPaper(a);
      },
      removeInstancesForPaper: function(a) {
        joint.util.invoke(this.getInstancesForPaper(a), 'remove');
      },
      getInstancesForPaper: function(a) {
        return this.instancesByPaper[a.cid] || {};
      },
      registerInstanceToPaper: function(a, b) {
        this.instancesByPaper[b.cid] || (this.instancesByPaper[b.cid] = {}),
          (this.instancesByPaper[b.cid][a.cid] = a);
      },
      unregisterInstanceFromPaper: function(a, b) {
        this.instancesByPaper[b.cid] &&
          (this.instancesByPaper[b.cid][a.cid] = null);
      }
    }
  );
}
