const { get, compact, flatten, cloneDeep, isString, isPlainObject } = require('lodash');
const { defaultsDeep } = require('@fractalite/support/utils');
const { mergeSrcRefs } = require('@fractalite/support/helpers');
const importCwd = require('import-cwd');
const defaults = require('../defaults');

module.exports = function(opts = {}) {
  let [theme = {}, themeOpts = opts.themeOpts] = [].concat(opts.theme);
  theme = isString(theme) ? importCwd(theme) : theme;
  const themeConfig = isPlainObject(theme) ? theme : theme(themeOpts);
  const config = cloneDeep([defaults(), themeConfig, opts]);

  return Object.assign({}, themeConfig, {
    cache: resolve(config, 'cache'),
    globals: blend(config, 'globals'),
    filters: assign(config, 'filters'),
    helpers: assign(config, 'helpers'),
    extensions: assign(config, 'extensions'),
    views: concat(config, 'views').reverse(),
    parser: {
      plugins: concat(config, 'parser.plugins')
    },
    routes: concatReverse(config, 'routes'),
    assets: concatAssets(config),
    develop: assign(config, 'develop'),
    pages: mergePages(config, 'pages'),
    build: assign(config, 'build'),
    preview: mergePreviews(config),
    stylesheets: mergeRefs(config, 'stylesheets'),
    scripts: mergeRefs(config, 'scripts'),
    opts: blend(config, 'opts'),
    init: themeConfig.init || function() {},
    get(path, fallback) {
      return get(this, path, fallback);
    }
  });
};

function mergePages(configs) {
  const path = 'pages';
  const values = getValues(configs, path, []);
  const srcValues = flatten(values.map(v => [].concat(v.src)));
  const src = compact(srcValues).reverse();
  return Object.assign(defaultsDeep(...values.reverse()), { src });
}

function concatAssets(configs) {
  const path = 'assets';
  let opts = getValues(configs, path).map(opt => {
    return isString(opt) ? { src: opt } : opt;
  });
  opts = [].concat(opts.reverse());
  return compact([].concat(...opts));
}

function mergePreviews(configs) {
  const path = 'preview';
  const values = getValues(configs, path, []);
  const stylesheets = values.map(c => c.stylesheets || []).reverse();
  const scripts = values.map(c => c.scripts || []).reverse();
  const meta = defaultsDeep(...values.map(c => c.meta || {}).reverse());
  return Object.assign({}, ...values, { stylesheets, scripts, meta });
}

function mergeRefs(configs, path) {
  const values = getValues(configs, path, []);
  return mergeSrcRefs(values);
}

function getValues(configs, path, fallback) {
  return configs.map(c => get(c, path, fallback));
}

function resolve(configs, path) {
  const values = getValues(configs, path);
  return values.filter(v => v !== undefined).reverse()[0];
}

function assign(configs, path) {
  return Object.assign({}, ...getValues(configs, path, {}));
}

function blend(configs, path) {
  return defaultsDeep(...getValues(configs, path, {}).reverse());
}

function concat(configs, path) {
  return compact([].concat(...getValues(configs, path)));
}

function concatReverse(configs, path) {
  const values = configs
    .slice(0)
    .reverse()
    .map(c => get(c, path));
  return compact([].concat(...values));
}
