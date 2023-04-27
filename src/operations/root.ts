import { MapDefinition, IOperation as Operation, IOptions as Options } from "../types"
import { mapFunctionFromDef } from "../utils/definitionHelpers"

export default function ({ def }: { def: MapDefinition }): Operation {
  return (options: Options) => {
    const pipeline = mapFunctionFromDef(def, options);

    return (state) => pipeline({ ...state, value: state.root });
  };
}
