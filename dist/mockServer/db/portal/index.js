const apps = require('./apps');
const appEntrusts = require('./appEntrusts');

module.exports = () => {
  return {
    apps,
    appentrusts: appEntrusts,
  };
};
