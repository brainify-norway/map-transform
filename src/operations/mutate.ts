import mapAny = require("map-any")
import { IOperation as Operation, IState as State, IMapObject as MapObject, IOptions as Options } from "../types"
import { getStateValue, setStateValue } from "../utils/stateHelpers"
import objectToMapFunction from "../utils/objectToMapFunction"

export default function mutate(def: MapObject): Operation {
  return (options: Options) => {
    const runMutation = objectToMapFunction(def, options);

    return (state: State): State =>
      state.value === undefined
        ? state
        : setStateValue(
            state,
            mapAny(
              value => getStateValue(runMutation(setStateValue(state, value))),
              state.value
            )
          );
  };
}
