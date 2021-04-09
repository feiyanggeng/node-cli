'use strict';

/**
 * npm start xxx -- --ms/--mock_server
 */

const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');
const _ = require('lodash');
const chalk = require('chalk');
const yaml = require('js-yaml');
const qs = require('qs');
const yargs = require("yargs");
const handleServerConfig = require('./utils/handleServerConfig.js');

const argv = yargs.options({
  app: {
    type: "string"
  },
  port: {
    alias: "p",
    type: "number"
  }
}).argv;

console.log(argv);

const appDir = argv.app;
const serverConfig = handleServerConfig.getConfig();

let app;
let server;
const routesPath = path.resolve(__dirname, `./customRoutes/${appDir}.yml`);

function enableDestroy(server) {
  var connections = {};

  server.on("connection", function (conn) {
    var key = conn.remoteAddress + ":" + conn.remotePort;
    connections[key] = conn;
    conn.on("close", function () {
      delete connections[key];
    });
  });

  server.destroy = function (cb) {
    server.close(cb);
    for (var key in connections) connections[key].destroy();
  };
}

// Display server information
function prettyPrint(argv, db, rules) {
  const root = `http://${argv.host}:${argv.port}`;
  console.log();
  console.log(chalk.bold('  Resources'));

  for (const prop in db) {
    console.log(`  ${root}/${prop}`);
  }

  if (rules) {
    console.log();
    console.log(chalk.bold('  Other routes'));

    for (var rule in rules) {
      console.log(`  ${rule} -> ${rules[rule]}`);
    }
  }

  console.log();
  console.log(chalk.bold('  Home'));
  console.log(`  ${root}`);
  console.log();
}

// Create app and server
function createApp(db, routes) {
  const app = jsonServer.create();
  const router = jsonServer.router(db);
  const defaults = jsonServer.defaults();
  app.use(defaults);

  if (routes) {
    const rewriter = jsonServer.rewriter(routes);
    app.use(rewriter);
  }

  app.db = router.db;
  router.render = (req, res) => {
    const data = res.locals.data;
    if (_.get(req, 'headers.yufu-ms-transform-list')) {
      res.jsonp({
        data: _.isArray(data) ? data : [],
        total: _.isArray(data) ? data.length : 0,
      });
    } else {
      res.jsonp(data);
    }
  };
  app.use(router);
  return app;
}

// Start server
async function start() {
  const dbPath = path.resolve(__dirname, `./db/${appDir}/index.js`);
  console.log();
  console.log(chalk.gray('  Loading', dbPath));

  // Load main db
  delete require.cache[dbPath];
  const dataFn = require(dbPath);
  const db = dataFn();

  // Load additional routes
  let routes;
  console.log(chalk.gray('  Loading', routesPath));
  routes = yaml.load(fs.readFileSync(routesPath, 'utf8'));

  console.log(chalk.gray('  Done'));

  app = createApp(db, routes);
  const { host } = serverConfig;
  const port = argv.port;
  server = app.listen(port, host);

  // Enhance with a destroy function
  enableDestroy(server);
  prettyPrint({ host, port }, db, routes);

  process.on('uncaughtException', (error) => {
    if (error.errno === 'EADDRINUSE') {
      console.log(chalk.red(`Cannot bind to the port ${error.port}.`));
    } else {
      console.log('Some error occurred', error);
      process.exit(1);
    }
  });
}

function reStart() {
  server && server.destroy(() => start());
}

function watch() {
  console.log(chalk.gray('  Watching...'));
  // Watch custom routes
  const watchedRoutesDir = path.dirname(routesPath);
  fs.watch(watchedRoutesDir, (event, file) => {
    if (file) {
      const watchedFile = path.resolve(watchedRoutesDir, file);
      if (watchedFile === path.resolve(routesPath)) {
        console.log(chalk.cyan(`  ${routesPath} has changed, reloading...`));
        reStart();
      }
    }
  });
}

(function main() {
  console.log(chalk.cyan('\n  \\{^_^}/ hi mock server!'));
  try {
    start();
    watch();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
