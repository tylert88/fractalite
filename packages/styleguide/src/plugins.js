module.exports = [
  {
    key: 'opts.markdown',
    handler: require('./markdown')
  },
  {
    key: 'opts.preview',
    handler: require('./preview')
  },
  {
    key: 'opts.meta',
    handler: require('./metadata')
  },
  {
    key: 'opts.fileRefs',
    handler: require('./file-refs')
  },
  {
    key: 'opts.pages',
    handler: require('./pages')
  },
  {
    key: 'opts.inspector.notes',
    handler: require('./inspector-notes')
  },
  {
    key: 'opts.inspector.files',
    handler: require('./inspector-files')
  },
  {
    key: 'opts.inspector.html',
    handler: require('./inspector-html')
  }
];
