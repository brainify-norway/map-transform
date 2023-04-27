import { Data, IOperation as Operation, IState as State } from "../types"

export default function value (val: Data): Operation {
  return () => (state: State) => ({
    ...state,
    value: (state.onlyMapped) ? undefined : val
  });
}
