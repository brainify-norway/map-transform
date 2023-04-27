import { reverse } from "ramda"
import { MapPipe, IOperation as Operation, IState as State, IOptions as Options } from "../types"
import { setValueFromState, pipeMapFns } from "../utils/stateHelpers"
import { mapFunctionFromDef } from "../utils/definitionHelpers"

export default function pipe (defs: MapPipe): Operation {
  return (options: Options) => {
    const fns = defs.map((def) => mapFunctionFromDef(def, options));
    const runPipe = pipeMapFns(fns);
    const runRevPipe = pipeMapFns(reverse(fns));

    return (state: State) => setValueFromState(
      state,
      (state.rev) ? runRevPipe(state) : runPipe(state)
    );
  };
}
