import { Data, IOperands as Operands } from "../types"
import getter from "../utils/pathGetter"

export interface IOptions extends Operands {
  path?: string;
  excludePath?: string;
}

const ensureArray = <T>(value: T | T[]): T[] =>
  Array.isArray(value) ? value : [value];

const getArray = (path?: string) => (path ? getter(path) : () => []);

export default function exclude({ path, excludePath }: IOptions) {
  const getArrFn = getArray(path);
  const getExcludeFn = getArray(excludePath);

  return (data: Data) => {
    const arr:any[] = ensureArray(getArrFn(data));
    const exclude: any[] = ensureArray(getExcludeFn(data));
    return arr.filter(value => !exclude.includes(value));
  };
}
