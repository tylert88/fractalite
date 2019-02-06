const { isString, flatMap, find } = require('lodash');
const { map } = require('asyncro');
const { defaultsDeep } = require('@fractalite/support/utils');
const Component = require('./entities/component');
const Asset = require('./entities/asset');
const Variant = require('./entities/variant');
const File = require('./entities/file');
const Adapter = require('./adapter');

module.exports = function(state, adapter) {
  const api = {};
  adapter = adapter || new Adapter(); // TODO: validate adapter

  Object.defineProperty(api, 'state', {
    value: state,
    enumerable: true,
    writable: false,
    configurable: false
  });

  for (const key of ['components', 'assets']) {
    Object.defineProperty(api, key, {
      get() {
        return state[key] || [];
      },
      enumerable: true
    });
  }

  Object.defineProperty(api, 'variants', {
    get() {
      return flatMap(api.components, c => c.variants);
    },
    enumerable: true
  });

  Object.defineProperty(api, 'files', {
    get() {
      return flatMap(api.components, c => c.files);
    },
    enumerable: true
  });

  api.getComponents = () => api.components;

  api.getComponent = (target, throwOnNotFound = false) => {
    try {
      return resolveComponentTarget(target, api.components).component;
    } catch (err) {
      if (throwOnNotFound) {
        throw new Error(`Component not found`);
      }
    }
  };

  api.getVariants = () => api.variants;

  api.getVariant = (target, throwOnNotFound = false) => {
    if (Variant.isVariant(target)) return target;
    const variant = find(api.variants, { handle: target });
    if (!variant && throwOnNotFound) {
      throw new Error(`Variant '${target}' was not found`);
    }
    return variant;
  };

  api.getFiles = () => api.files;

  api.getFile = (target, throwOnNotFound = false) => {
    if (File.isFile(target)) return target;
    const file = find(api.files, { handle: target });
    if (!file && throwOnNotFound) {
      throw new Error(`Source file '${target}' was not found`);
    }
    return file;
  };

  api.getAssets = () => api.assets;

  api.getAsset = (handle, throwOnNotFound = false) => {
    if (Asset.isAsset(handle)) return handle;
    const asset = find(api.assets, { handle });
    if (!asset && throwOnNotFound) {
      throw new Error(`Asset '${handle}' was not found`);
    }
    return asset;
  };

  api.mergeProps = (...args) => {
    const targets = args.map(target => {
      if (isString(target) || Component.isComponent(target) || Variant.isVariant(target)) {
        const { variant } = resolveComponentTarget(target, api.components);
        return variant ? variant.props : {};
      }
      return target;
    });
    return defaultsDeep(...targets.reverse());
  };

  api.getSourceString = target => {
    const { component } = resolveComponentTarget(target, api.components);
    return adapter.getSourceString(component, { api });
  };

  api.render = (target, props = {}) => {
    const { component, variant } = resolveComponentTarget(target, api.components);
    const mergedProps = api.mergeProps(variant, props);
    return adapter.render(component, mergedProps, { variant, api });
  };

  api.renderAll = async (target, props = [], join = true) => {
    let results;
    if (join === true) {
      join = '\n';
    }
    if (Array.isArray(props)) {
      results = await map(props, p => api.render(target, p));
    } else {
      results = await Promise.all([api.render(target, props)]);
    }
    return join ? results.join(join) : results;
  };

  api.wrapInPreview = (html, opts) => {
    return adapter.preview(html, opts, { api });
  };

  api.resolveComponent = target => resolveComponentTarget(target, api.components);

  return api;
};

function resolveComponentTarget(target, components) {
  let component;
  let variant;
  if (isString(target)) {
    const entities = flatMap(components, component => [component, ...component.variants]);
    const found = entities.find(entity => entity.handle === target);
    if (!found) {
      throw new Error(`Could not resolve target '${target}'`);
    }
    target = found; // Either a component or a variant
  }
  if (Variant.isVariant(target)) {
    variant = target;
    component = components.find(component => component.variants.includes(variant));
  } else if (Component.isComponent(target)) {
    component = target;
  }
  if (!component) {
    throw new Error(`Could not resolve target '${target}'`);
  }
  return { component, variant };
}
