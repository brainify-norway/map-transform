import { Transformer, TransformerProps } from "../types.js"

export interface Props extends TransformerProps {
  depth?: number
}

const transformer: Transformer<Props> =
  ({ depth = 1 }) => () => (data) => Array.isArray(data) ? data.flat(depth) : data;

export default transformer
