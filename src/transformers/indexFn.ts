import { Transformer } from "../types.js"

const transformer: Transformer = () => () => (_, state) => state.index || 0;

export default transformer
