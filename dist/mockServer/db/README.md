## Mock-Server db文件 书写规范

无论哪种写法，文件exports的内容一定是该路由所对应的数据；

### 1、借助 schema

我们使用的是 [json-schema-faker](https://github.com/json-schema-faker/json-schema-faker/blob/master/docs/USAGE.md#example-usage)

[json-schema-faker 线上demo](https://json-schema-faker.js.org/#gist/da0af4611cb5622b54aff57283560da3)

> schema文件我们建议书写在 /schema/[admin/idp/portal]/[server] 下，对应api路由；

Schema Example:

```js
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

```

Example:

```js
const jsf = require('json-schema-faker');
const {
  ipZoneSchema,
  geoZoneSchema,
  timeZoneSchema,
} = require('../../../../../schema/admin/zones');

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
```

### 2、手动书写

```js
module.exports = [
  {
    chineseAbbreviation: '安道尔',
    code: 'AD',
    id: '6',
    name: 'Andorra',
  },
  {
    chineseAbbreviation: '奥地利',
    code: 'AT',
    id: '15',
    name: 'Austria',
  },
];
```