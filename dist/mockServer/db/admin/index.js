const zones = require('./zones/index');
const zonesCountryCode = require('./zones/countryCode');

module.exports = () => {
  return {
    zones,
    zonesCountryCode,
  };
};
