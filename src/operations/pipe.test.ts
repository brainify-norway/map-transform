import test from 'ava'
import type { Pipeline } from '../types.js'
import { get, set } from './getSet.js'
import transform from './transform.js'
import { value } from '../transformers/value.js'
import { identity } from '../utils/functional.js'

import pipe from './pipe.js'

// Setup

const state = {
  context: [],
  value: { data: { name: 'John F.' } },
}

const options = {}

const json = () => (data: unknown) => JSON.stringify(data)

// Tests

test('should run simple map pipe', (t) => {
  const def = ['data', 'name']
  const expected = {
    context: [],
    value: 'John F.',
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should return with same context as it got', (t) => {
  const def = ['name']
  const state = {
    context: [{ data: { name: 'John F.' } }],
    value: { name: 'John F.' },
  }
  const expected = {
    context: [{ data: { name: 'John F.' } }],
    value: 'John F.',
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should allow combination of string path and get operation', (t) => {
  const def = ['data', get('name')]
  const expected = {
    context: [],
    value: 'John F.',
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should treat object as map object', (t) => {
  const def = ['data', { fullName: 'name' }]
  const expectedValue = { fullName: 'John F.' }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret.value, expectedValue)
})

test('should run pipeline in reverse on reverse mapping', (t) => {
  const def = [get('data'), get('name')]
  const state = {
    context: [],
    value: 'John F.',
    rev: true,
  }
  const expected = {
    context: [],
    value: { data: { name: 'John F.' } },
    rev: true,
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should reverse map pipe when flipping', (t) => {
  const def = [get('data'), get('name')]
  const state = {
    context: [],
    value: 'John F.',
    flip: true,
    rev: false,
  }
  const expected = {
    context: [],
    value: { data: { name: 'John F.' } },
    flip: true,
    rev: false,
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should not reverse map when rev and flipping', (t) => {
  const def = ['data', 'name']
  const stateFlipRev = {
    ...state,
    flip: true,
    rev: true,
  }
  const expected = {
    ...stateFlipRev,
    value: 'John F.',
  }

  const ret = pipe(def)(options)(identity)(stateFlipRev)

  t.deepEqual(ret, expected)
})

test('should not leak flipping between objects and skip the fwd dir', (t) => {
  const def = [
    { $flip: true, items: 'items' },
    { $direction: 'fwd', items: 'items' },
    { data: { name: 'items.name' } },
  ]
  const state = {
    context: [],
    value: { data: { name: 'John F.' } },
    rev: true,
  }
  const expected = {
    context: [],
    value: { items: { name: 'John F.' } },
    rev: true,
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should pass flipping on to layers in the pipeline when presented to the pipeline', (t) => {
  const def = [{ items: 'users' }, { data: { name: 'items.name' } }]
  const state = {
    context: [],
    value: { users: { name: 'John F.' } },
    rev: true,
    flip: true,
  }
  const expected = {
    context: [],
    value: { data: { name: 'John F.' } },
    rev: true,
    flip: true,
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should set on target', (t) => {
  const def = ['>name', '>data.personal']
  const state = {
    context: [],
    target: { data: { personal: { age: 32 } } },
    value: 'John F.',
    rev: false,
  }
  const expected = {
    ...state,
    value: { data: { personal: { age: 32, name: 'John F.' } } },
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should get and set on target', (t) => {
  const def = ['user', '>data.personal.name']
  const state = {
    context: [],
    target: { data: { personal: { age: 32 } } },
    value: { user: 'John F.' },
    rev: false,
  }
  const expected = {
    ...state,
    value: { data: { personal: { age: 32, name: 'John F.' } } },
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should get and set on target with sub pipes', (t) => {
  const def = [pipe(['user']), pipe(['>data.personal.name'])]
  const state = {
    context: [],
    target: { data: { personal: { age: 32 } } },
    value: { user: 'John F.' },
    rev: false,
  }
  const expected = {
    ...state,
    value: { data: { personal: { age: 32, name: 'John F.' } } },
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should get and set on target with iteration', (t) => {
  const def = ['data[]', 'nickname', '>name', '>people[]']
  const state = {
    context: [],
    target: undefined,
    value: { data: [{ nickname: 'John F.', age: 32 }] },
    rev: false,
  }
  const expected = {
    ...state,
    value: { people: [{ name: 'John F.' }] },
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should treat target correctly going forward', (t) => {
  const def = [set('name'), set('personal'), transform(json), set('data.user')]
  const state = {
    context: [],
    target: { data: { user: { personal: { age: 32 } }, archived: false } },
    value: 'John F.',
    rev: false,
  }
  const expected = {
    ...state,
    value: {
      data: {
        user: '{"personal":{"age":32,"name":"John F."}}',
        archived: false,
      },
    },
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should treat target correctly in reverse', (t) => {
  const def = ['data.user', transform(json), get('personal'), 'name']
  const state = {
    context: ['John F.', ,],
    target: { data: { user: { personal: { age: 32 } }, archived: false } },
    value: 'John F.',
    rev: true,
  }
  const expected = {
    ...state,
    value: {
      data: {
        user: '{"personal":{"age":32,"name":"John F."}}',
        archived: false,
      },
    },
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should handle empty pipeline', (t) => {
  const def: Pipeline = []
  const expected = state

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should handle empty pipeline in reverse', (t) => {
  const def: Pipeline = []
  const stateRev = { ...state, rev: true }
  const expected = stateRev

  const ret = pipe(def)(options)(identity)(stateRev)

  t.deepEqual(ret, expected)
})

test('should modify on several levels and with several objects', (t) => {
  const def = [
    {
      $modify: '.',
      payload: {
        $modify: 'payload',
        data: 'payload.data.items[]',
      },
      meta: {
        $modify: 'meta',
        options: {
          $modify: 'meta.options',
          'Content-Type': transform(value('application/json')),
        },
      },
    },
    {
      $modify: '.',
      payload: { $modify: 'payload', 'data.docs[]': ['payload.data'] },
    },
  ]
  const state = {
    context: [],
    value: {
      type: 'DELETE',
      payload: {
        data: { items: [{ id: 'ent1', $type: 'entry' }] },
        service: 'entries',
      },
      meta: {
        ident: { id: 'johnf' },
        options: {
          uri: 'http://api1.test/database/bulk_delete',
        },
      },
    },
  }
  const expectedValue = {
    type: 'DELETE',
    payload: {
      data: { docs: [{ id: 'ent1', $type: 'entry' }] },
      service: 'entries',
    },
    meta: {
      ident: { id: 'johnf' },
      options: {
        uri: 'http://api1.test/database/bulk_delete',
        'Content-Type': 'application/json',
      },
    },
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret.value, expectedValue)
})

test('should run complex case forward', (t) => {
  const def = [{ user: ['data', 'name'] }, set('attributes')]
  const state = {
    context: [],
    value: { data: { name: 'John F.' } },
  }
  const expected = {
    context: [],
    value: { attributes: { user: 'John F.' } },
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should run complex case in reverse', (t) => {
  const def = [{ name: ['attributes', 'user'] }, set('data')]
  const state = {
    context: [],
    value: { data: { name: 'John F.' } },
    rev: true,
  }
  const expected = {
    context: [],
    value: { attributes: { user: 'John F.' } },
    rev: true,
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should map with parent', (t) => {
  const def = [
    'invoices[].lines[]',
    {
      $iterate: true,
      id: 'rowId',
      quantity: 'count',
      invoiceNo: '^.^.number',
    },
  ]
  const data = {
    invoices: [
      {
        number: '18843-11',
        lines: [
          { rowId: 1, count: 2 },
          { rowId: 2, count: 1 },
        ],
      },
      {
        number: '18843-12',
        lines: [
          { rowId: 3, count: 1 },
          { rowId: 4, count: 5 },
        ],
      },
    ],
  }
  const state = {
    context: [],
    value: data,
    rev: false,
  }
  const expected = {
    context: [],
    value: [
      { id: 1, quantity: 2, invoiceNo: '18843-11' },
      { id: 2, quantity: 1, invoiceNo: '18843-11' },
      { id: 3, quantity: 1, invoiceNo: '18843-12' },
      { id: 4, quantity: 5, invoiceNo: '18843-12' },
    ],
    rev: false,
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should map with parent through several iterations', (t) => {
  const def = [
    'invoice.lines[]',
    {
      $iterate: true,
      id: 'rowId',
      quantity: 'count',
    },
    {
      $iterate: true,
      id: 'id',
      quantity: 'quantity',
      invoiceNo: '^.^.number',
    },
  ]
  const data = {
    invoice: {
      number: '18843-11',
      lines: [
        { rowId: 1, count: 2 },
        { rowId: 2, count: 1 },
      ],
    },
  }
  const state = {
    context: [],
    value: data,
    rev: false,
  }
  const expected = {
    context: [],
    value: [
      { id: 1, quantity: 2, invoiceNo: '18843-11' },
      { id: 2, quantity: 1, invoiceNo: '18843-11' },
    ],
    rev: false,
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should map with parent in reverse', (t) => {
  const def = [
    'invoices[].lines[]',
    {
      $iterate: true,
      id: 'rowId',
      quantity: 'count',
      invoiceNo: '^.^.number',
    },
  ]
  const data = [
    { id: 1, quantity: 2, invoiceNo: '18843-11' },
    { id: 2, quantity: 1, invoiceNo: '18843-11' },
  ]
  const state = {
    context: [],
    value: data,
    rev: true,
  }
  const expected = {
    context: [],
    value: {
      invoices: [
        {
          // number: '18843-11', // TODO: Make parent path work in reverse
          lines: [
            { rowId: 1, count: 2 },
            { rowId: 2, count: 1 },
          ],
        },
      ],
    },
    rev: true,
  }

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})

test('should do nothing when no pipeline', (t) => {
  const def = undefined
  const expected = state

  const ret = pipe(def)(options)(identity)(state)

  t.deepEqual(ret, expected)
})
