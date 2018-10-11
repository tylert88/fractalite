/* eslint-disable camelcase */

const { resolve } = require('path');

module.exports = {
  views: [resolve(__dirname, 'views')],
  assets: [
    {
      name: 'ui',
      src: resolve(__dirname, 'assets'),
      mount: '/assets/_ui/core',
      watch: false
    },
    {
      name: 'src',
      src: '.',
      mount: '/src',
      watch: false
    }
  ],
  routes: [
    {
      url: '/preview/:component(/:variant)',
      name: 'preview',
      view: 'preview',
      handler: 'preview'
    },
    {
      url: '/',
      name: 'index',
      handler: ({ engine }) => engine.render('index')
    },
    {
      name: 'error',
      handler: ({ engine }) => engine.render('error')
    },
    {
      name: '404',
      handler: async ({ engine }) => {
        try {
          return await engine.render('404');
        } catch (err) {
          return engine.render('error');
        }
      }
    }
  ],
  theme: null,
  preview: {
    view: null,
    contents: '{% for variant in variants %}{{ variant | render }}{% endfor %}',
    head: null,
    foot: null,
    collated: false
  },
  globals: {
    site: {
      title: 'Component library'
    }
  },
  filters: {
    render: require('./src/engine/filters/render'),
    html: require('./src/engine/filters/html'),
    collect: require('./src/engine/filters/collect'),
    view: require('./src/engine/filters/view'),
    json: require('./src/engine/filters/json'),
    pluralize: require('./src/engine/filters/pluralize'),
    prettify: require('./src/engine/filters/prettify'),
    tree: require('./src/engine/filters/tree')
  },
  helpers: {
    url: require('./src/engine/helpers/url'),
    route: require('./src/engine/helpers/route'),
    asset: require('./src/engine/helpers/asset')
  },
  extensions: {},
  parser: {
    plugins: [
      require(`./src/plugins/file-urls`),
      require(`./src/plugins/asset-refs`),
      require(`./src/plugins/preview`)
    ]
  },
  opts: {
    filters: {
      prettify: {
        indent_size: 2,
        preserve_newlines: false
      }
    }
  },
  develop: {
    hostname: 'localhost',
    port: 3000,
    indexes: false,
    ext: false
  },
  build: {
    prefix: null,
    dest: null,
    indexes: true,
    ext: '.html',
    clean: false,
    gitignore: false,
    server: {
      port: 3001
    }
  }
};
