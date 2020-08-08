import mergeDeep = require('lodash.merge')
import { Operation, State, MapDefinition } from '../types'
import {
  getStateValue,
  setStateValue,
  shouldSkipMutation,
} from '../utils/stateHelpers'
import { mapFunctionFromDef } from '../utils/definitionHelpers'

const mergeStates = (state: State, thisState: State) =>
  setStateValue(
    state,
    mergeDeep(getStateValue(state), getStateValue(thisState))
  )

export default function merge(...defs: MapDefinition[]): Operation {
  return (options) => {
    const skipMutation = shouldSkipMutation(options)
    if (defs.length === 0) {
      return (state) => setStateValue(state, undefined)
    }
    const pipelines = defs.map((def) => mapFunctionFromDef(def)(options))

    return (state) =>
      skipMutation(state)
        ? setStateValue(state, undefined)
        : pipelines.map((pipeline) => pipeline(state)).reduce(mergeStates)
  }
}