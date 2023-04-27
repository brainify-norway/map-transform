import { isObject } from "../utils/is.js"
import {
  TransformDefinition,
  DataMapperWithOptions,
  Transformer,
  TransformerProps,
  Options,
} from "../types.js"
import { defToDataMapper } from "../utils/definitionHelpers.js"
import { identity } from "../utils/functional.js"

export interface Props extends TransformerProps {
  path?: TransformDefinition
}

function dataMapperFromProps(
{ props, options }: { props: Props | DataMapperWithOptions; options: Options }) {
  if (typeof props === "function") {
    return props(options);
  } else if (isObject(props)) {
    return defToDataMapper(props.path, options);
  } else {
    return identity;
  }
}

const transformer: Transformer<Props | DataMapperWithOptions> = props => (options) => {
  const fn = dataMapperFromProps({ props, options });
  return (value, state) => !fn(value, state);
};

export default transformer
