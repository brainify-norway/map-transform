import {
  compose,
  unless,
  always,
  ifElse,
  filter as filterR,
  identity
} from "ramda"
import { IOperation as Operation, IDataMapper as DataMapper, Data, IState as State, IOptions as Options } from
  "../types"
import { getStateValue, contextFromState } from "../utils/stateHelpers"

export default function filter(fn: DataMapper<Data, boolean>): Operation {
  return (_: Options) => {
    if ((typeof fn as any) !== "function") {
      return identity;
    }

    return (state: State) => {
      const run = (data: Data) => fn(data, contextFromState(state));
      var returnData = undefined;
      const runFilter = compose(
        ifElse(Array.isArray, filterR(run), unless(run, always<undefined>(returnData))),
        getStateValue
      );

      return {
        ...state,
        value: runFilter(state)
      };
    };
  };
}
