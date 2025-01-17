import test from 'ava'
import { identity } from '../utils/functional.js'

import lookup from './lookup.js'

// Setup

const props = { arrayPath: '^related.users[]', propPath: 'id' }
const options = {}

// Tests -- forward

test('should lookup data', (t) => {
  const data = {
    content: { author: 'user2' },
    related: {
      users: [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
      ],
    },
  }
  const state = {
    context: [data],
    value: 'user2',
  }
  const expected = {
    context: [data],
    value: { id: 'user2', name: 'User 2' },
  }

  const ret = lookup(props)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should lookup array of data', (t) => {
  const data = {
    content: { authors: ['user1', 'user3'] },
    related: {
      users: [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
        { id: 'user3', name: 'User 3' },
      ],
    },
  }
  const state = {
    context: [data, data.content],
    value: data.content.authors,
  }
  const expected = {
    context: [data, data.content],
    value: [
      { id: 'user1', name: 'User 1' },
      { id: 'user3', name: 'User 3' },
    ],
  }

  const ret = lookup(props)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should match only first of several matches', (t) => {
  const data = {
    content: { authors: ['user1', 'user3'] },
    related: {
      users: [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
        { id: 'user3', name: 'User 3' },
        { id: 'user3', name: 'Another 3' },
        { id: 'user1', name: 'User 1 also' },
      ],
    },
  }
  const state = {
    context: [data],
    value: ['user1', 'user3'],
  }
  const expectedValue = [
    { id: 'user1', name: 'User 1' },
    { id: 'user3', name: 'User 3' },
  ]

  const ret = lookup(props)(options)(identity)(state)

  t.deepEqual(ret.value, expectedValue)
})

test('should match several matches when `matchSeveral` is true', (t) => {
  const propsMatchSeveral = { ...props, matchSeveral: true }
  const data = {
    content: { authors: ['user1', 'user3'] },
    related: {
      users: [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
        { id: 'user3', name: 'User 3' },
        { id: 'user3', name: 'Another 3' },
        { id: 'user1', name: 'User 1 also' },
      ],
    },
  }
  const state = {
    context: [data],
    value: ['user1', 'user3'],
  }
  const expectedValue = [
    { id: 'user1', name: 'User 1' },
    { id: 'user1', name: 'User 1 also' },
    { id: 'user3', name: 'User 3' },
    { id: 'user3', name: 'Another 3' },
  ]

  const ret = lookup(propsMatchSeveral)(options)(identity)(state)

  t.deepEqual(ret.value, expectedValue)
})

test('should force the value at array path to an array', (t) => {
  const data = {
    content: { author: 'user2' },
    related: {
      users: { id: 'user2', name: 'User 2' },
    },
  }
  const state = {
    context: [data],
    value: 'user2',
  }
  const expected = {
    context: [data],
    value: { id: 'user2', name: 'User 2' },
  }

  const ret = lookup(props)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should set value to undefined when array path yields undefined', (t) => {
  const data = {
    content: { author: 'user2' },
  }
  const state = {
    context: [data],
    value: 'user2',
  }

  const ret = lookup(props)(options)(identity)(state)

  t.is(ret.value, undefined)
})

test('should set value to undefined when no match', (t) => {
  const data = {
    content: { author: 'user3' },
    related: {
      users: [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
      ],
    },
  }
  const state = {
    context: [data],
    value: 'user3',
  }

  const ret = lookup(props)(options)(identity)(state)

  t.is(ret.value, undefined)
})

// Tests -- reverse

test('should get lookup prop in reverse', (t) => {
  const data = { id: 'user2', name: 'User 2' }
  const state = {
    context: [],
    value: data,
    rev: true,
  }
  const expected = {
    context: [],
    value: 'user2',
    rev: true,
  }

  const ret = lookup(props)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should get lookup prop on array in reverse', (t) => {
  const data = [
    { id: 'user1', name: 'User 1' },
    { id: 'user2', name: 'User 2' },
  ]
  const state = {
    context: [],
    value: data,
    rev: true,
  }
  const expected = {
    context: [],
    value: ['user1', 'user2'],
    rev: true,
  }

  const ret = lookup(props)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should lookup data in reverse when flipped', (t) => {
  const data = {
    content: { author: 'user2' },
    related: {
      users: [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
      ],
    },
  }
  const state = {
    context: [data],
    value: 'user2',
    rev: true,
    flip: true,
  }
  const expected = {
    context: [data],
    value: { id: 'user2', name: 'User 2' },
    rev: true,
    flip: true,
  }

  const ret = lookup(props)(options)(identity)(state)

  t.deepEqual(ret, expected)
})
