export function extendShapeCloud() {
  joint.shapes.custom.Cloud = joint.dia.Element.extend({
    markup: [
      '<g class="rotatable">',
      "<g class='scalable'>",
      '<g>',
      '<svg viewBox="0 30 640 512" width="120" height="80" preserveAspectRatio = "xMinYMin meet">',
      // '<defs><linearGradient id="Gradient01"><stop offset="20%" stop-color="#39F"/><stop offset="90%" stop-color="#F3F"/></linearGradient></defs>',
      '<g class="body">',
      '<path fill="black" d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zm-132.9 88.7L299.3 420.7c-6.2 6.2-16.4 6.2-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z"/>',
      '</g>',
      '</svg>',
      '<text class="label">asdasasdasd</text>',
      '</g>',
      // '<g class="body" width="120" height="80">',
      // '<svg viewBox="0 0 384 512" width="36" height="48" preserveAspectRatio = "xMidYMid meet">',
      // '<path fill="currentColor" d="M384 112v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h80c0-35.29 28.71-64 64-64s64 28.71 64 64h80c26.51 0 48 21.49 48 48zM192 40c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24m96 114v-20a6 6 0 0 0-6-6H102a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6h180a6 6 0 0 0 6-6z"></path>',
      // '</svg>',
      // '</g>',
      '</g>',
      '</g>'
    ].join(''),
    defaults: joint.util.deepSupplement(
      {
        type: 'custom.Cloud',
        size: { width: 120, height: 80 },
        attrs: {
          '.body': {
            width: 120,
            height: 80,
            fill: 'none'
          },
          '.label': {
            ref: '.body',
            'ref-width': 1
          }
        }
      },
      joint.dia.Element.prototype.defaults
    ),
    initialize: function() {
      joint.dia.Element.prototype.initialize.apply(this, arguments);
    }
  });
}
