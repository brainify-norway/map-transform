import test from 'ava'
import { set } from './getSet.js'
import iterate from './iterate.js'
import { identity } from '../utils/functional.js'

import merge from './merge.js'

// Setup

const data = [
  {
    heading: 'Entry 1',
    createdBy: 'johnf',
    createdAt: new Date('2021-07-01T07:11:33Z'),
    tags: ['popular', 'news'],
  },
  {
    heading: 'Entry 2',
    createdBy: 'lucyk',
    createdAt: new Date('2021-07-05T18:44:54Z'),
    tags: ['tech'],
  },
];

const stateWithObject = {
  context: [data],
  value: data[0],
};

const stateWithArray = {
  context: [],
  value: data,
};

const options = {};

// Tests

test('should run pipelines and merge the result', (t) => {
  const pipelines = [
    ['heading', set('title')],
    ['createdBy', set('author')],
    ['tags', set('sections[]')],
  ];
  const expectedValue = {
    title: 'Entry 1',
    author: 'johnf',
    sections: ['popular', 'news'],
  };

  const ret = merge(...pipelines)(options)(identity)(stateWithObject);

  t.deepEqual(ret.value, expectedValue);
});

test('should merge with existing object', (t) => {
  const pipelines = [
    ['.'],
    ['createdBy', set('heading')],
    ['heading', set('title')],
  ];
  const expectedValue = {
    heading: 'johnf',
    title: 'Entry 1',
    createdBy: 'johnf',
    createdAt: new Date('2021-07-01T07:11:33Z'),
    tags: ['popular', 'news'],
  };

  const ret = merge(...pipelines)(options)(identity)(stateWithObject);

  t.deepEqual(ret.value, expectedValue);
});

test('should run pipelines and merge the result with several levels', (t) => {
  const pipelines = [
    ['heading', set('content.title')],
    ['createdBy', set('meta.author')],
    ['tags', set('meta.sections[]')],
  ];
  const expectedValue = {
    content: { title: 'Entry 1' },
    meta: {
      author: 'johnf',
      sections: ['popular', 'news'],
    },
  };

  const ret = merge(...pipelines)(options)(identity)(stateWithObject);

  t.deepEqual(ret.value, expectedValue);
});

test('should clone Date to new Date', (t) => {
  const pipelines = [
    ['heading', set('content.title')],
    ['createdAt', set('meta.date')],
    ['createdBy', set('meta.author')],
  ];
  const expectedValue = {
    content: { title: 'Entry 1' },
    meta: {
      date: new Date('2021-07-01T07:11:33Z'),
      author: 'johnf',
    },
  };

  const ret = merge(...pipelines)(options)(identity)(stateWithObject);

  t.deepEqual(ret.value, expectedValue);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t.true((ret.value as any).meta.date instanceof Date);
});

test('should run pipelines and merge arrays', (t) => {
  const pipelines = [
    ['heading', set('title')],
    ['createdBy', set('author')],
  ];
  const expectedValue = [
    {
      title: 'Entry 1',
      author: 'johnf',
    },
    {
      title: 'Entry 2',
      author: 'lucyk',
    },
  ];

  const ret = iterate(merge(...pipelines))(options)(identity)(stateWithArray);

  t.deepEqual(ret.value, expectedValue);
});

test('should run one pipeline', (t) => {
  const pipelines = [['heading', set('title')]];
  const expectedValue = {
    title: 'Entry 1',
  };

  const ret = merge(...pipelines)(options)(identity)(stateWithObject);

  t.deepEqual(ret.value, expectedValue);
});

test('should run no pipeline', (t) => {
  const pipelines = [] as string[][];
  const expectedValue = undefined;

  const ret = merge(...pipelines)(options)(identity)(stateWithObject);

  t.deepEqual(ret.value, expectedValue);
});

test('should not run pipelines on undefined value', (t) => {
  const pipelines = [['heading', set('title')]];
  const state = { ...stateWithObject, value: undefined };

  const ret = merge(...pipelines)(options)(identity)(state);

  t.is(ret.value, undefined);
});

test('should not run pipelines on null value when null is included in nonvalues', (t) => {
  const pipelines = [set('title')];
  const state = { ...stateWithObject, value: null };
  const optionsNullAsNone = { ...options, nonvalues: [undefined, null] };

  const ret = merge(...pipelines)(optionsNullAsNone)(identity)(state);

  t.is(ret.value, undefined);
});

test('should run pipelines on null value when null is notincluded in nonvalues', (t) => {
  const pipelines = [set('title')];
  const state = { ...stateWithObject, value: null };
  const optionsMutateNull = { ...options, nonvalues: [undefined] };
  const expected = { title: null };

  const ret = merge(...pipelines)(optionsMutateNull)(identity)(state);

  t.deepEqual(ret.value, expected);
});

test('should run pipelines on null value as default', (t) => {
  const pipelines = [[set('title')]];
  const state = { ...stateWithObject, value: null };
  const expected = { title: null };

  const ret = merge(...pipelines)(options)(identity)(state);

  t.deepEqual(ret.value, expected);
});
