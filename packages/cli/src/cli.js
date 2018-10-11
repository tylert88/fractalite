/* eslint-disable unicorn/no-process-exit */

const { relative, resolve } = require('path');
const { promisify } = require('util');
const { readdir } = require('fs');
const { cyan } = require('kleur');
const importCwd = require('import-cwd');
const { get, isString } = require('lodash');
const cosmiconfig = require('cosmiconfig');
const { toArray } = require('@fractalite/support/utils');

const readFiles = promisify(readdir);

module.exports = async function(args, cwd) {
  const logger = require('./logger')();

  const exit = err => {
    if (err) {
      logger.error(err);
    }
    process.exit(err ? 1 : 0);
  };

  try {
    const configFinder = cosmiconfig('fractal', {
      stopDir: cwd
    });
    let configFile;

    if (args.config) {
      configFile = await configFinder.load(args.config);
    } else {
      configFile = await configFinder.search();
    }

    if (configFile === null) {
      exit('Config file not found.');
    }

    logger.info(`Using config file ${cyan(`./${relative(cwd, configFile.filepath)}`)}`);

    const { config } = configFile;

    let commands = await readFiles(resolve(__dirname, 'commands'));
    commands = commands.map(c => resolve(__dirname, 'commands', c));
    commands = commands.concat(get(config, 'cli.commands', []));
    commands = commands.map(cmd => {
      let [attacher, opts] = toArray(cmd);
      attacher = isString(attacher) ? importCwd(attacher) : attacher;
      return Object.assign({}, attacher, {
        name: attacher.name,
        handler: attacher(opts)
      });
    });

    const commandName = args._[0] || 'info';
    const command = commands.find(cmd => cmd.name === commandName);
    if (!command) {
      exit(`Command '${commandName}' not found`);
    }

    await command.handler(args, config, {
      logger,
      exit,
      commands: commands.filter(c => !c.hidden)
    });
  } catch (err) {
    exit(err);
  }
};
