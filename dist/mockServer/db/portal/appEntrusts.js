const jsf = require('json-schema-faker');
const schema = require('../../../schema/portal/appEntrusts');

const data = jsf.generate({
  type: 'array',
  minItems: 11,
  maxItems: 20,
  items: schema,
});

module.exports = data;
