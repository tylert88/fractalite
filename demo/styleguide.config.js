const { resolve } = require('path');

module.exports = {
  title: 'Styleguide',

  adapter: require('../packages/adapter-nunjucks')(),

  components: {
    src: resolve(__dirname, './src/components')
  },

  assets: resolve(__dirname, './dist/assets'),

  // develop: {
  //   port: 3030
  // },
  //
  // build: {},

  opts: {
    nav: {},
    // notes: false,
    pages: {
      src: resolve(__dirname, './src/pages'),
      indexLabel: 'Overview'
    },
    inspector: {
      notes: {}
    },
    fileRefs: {
      // relative: true
    },
    // relativeUrls: true,
    preview: {
      scripts: [],
      stylesheets: ['main.css']
    }
  },

  init(app) {
    // app customisation here
  }
};