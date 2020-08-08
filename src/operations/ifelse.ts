import { compose, ifElse } from 'ramda'
import { DataMapper, MapDefinition, Operation } from '../types'
import {
  getStateValue,
  setStateValue,
  contextFromState,
} from '../utils/stateHelpers'
import { mapFunctionFromDef } from '../utils/definitionHelpers'

export default function (
  fn: DataMapper,
  trueDef?: MapDefinition,
  falseDef?: MapDefinition
): Operation {
  const falseFn = mapFunctionFromDef(falseDef)
  if (typeof fn !== 'function') {
    return falseFn
  }
  const trueFn = mapFunctionFromDef(trueDef)

  return (options) => {
    const run = compose(
      getStateValue,
      ifElse(
        (state) => !!fn(getStateValue(state), contextFromState(state)),
        trueFn(options),
        falseFn(options)
      )
    )

    return (state) => setStateValue(state, run(state))
  }
}