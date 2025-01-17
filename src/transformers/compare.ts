import mapAny from 'map-any'
import type { TransformerProps, Path, Transformer } from '../types.js'
import { unescapeValue } from '../utils/escape.js'
import { defToDataMapper } from '../utils/definitionHelpers.js'
import { goForward } from '../utils/stateHelpers.js'

interface Comparer {
  (value: unknown, match: unknown): boolean
}

interface NumericComparer {
  (value: number, match: number): boolean
}

export interface Props extends TransformerProps {
  path?: Path
  operator?: string
  match?: unknown
  matchPath?: Path
  value?: unknown // Alias of `match`
  valuePath?: Path // Alias of `matchPath`
  not?: boolean
}

const not = (comparer: Comparer) => (value: unknown, match: unknown) =>
  !comparer(value, match)

const compareArrayOrValue =
  (comparer: Comparer) => (value: unknown, match: unknown) =>
    Array.isArray(value)
      ? value.some((value: unknown) => comparer(value, match))
      : comparer(value, match)

const isNumeric = (value: unknown): value is number => typeof value === 'number'

const compareArrayOrValueNumeric = (comparer: NumericComparer) =>
  compareArrayOrValue(
    (value: unknown, match: unknown) =>
      isNumeric(value) && isNumeric(match) && comparer(value, match)
  )

const compareEqual = compareArrayOrValue(
  (value: unknown, match: unknown) => value === match
)

const compareIn = (value: unknown, match: unknown) =>
  Array.isArray(match)
    ? match.some((item) => compareEqual(value, item))
    : compareEqual(value, match)

const exists = (value: unknown) => value !== undefined

function createComparer(operator: string) {
  switch (operator) {
    case '=':
      return compareEqual
    case '!=':
      return not(compareEqual)
    case '>':
      return compareArrayOrValueNumeric(
        (value: number, match: number) => value > match
      )
    case '>=':
      return compareArrayOrValueNumeric(
        (value: number, match: number) => value >= match
      )
    case '<':
      return compareArrayOrValueNumeric(
        (value: number, match: number) => value < match
      )
    case '<=':
      return compareArrayOrValueNumeric(
        (value: number, match: number) => value <= match
      )
    case 'in':
      return compareIn
    case 'exists':
      return exists
    default:
      return (_value: unknown, _match: unknown) => false
  }
}

const transformer: Transformer<Props> = function compare({
  path = '.',
  operator = '=',
  match,
  value,
  matchPath,
  valuePath,
  not = false,
}) {
  match = match ?? value // Allow alias
  matchPath = matchPath ?? valuePath // Allow alias

  return (options) => {
    const getValue = defToDataMapper(path, options)
    const realMatchValue = mapAny(unescapeValue, match)
    const getMatch =
      typeof matchPath === 'string'
        ? defToDataMapper(matchPath, options)
        : () => realMatchValue
    const comparer = createComparer(operator)

    return (data, state) => {
      const fwdState = goForward(state)
      const value = getValue(data, fwdState)
      const match = getMatch(data, fwdState)
      const result = comparer(value, match)
      return not ? !result : result
    }
  }
}

export default transformer
