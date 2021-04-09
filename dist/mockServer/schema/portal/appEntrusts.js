const jsf = require('json-schema-faker');
const Chance = require('chance');

jsf.format('id', () => jsf.random.randexp('^ae-[0-9a-zA-Z]{32}$'));
jsf.format('appId', () => jsf.random.randexp('^ai-[0-9a-zA-Z]{32}$'));
jsf.format('userId', () => jsf.random.randexp('^us-[0-9a-zA-Z]{32}$'));

jsf.extend('chance', () => new Chance());

const appSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'appId' },
    name: { type: 'string', minLength: 5, maxLength: 20 },
    logoUrl: { type: 'string', enum: ['yufu-custom-app-oidc'] },
  },
  required: ['id', 'name', 'logoUrl'],
};

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'userId' },
    displayName: { type: 'string', minLength: 5, maxLength: 30 },
  },
  required: ['id', 'displayName'],
};

const schema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'id',
    },
    appDetails: appSchema,
    employeesDetails: {
      type: 'array',
      minItems: 1,
      maxItems: 10,
      items: userSchema,
    },
    startTime: {
      type: 'integer',
      chance: 'timestamp',
    },
    endTime: {
      type: 'integer',
      chance: 'timestamp',
    },
  },
  required: ['id', 'appDetails', 'employeesDetails', 'startTime', 'endTime'],
};

module.exports = schema;
