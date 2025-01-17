import test from 'ava'
import transform from './transform.js'
import { value } from '../transformers/value.js'
import { identity } from '../utils/functional.js'

import concat from './concat.js'

// Setup

const options = {}

// Tests

test('should just pass on state when given one pipeline', (t) => {
  const state = {
    context: [],
    value: { users: ['johnf', 'maryk'], admins: ['theboss'] },
  }
  const expected = {
    context: [],
    value: ['johnf', 'maryk'],
  }

  const ret = concat('users[]')(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should merge arrays from several pipelines', (t) => {
  const state = {
    context: [],
    value: { users: ['johnf', 'maryk'], admins: ['theboss'] },
  }
  const expectedValue = ['johnf', 'maryk', 'theboss']

  const ret = concat('users[]', 'admins[]')(options)(identity)(state)

  t.deepEqual(ret.value, expectedValue)
})

test('should merge strings from several pipelines into array', (t) => {
  const state = {
    context: [],
    value: { group: 'bergen', user: 'johnf' },
  }
  const expectedValue = ['bergen', '-', 'johnf']

  const ret = concat('group', transform(value('-')), 'user')(options)(identity)(
    state
  )

  t.deepEqual(ret.value, expectedValue)
})

test('should strip away undefined', (t) => {
  const state = {
    context: [],
    value: { group: 'bergen', user: 'johnf', team: null },
  }
  const expectedValue = ['bergen', 'johnf', null]

  const ret = concat('group', 'unknown', 'user', 'team')(options)(identity)(
    state
  )

  t.deepEqual(ret.value, expectedValue)
})
