import test from 'ava'

import { value, fixed } from './value.js'

// Setup

const state = {
  rev: false,
  noDefaults: false,
  context: [],
  value: {},
}

const options = {}

// Tests -- value

test('should return value', (t) => {
  const data = undefined

  const ret = value({ value: 'The default' })(options)(data, state)

  t.is(ret, 'The default')
})

test('should unescape value', (t) => {
  const data = { something: 'new' }

  const ret = value({ value: '**undefined**' })(options)(data, state)

  t.is(ret, undefined)
})

test('should return value from function', (t) => {
  const data = undefined
  const valueFunction = () => 'Value from function'

  const ret = value({ value: valueFunction })(options)(data, state)

  t.is(ret, 'Value from function')
})

test('should return value when not undefined', (t) => {
  const data = { title: 'The data' }

  const ret = value({ value: 'The default' })(options)(data, state)

  t.is(ret, 'The default')
})

test('should not return default value when noDefaults is true', (t) => {
  const data = undefined
  const stateWithNoDefaults = { ...state, noDefaults: true }

  const ret = value({ value: 'The default' })(options)(
    data,
    stateWithNoDefaults
  )

  t.is(ret, undefined)
})

test('should return value given without object', (t) => {
  const data = undefined

  const ret = value('The default')(options)(data, state)

  t.is(ret, 'The default')
})

// Tests -- fixed

test('should return fixed value', (t) => {
  const data = undefined

  const ret = fixed({ value: 'The default' })(options)(data, state)

  t.is(ret, 'The default')
})

test('should unescape fixed value', (t) => {
  const data = { something: 'new' }

  const ret = fixed({ value: '**undefined**' })(options)(data, state)

  t.is(ret, undefined)
})

test('should return fixed value from function', (t) => {
  const data = undefined
  const valueFunction = () => 'Value from function'

  const ret = fixed({ value: valueFunction })(options)(data, state)

  t.is(ret, 'Value from function')
})

test('should return fixed value also when noDefaults is true', (t) => {
  const data = undefined
  const stateWithNoDefaults = { ...state, noDefaults: true }

  const ret = fixed({ value: 'The default' })(options)(
    data,
    stateWithNoDefaults
  )

  t.is(ret, 'The default')
})

test('should return fixed value without object', (t) => {
  const data = undefined

  const ret = fixed('The default')(options)(data, state)

  t.is(ret, 'The default')
})
