const serverConfig = require('../server.config');

function getConfig() {
  const { host = 'localhost', ...restConfig } = serverConfig || {};
  return {
    ...restConfig,
    host,
  };
}

function getRoot(port) {
  const { host } = getConfig();
  const hasPrefix = /^(https?:\/\/)(\w)/.test(host);
  return `${hasPrefix ? '' : 'http://'}${host}:${port}`;
}

module.exports = {
  getConfig,
  getRoot,
};
