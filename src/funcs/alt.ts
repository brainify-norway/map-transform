import * as mapAny from 'map-any'
import { State, Data, MapFunction, MapDefinition } from '../types'
import { setStateValue, getStateValue } from '../utils/stateHelpers'
import { mapFunctionFromDef } from '../utils/definitionHelpers'

const getOne = (context: Data | Data[], index?: number) =>
  (typeof index === 'undefined' || !Array.isArray(context)) ? context : context[index]

const getValueOrDefault = (state: State, runAlt: MapFunction) => (value: Data, index?: number) =>
  (typeof value === 'undefined')
    ? getStateValue(runAlt({ ...state, value: getOne(state.context, index) }))
    : value

export default function alt (fn: MapDefinition): MapFunction {
  const runAlt = mapFunctionFromDef(fn)

  return (state: State) => (state.onlyMapped)
    ? state
    : setStateValue(
      state,
      mapAny(getValueOrDefault(state, runAlt), state.value)
    )
}