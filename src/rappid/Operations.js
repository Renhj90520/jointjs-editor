export class LinkOperation {
  options = {
    handles: [
      {
        name: 'remove',
        position: 'nw',
        events: { pointerdown: 'removeElement' },
        icon: null
      },
      {
        name: 'direction',
        position: 'se',
        events: { pointerdown: 'directionSwap' },
        icon: null
      }
    ],
    bbox: function(a) {
      var b = 0.5 * a.getConnectionLength();
      return a.getPointAtLength(b);
    },
    typeCssName: 'type-link',
    tinyThreshold: -1,
    smallThreshold: -1,
    boxContent: !1
  };
  functions = {
    directionSwap: () => {
      var model = this.options.cellView.model;
      model.set(
        { source: model.get('target'), target: model.get('source') },
        { halo: this.cid }
      );
    }
  };
}

export class ElementOperation {
  options = {
    handles: [
      {
        name: 'remove',
        position: 'nw',
        events: { pointerdown: 'removeElement' },
        icon: null
      },
      {
        name: 'resize',
        position: 'se',
        events: {
          pointerdown: 'startResizing',
          pointermove: 'doResize',
          pointerup: 'stopBatch'
        },
        icon: null
      },
      {
        name: 'clone',
        position: 'n',
        events: {
          pointerdown: 'startCloning',
          pointermove: 'doClone',
          pointerup: 'stopCloning'
        },
        icon: null
      },
      {
        name: 'link',
        position: 'e',
        events: {
          pointerdown: 'startLinking',
          pointermove: 'doLink',
          pointerup: 'stopLinking'
        },
        icon: null
      },
      {
        name: 'link',
        position: 's',
        events: {
          pointerdown: 'startLinking',
          pointermove: 'doLink',
          pointerup: 'stopLinking'
        },
        icon: null
      },
      {
        name: 'link',
        position: 'w',
        events: {
          pointerdown: 'startLinking',
          pointermove: 'doLink',
          pointerup: 'stopLinking'
        },
        icon: null
      },
      {
        name: 'fork',
        position: 'ne',
        events: {
          pointerdown: 'startForking',
          pointermove: 'doFork',
          pointerup: 'stopForking'
        },
        icon: null
      },
      {
        name: 'unlink',
        position: 'w',
        events: { pointerdown: 'unlinkElement' },
        icon: null
      },
      {
        name: 'rotate',
        position: 'n',
        events: {
          pointerdown: 'startRotating',
          pointermove: 'doRotate',
          pointerup: 'stopBatch'
        },
        icon: null
      }
    ],
    bbox: function(a, b) {
      return a.getBBox({ useModelGeometry: b.options.useModelGeometry });
    },
    typeCssName: 'type-element',
    tinyThreshold: 40,
    smallThreshold: 80,
    boxContent: !1,
    // function(b, c) {
    //   var d = joint.util.template(
    //       'x: <%= x %>, y: <%= y %>, width: <%= width %>, height: <%= height %>, angle: <%= angle %>'
    //     ),
    //     e = b.model,
    //     f = e.getBBox();
    //   return d({
    //     x: Math.floor(f.x),
    //     y: Math.floor(f.y),
    //     width: Math.floor(f.width),
    //     height: Math.floor(f.height),
    //     angle: Math.floor(e.get('angle') || 0)
    //   });
    // },
    magnet: function(a) {
      return a.el;
    },
    loopLinkPreferredSide: 'top',
    loopLinkWidth: 40,
    rotateAngleGrid: 15,
    linkAttributes: {},
    smoothLinks: void 0
  };

  functions = {
    startLinking: function(evt, b, c) {
      this.startBatch();
      var options = this.options,
        paper = options.paper,
        graph = options.graph,
        source = this.createLinkConnectedToSource();
      source.set({ target: { x: b, y: c } }).addTo(graph, {
        validation: !1,
        halo: this.cid,
        async: !1
      });
      var h = (this._linkView = source.findView(paper));
      h.startArrowheadMove('target', { whenNotAllowed: 'remove' });
    },
    startForking: function(b, c, d) {
      var options = this.options,
        paper = options.paper,
        graph = options.graph;
      this.startBatch();
      var copy = options.clone(options.cellView.model, { fork: !0 });
      if (!(copy instanceof joint.dia.Cell))
        throw new Error('ui.Halo: option "clone" has to return a cell.');
      this.centerElementAtCursor(copy, c, d),
        copy.addTo(graph, { halo: this.cid, async: !1 });
      var i = this.createLinkConnectedToSource(),
        j = (this._cloneView = copy.findView(paper)),
        k = this.getElementMagnet(j, 'target'),
        l = this.getLinkEnd(j, k);
      i.set('target', l).addTo(graph, { halo: this.cid, async: !1 }),
        j.pointerdown(b, c, d);
    },

    getElementMagnet: function(b, c) {
      var magnet = this.options.magnet;
      if (joint.util.isFunction(magnet)) {
        var e = magnet.call(this, b, c);
        if (e instanceof SVGElement) return e;
      }
      throw new Error('ui.Halo: magnet() has to return an SVGElement.');
    },
    getLinkEnd: function(a, b) {
      var element = { id: a.model.id };
      if (b !== a.el) {
        var d = b.getAttribute('port');
        d ? (element.port = d) : (element.selector = a.getSelector(b));
      }
      return element;
    },
    createLinkConnectedToSource: function() {
      var options = this.options,
        paper = options.paper,
        cellView = options.cellView,
        magnet = this.getElementMagnet(cellView, 'source'),
        linkEnd = this.getLinkEnd(cellView, magnet),
        defaultLink = paper
          .getDefaultLink(cellView, magnet)
          .set('source', linkEnd);
      return (
        defaultLink.attr(options.linkAttributes),
        joint.util.isBoolean(options.smoothLinks) &&
          defaultLink.set('smooth', options.smoothLinks),
        defaultLink
      );
    },
    startResizing: function(a) {
      this.startBatch(),
        (this._flip = [1, 0, 0, 1, 1, 0, 0, 1][
          Math.floor(
            joint.g.normalizeAngle(this.options.cellView.model.get('angle')) /
              45
          )
        ]);
    },
    startRotating: function(a, b, c) {
      this.startBatch();
      var center = this.options.cellView.model.getBBox().center(),
        normalizeAngle = joint.g.normalizeAngle(
          this.options.cellView.model.get('angle')
        );
      (this._center = center),
        (this._rotationStartAngle = normalizeAngle || 0),
        (this._clientStartAngle = joint.g.point(b, c).theta(center));
    },
    doResize: function(a, b, c, d, e) {
      var size = this.options.cellView.model.get('size'),
        width = Math.max(size.width + (this._flip ? d : e), 1),
        height = Math.max(size.height + (this._flip ? e : d), 1);
      this.options.cellView.model.resize(width, height, { absolute: !0 });
    },
    doRotate: function(a, b, c) {
      var d = this._clientStartAngle - joint.g.point(b, c).theta(this._center),
        e = joint.g.snapToGrid(
          this._rotationStartAngle + d,
          this.options.rotateAngleGrid
        );
      this.options.cellView.model.rotate(e, !0);
    },
    doClone: function(a, b, c) {
      var cloneView = this._cloneView;
      cloneView && cloneView.pointermove(a, b, c);
    },
    startCloning: function(b, c, d) {
      var options = this.options;
      this.startBatch();
      var cloneView = options.clone(options.cellView.model, { clone: !0 });
      if (!(cloneView instanceof joint.dia.Cell))
        throw new Error('ui.Halo: option "clone" has to return a cell.');
      this.centerElementAtCursor(cloneView, c, d),
        cloneView.addTo(options.graph, { halo: this.cid, async: !1 }),
        (this._cloneView = cloneView.findView(options.paper)),
        this._cloneView.pointerdown(b, c, d);
    },
    centerElementAtCursor: function(element, b, c) {
      var center = element.getBBox().center(),
        e = b - center.x,
        f = c - center.y;
      element.translate(e, f);
    },
    doFork: function(a, b, c) {
      var cloneView = this._cloneView;
      cloneView && cloneView.pointermove(a, b, c);
    },
    doLink: function(a, b, c) {
      this._linkView && this._linkView.pointermove(a, b, c);
    },
    stopLinking: function(a) {
      this._linkView &&
        (this._linkView.pointerup(a),
        this._linkView.model.hasLoop() &&
          this.makeLoopLink(this._linkView.model),
        this.stopBatch(),
        this.triggerAction('link', 'add', this._linkView.model),
        (this._linkView = null));
    },
    stopForking: function(a, b, c) {
      var cloneView = this._cloneView;
      cloneView && cloneView.pointerup(a, b, c), this.stopBatch();
    },
    stopCloning: function(a, b, c) {
      var cloneView = this._cloneView;
      cloneView && cloneView.pointerup(a, b, c), this.stopBatch();
    },
    unlinkElement: function(a) {
      this.startBatch(),
        this.options.graph.removeLinks(this.options.cellView.model),
        this.stopBatch();
    },
    makeLoopLink: function(b) {
      var c,
        d,
        loopLinkWidth = this.options.loopLinkWidth,
        paperOptions = this.options.paper.options,
        paperRect = g.rect({
          x: 0,
          y: 0,
          width: paperOptions.width,
          height: paperOptions.height
        }),
        paperViewPort = joint
          .V(this.options.cellView.el)
          .bbox(!1, this.options.paper.viewport),
        j = joint.util.uniq([
          this.options.loopLinkPreferredSide,
          'top',
          'bottom',
          'left',
          'right'
        ]),
        k = j.find(function(a) {
          var b,
            f = 0,
            j = 0;
          switch (a) {
            case 'top':
              (b = g.point(
                paperViewPort.x + paperViewPort.width / 2,
                paperViewPort.y - loopLinkWidth
              )),
                (f = loopLinkWidth / 2);
              break;
            case 'bottom':
              (b = g.point(
                paperViewPort.x + paperViewPort.width / 2,
                paperViewPort.y + paperViewPort.height + loopLinkWidth
              )),
                (f = loopLinkWidth / 2);
              break;
            case 'left':
              (b = g.point(
                paperViewPort.x - loopLinkWidth,
                paperViewPort.y + paperViewPort.height / 2
              )),
                (j = loopLinkWidth / 2);
              break;
            case 'right':
              (b = g.point(
                paperViewPort.x + paperViewPort.width + loopLinkWidth,
                paperViewPort.y + paperViewPort.height / 2
              )),
                (j = loopLinkWidth / 2);
          }
          return (
            (c = g.point(b).offset(-f, -j)),
            (d = g.point(b).offset(f, j)),
            paperRect.containsPoint(c) && paperRect.containsPoint(d)
          );
        }, this);
      k && b.set('vertices', [c, d]);
    }
  };
}
