import test from 'ava'

import not from './not'

// Setup

const returnIt = (value: unknown) => !!value
const state = {
  rev: false,
  onlyMapped: false,
  root: {},
  context: {},
  value: {},
}

// Tests

test('should return true for false and vice versa', (t) => {
  t.true(not(returnIt)(false, state))
  t.false(not(returnIt)(true, state))
})
