import { LinkOperation, ElementOperation } from './Operations';
export function extendHalo() {
  joint.ui.Halo = joint.mvc.View.extend(
    {
      PIE_INNER_RADIUS: 20,
      PIE_OUTER_RADIUS: 50,
      className: 'halo',
      events: {
        'mousedown .handle': 'onHandlePointerDown',
        'touchstart .handle': 'onHandlePointerDown',
        'mousedown .pie-toggle': 'onPieTogglePointerDown',
        'touchstart .pie-toggle': 'onPieTogglePointerDown'
      },
      documentEvents: {
        mousemove: 'pointermove',
        touchmove: 'pointermove',
        mouseup: 'pointerup',
        touchend: 'pointerup'
      },
      options: {
        clearAll: !0,
        clearOnBlankPointerdown: !0,
        useModelGeometry: !1,
        clone: function(a, b) {
          return a.clone().unset('z');
        },
        type: 'surrounding',
        pieSliceAngle: 45,
        pieStartAngleOffset: 0,
        pieIconSize: 14,
        pieToggles: [{ name: 'default', position: 'e' }]
      },
      init: function() {
        var options = this.options,
          cellView = options.cellView,
          model = cellView.model,
          operation = model.isLink()
            ? new LinkOperation()
            : new ElementOperation();
        joint.util.assign(this, operation.functions);
        var h = cellView.paper,
          i = h.model;
        joint.util.defaults(options, operation.options, { paper: h, graph: i }),
          joint.util.bindAll(this, 'render', 'update'),
          options.clearAll && this.constructor.clear(h),
          this.listenTo(i, 'reset', this.remove),
          this.listenTo(model, 'remove', this.remove),
          this.listenTo(h, 'halo:create', this.remove),
          options.clearOnBlankPointerdown &&
            this.listenTo(h, 'blank:pointerdown', this.remove),
          this.listenTo(i, 'all', this.update),
          this.listenTo(h, 'scale translate', this.update),
          (this.handles = []),
          joint.util.toArray(options.handles).forEach(this.addHandle, this);
      },
      render: function() {
        var b = this.options;
        switch (
          (this.$el.empty(),
          (this.$handles = $('<div/>')
            .addClass('handles')
            .appendTo(this.el)),
          // (this.$box = $('<label/>')
          //   .addClass('box')
          //   .appendTo(this.el)),
          (this.$pieToggles = {}),
          this.$el.addClass(b.type),
          this.$el.addClass(this.cellTypeCssClass()),
          this.$el.attr('data-type', b.cellView.model.get('type')),
          this.$handles.append(
            joint.util.toArray(this.handles).map(this.renderHandle, this)
          ),
          b.type)
        ) {
          case 'toolbar':
          case 'surrounding':
            this.hasHandle('fork') && this.toggleFork();
            break;
          case 'pie':
            joint.util.toArray(this.options.pieToggles).forEach(function(b) {
              var c = $('<div/>');
              c.addClass('pie-toggle ' + (b.position || 'e')),
                c.attr('data-name', b.name),
                joint.util.setAttributesBySelector(c, b.attrs),
                c.appendTo(this.el),
                (this.$pieToggles[b.name] = c);
            }, this);
            break;
          default:
            throw new Error('ui.Halo: unknown type');
        }
        return (
          this.update(),
          this.$el.addClass('animate').appendTo(b.paper.el),
          this.setPieIcons(),
          this
        );
      },
      setPieIcons: function() {
        'pie' === this.options.type &&
          this.$el.find('.handle').each(
            function(a, b) {
              var c,
                d = $(b),
                e = d.attr('data-action'),
                f = this.getHandle(e);
              if (!f || !f.icon) {
                var g = window
                  .getComputedStyle(b, ':before')
                  .getPropertyValue('content');
                g &&
                  'none' !== g &&
                  ((c = d.find('.slice-text-icon')),
                  c.length > 0 && V(c[0]).text(g.replace(/['"]/g, '')));
                var h = d.css('background-image');
                if (h) {
                  var i = h.match(/url\(['"]?([^'"]+)['"]?\)/);
                  if (i) {
                    var j = i[1];
                    (c = d.find('.slice-img-icon')),
                      c.length > 0 && V(c[0]).attr('xlink:href', j);
                  }
                }
              }
            }.bind(this)
          );
      },
      update: function() {
        if (this.isRendered()) {
          // this.updateBoxContent();
          var bbox = this.getBBox();
          this.$el.toggleClass(
            'tiny',
            bbox.width < this.options.tinyThreshold &&
              bbox.height < this.options.tinyThreshold
          ),
            this.$el.toggleClass(
              'small',
              !this.$el.hasClass('tiny') &&
                bbox.width < this.options.smallThreshold &&
                bbox.height < this.options.smallThreshold
            ),
            this.$el.css({
              width: bbox.width,
              height: bbox.height,
              left: bbox.x,
              top: bbox.y
            }),
            this.hasHandle('unlink') && this.toggleUnlink();
        }
      },
      getBBox: function() {
        var cellView = this.options.cellView,
          bbox = this.options.bbox,
          d = joint.util.isFunction(bbox) ? bbox(cellView, this) : bbox;
        return (
          (d = joint.util.defaults({}, d, { x: 0, y: 0, width: 1, height: 1 })),
          joint.g.rect(d)
        );
      },
      cellTypeCssClass: function() {
        return this.options.typeCssName;
      },
      // updateBoxContent: function() {
      //   var b = this.options.boxContent,
      //     c = this.options.cellView;
      //   if (joint.util.isFunction(b)) {
      //     var d = b.call(this, c, this.$box[0]);
      //     d && this.$box.html(d);
      //   } else b ? this.$box.html(b) : this.$box.remove();
      // },
      extendHandles: function(b) {
        joint.util.forIn(
          b,
          function(b) {
            var c = this.getHandle(b.name);
            c && joint.util.assign(c, b);
          }.bind(this)
        );
      },
      addHandles: function(b) {
        return joint.util.toArray(b).forEach(this.addHandle, this), this;
      },
      addHandle: function(b) {
        var c = this.getHandle(b.name);
        return (
          c ||
            (this.handles.push(b),
            joint.util.forIn(
              b.events,
              function(c, d) {
                joint.util.isString(c)
                  ? this.on('action:' + b.name + ':' + d, this[c], this)
                  : this.on('action:' + b.name + ':' + d, c);
              }.bind(this)
            ),
            this.$handles && this.renderHandle(b).appendTo(this.$handles)),
          this
        );
      },
      renderHandle: function(b) {
        var c = this.getHandleIdx(b.name),
          d = $('<div/>')
            .addClass('handle')
            .addClass(b.name)
            .attr('data-action', b.name)
            .prop('draggable', !1);
        switch (this.options.type) {
          case 'toolbar':
          case 'surrounding':
            d.addClass(b.position), b.content && d.html(b.content);
            break;
          case 'pie':
            var e = this.PIE_OUTER_RADIUS,
              f = this.PIE_INNER_RADIUS,
              h = (e + f) / 2,
              i = joint.g.point(e, e),
              j = joint.g.toRad(this.options.pieSliceAngle),
              k = c * j + joint.g.toRad(this.options.pieStartAngleOffset),
              l = k + j,
              m = V.createSlicePathData(f, e, k, l),
              n = V('svg').addClass('slice-svg'),
              o = V('path')
                .attr('d', m)
                .translate(e, e)
                .addClass('slice'),
              p = joint.g.point.fromPolar(h, -k - j / 2, i),
              q = this.options.pieIconSize,
              r = V('image')
                .attr(p)
                .addClass('slice-img-icon');
            p.y = p.y + q - 2;
            var s = V('text', { 'font-size': q })
              .attr(p)
              .addClass('slice-text-icon');
            r.attr({ width: q, height: q }),
              r.translate(-q / 2, -q / 2),
              s.translate(-q / 2, -q / 2),
              n.append([o, r, s]),
              d.append(n.node);
        }
        return (
          b.icon && this.setHandleIcon(d, b.icon),
          joint.util.setAttributesBySelector(d, b.attrs),
          d
        );
      },
      setHandleIcon: function(a, b) {
        switch (this.options.type) {
          case 'pie':
            var c = a.find('.slice-img-icon');
            V(c[0]).attr('xlink:href', b);
            break;
          case 'toolbar':
          case 'surrounding':
            a.css('background-image', 'url(' + b + ')');
        }
      },
      removeHandles: function() {
        for (; this.handles.length; ) this.removeHandle(this.handles[0].name);
        return this;
      },
      removeHandle: function(b) {
        var c = this.getHandleIdx(b),
          d = this.handles[c];
        return (
          d &&
            (joint.util.forIn(
              d.events,
              function(a, c) {
                this.off('action:' + b + ':' + c);
              }.bind(this)
            ),
            this.$('.handle.' + b).remove(),
            this.handles.splice(c, 1)),
          this
        );
      },
      changeHandle: function(b, c) {
        var d = this.getHandle(b);
        return (
          d &&
            (this.removeHandle(b),
            this.addHandle(joint.util.merge({ name: b }, d, c))),
          this
        );
      },
      hasHandle: function(a) {
        return this.getHandleIdx(a) !== -1;
      },
      getHandleIdx: function(b) {
        return joint.util.toArray(this.handles).findIndex(function(a) {
          return a.name === b;
        });
      },
      getHandle: function(b) {
        return joint.util.toArray(this.handles).find(function(a) {
          return a.name === b;
        });
      },
      toggleHandle: function(a, b) {
        var c = this.getHandle(a);
        if (c) {
          var d = this.$('.handle.' + a);
          void 0 === b && (b = !d.hasClass('selected')),
            d.toggleClass('selected', b);
          var e = b ? c.iconSelected : c.icon;
          e && this.setHandleIcon(d, e);
        }
        return this;
      },
      selectHandle: function(a) {
        return this.toggleHandle(a, !0);
      },
      deselectHandle: function(a) {
        return this.toggleHandle(a, !1);
      },
      deselectAllHandles: function() {
        return (
          joint.util.toArray(this.handles).forEach(function(a) {
            this.deselectHandle(a.name);
          }, this),
          this
        );
      },
      onHandlePointerDown: function(evt) {
        var c = (this._action = $(evt.target)
          .closest('.handle')
          .attr('data-action'));
        if (c) {
          evt.preventDefault(),
            evt.stopPropagation(),
            (evt = joint.util.normalizeEvent(evt));
          var d = this.options.paper.snapToGrid({
              x: evt.clientX,
              y: evt.clientY
            }),
            e = d.x,
            f = d.y;
          (this._localX = e),
            (this._localY = f),
            (this._evt = evt),
            'mousedown' === evt.type && 2 === evt.button
              ? this.triggerAction(c, 'contextmenu', evt, e, f)
              : (this.triggerAction(c, 'pointerdown', evt, e, f),
                this.delegateDocumentEvents(null, evt.data));
        }
      },
      onPieTogglePointerDown: function(evt) {
        evt.stopPropagation();
        var b = $(evt.target).closest('.pie-toggle'),
          c = b.attr('data-name');
        this.isOpen(c)
          ? this.toggleState(c)
          : this.isOpen()
            ? (this.toggleState(), this.toggleState(c))
            : this.toggleState(c);
      },
      triggerAction: function(action, evtType, evt) {
        var d = Array.prototype.slice.call(arguments, 2);
        d.unshift('action:' + action + ':' + evtType), this.trigger.apply(this, d);
      },
      stopBatch: function() {
        this.options.graph.stopBatch('halo', { halo: this.cid });
      },
      startBatch: function() {
        this.options.graph.startBatch('halo', { halo: this.cid });
      },
      pointermove: function(b) {
        if (this._action) {
          b.preventDefault(),
            b.stopPropagation(),
            (b = joint.util.normalizeEvent(b));
          var c = this.options.paper.snapToGrid({
              x: b.clientX,
              y: b.clientY
            }),
            d = c.x - this._localX,
            e = c.y - this._localY;
          (this._localX = c.x),
            (this._localY = c.y),
            (this._evt = b),
            this.triggerAction(this._action, 'pointermove', b, c.x, c.y, d, e);
        }
      },
      pointerup: function(a) {
        var b = this._action;
        if (b) {
          (this._action = null), (this._evt = null);
          var c = this.options.paper.snapToGrid({
            x: a.clientX,
            y: a.clientY
          });
          this.triggerAction(b, 'pointerup', a, c.x, c.y),
            this.undelegateDocumentEvents();
        }
      },
      onRemove: function() {
        this._action && this._evt && this.pointerup(this._evt),
          this.options.graph.hasActiveBatch('halo') && this.stopBatch();
      },
      onSetTheme: function() {
        this.setPieIcons();
      },
      removeElement: function() {
        this.options.cellView.model.remove();
      },
      toggleUnlink: function() {
        var a =
          this.options.graph.getConnectedLinks(this.options.cellView.model)
            .length > 0;
        this.$handles.children('.unlink').toggleClass('hidden', !a);
      },
      toggleFork: function() {
        var a = this.options.cellView.model.clone(),
          b = this.options.paper.createViewForModel(a),
          c = this.options.paper.options.validateConnection(
            this.options.cellView,
            null,
            b,
            null,
            'target'
          );
        this.$handles.children('.fork').toggleClass('hidden', !c),
          b.remove(),
          (a = null);
      },
      toggleState: function(b) {
        if (this.isRendered()) {
          var c = this.$el;
          if (
            (joint.util.forIn(this.$pieToggles, function(a) {
              a.removeClass('open');
            }),
            this.isOpen())
          )
            this.trigger('state:close', b), c.removeClass('open');
          else {
            if ((this.trigger('state:open', b), b)) {
              var d = joint.util
                .toArray(this.options.pieToggles)
                .find(function(a) {
                  return a.name === b;
                });
              d &&
                c.attr({
                  'data-pie-toggle-position': d.position,
                  'data-pie-toggle-name': d.name
                }),
                this.$pieToggles[b].addClass('open');
            }
            c.addClass('open');
          }
        }
      },
      isOpen: function(a) {
        return (
          !!this.isRendered() &&
          (a ? this.$pieToggles[a].hasClass('open') : this.$el.hasClass('open'))
        );
      },
      isRendered: function() {
        // return void 0 !== this.$box;
        return void 0 !== this.$handles;
      }
    },
    {
      clear: function(a) {
        a.trigger('halo:create');
      }
    }
  );
}
