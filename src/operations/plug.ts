import { IState as State, IOperation as Operation } from "../types"
import { setStateValue } from "../utils/stateHelpers"

export default function plug (): Operation {
  return () => (state: State) => setStateValue(state, undefined);
}
