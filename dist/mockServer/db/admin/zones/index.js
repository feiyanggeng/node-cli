const jsf = require('json-schema-faker');
const {
  ipZoneSchema,
  geoZoneSchema,
  timeZoneSchema,
} = require('../../../schema/admin/zones');

const data = [];
const length = 15;
const schemas = [ipZoneSchema, geoZoneSchema, timeZoneSchema];

Array(length)
  .fill('')
  .forEach(() => {
    const idx = Math.floor(Math.random() * schemas.length);
    data.push(jsf.generate(schemas[idx]));
  });

module.exports = data;
