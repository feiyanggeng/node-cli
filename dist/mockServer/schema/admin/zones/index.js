const jsf = require('json-schema-faker');
const _ = require('lodash');
const Chance = require('chance');

jsf.option({
  useDefaultValue: true,
});

jsf.format('zoneId', () => jsf.random.randexp('^zo-[0-9a-zA-Z]{32}$'));

jsf.extend('chance', () => {
  const chance = new Chance();

  chance.mixin({
    zoneTime: () => {
      const hour = chance.hour({ twentyfour: true });
      const min = chance.minute();
      return `${hour < 10 ? `0${hour}` : hour}:${min < 10 ? `0${min}` : min}:00`;
    },
  });
  return chance;
});

const zoneSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'zoneId',
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 20,
    },
    description: {
      type: 'string',
      minLength: 0,
      maxLength: 50,
    },
  },
  required: ['id', 'name', 'content'],
};

const ipZoneSchema = _.merge({}, zoneSchema, {
  properties: {
    type: { type: 'string', enum: ['IP'] },
    content: {
      type: 'object',
      properties: {
        ip: {
          type: 'array',
          items: { type: 'string', chance: 'ip' },
        },
      },
      required: ['ip'],
    },
  },
});

const geoSchema = {
  type: 'object',
  properties: {
    countryCode: { type: 'string' },
    countryName: { type: 'string' },
    subdivisionCode: { type: 'string' },
    subdivisionName: { type: 'string' },
  },
  required: ['countryCode', 'countryName', 'subdivisionCode', 'subdivisionName'],
};

const geoZoneSchema = _.merge({}, zoneSchema, {
  properties: {
    type: { type: 'string', enum: ['GEO'] },
    content: {
      type: 'object',
      properties: {
        geo: {
          type: 'array',
          items: geoSchema,
        },
      },
      required: ['geo'],
    },
  },
});

const timeSchema = {
  type: 'object',
  properties: {
    weeks: {
      type: 'array',
      minLength: 0,
      maxLength: 7,
      uniqueItems: true,
      items: { type: 'integer', minimum: 1, maximum: 7 },
    },
    startTime: { type: 'string', chance: 'zoneTime' },
    endTime: { type: 'string', chance: 'zoneTime' },
  },
  required: ['weeks', 'startTime', 'endTime'],
};

const timeZoneSchema = _.merge({}, zoneSchema, {
  properties: {
    type: { type: 'string', enum: ['TIME'] },
    content: {
      type: 'object',
      properties: {
        time: {
          type: 'array',
          items: timeSchema,
        },
      },
      required: ['time'],
    },
  },
});

module.exports = {
  zoneSchema,
  ipZoneSchema,
  geoZoneSchema,
  timeZoneSchema,
};
