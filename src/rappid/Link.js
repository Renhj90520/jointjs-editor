export function defineDefaultLink() {
  joint.shapes.standard.Link.define(
    'app.Link',
    {
      router: { name: 'manhattan' },
      connector: { name: 'jumpover' },
      labels: [],
      attrs: {
        line: {
          stroke: '#000000',
          strokeDasharray: 0,
          strokeWidth: 2,
          fill: 'none',
          sourceMarker: {
            type: 'path',
            d: 'M 0 0 0 0',
            stroke: 'none'
          },
          targetMarker: {
            type: 'path',
            d: 'M 0 0 10 5 10 -5 z',
            stroke: 'none'
          }
        }
      }
    },
    {
      defaultLabel: {
        attrs: {
          rect: {
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 1,
            refWidth: 10,
            refHeight: 10,
            refX: -5,
            refY: -5
          }
        }
      },

      getMarkerWidth: function(type) {
        var d =
          type === 'source'
            ? this.attr('line/sourceMarker/d')
            : this.attr('line/targetMarker/d');
        return this.getDataWidth(d);
      },

      getDataWidth: _.memoize(function(d) {
        return new g.Path(d).bbox().width;
      })
    }
    // {
    //   connectionPoint: function(line, view, magnet, opt, type, linkView) {
    //     var markerWidth = linkView.model.getMarkerWidth(type);
    //     opt = { offset: markerWidth, stroke: true };
    //     // connection point for UML shapes lies on the root group containg all the shapes components
    //     if (view.model.get('type').indexOf('uml') === 0) opt.selector = 'root';
    //     return joint.connectionPoints.boundary.call(
    //       this,
    //       line,
    //       view,
    //       magnet,
    //       opt,
    //       type,
    //       linkView
    //     );
    //   }
    // }
  );
}
