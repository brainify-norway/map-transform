import { Data, Prop, IOperands as Operands } from "../types"
import getter from "../utils/pathGetter"

interface IComparer {
  (value: Data): boolean
}

export interface IOptions extends Operands {
  path?: string,
  operator?: string,
  match?: Prop;
}

const not = (comparer: IComparer) => (value: Data) => !comparer(value);

const compareArrayOrValue = (comparer: IComparer) =>
  (value: Data) => (Array.isArray(value)) ? value.some(comparer) : comparer(value);

const compareEqual = (match: Prop) => compareArrayOrValue((value: Data) => value === match);
const isNumeric = (value: Prop): value is number => typeof value === "number";

function createComparer(operator: string, match: Prop) {
  switch (operator) {
  case "=":
    return compareEqual(match);
  case "!=":
    return not(compareEqual(match));
  case ">":
    return compareArrayOrValue((value: Data) => isNumeric(value) && isNumeric(match) && value > match);
  case ">=":
    return compareArrayOrValue((value: Data) => isNumeric(value) && isNumeric(match) && value >= match);
  case "<":
    return compareArrayOrValue((value: Data) => isNumeric(value) && isNumeric(match) && value < match);
  case "<=":
    return compareArrayOrValue((value: Data) => isNumeric(value) && isNumeric(match) && value <= match);
  default:
    return (_: Data) => false;
  }
}

export default function compare({ path = ".", operator = "=", match }: IOptions) {
  const getFn = getter(path);

  const comparer = createComparer(operator, match);

  return (data: Data) => {
    const value = getFn(data);
    return comparer(value);
  };
}
