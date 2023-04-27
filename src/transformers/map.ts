import mapAny = require("map-any")
import { escapeValue, unescapeValue } from "../utils/escape.js"
import {
  Dictionary,
  DictionaryValue,
  Dictionaries,
  TransformerProps,
  Transformer,
} from "../types.js"

export interface Props extends TransformerProps {
  dictionary?: Dictionary | string
}

const isSupportedValue = (data: unknown): data is DictionaryValue =>
  ["string", "number", "boolean"].includes(typeof data) ||
  data === null ||
  data === undefined;

function findFirstMatch(
  value: DictionaryValue,
  dictionary: Dictionary,
  direction: 0 | 1
) {
  // eslint-disable-next-line security/detect-object-injection
  const match = dictionary.find((dict) => dict[direction] === value);
  return match ? match[1 - direction] : undefined;
}

function translate({ data, dictionary, rev }: { data: unknown; dictionary: Dictionary; rev: boolean; }) {
  const direction = Number(rev) as 0 | 1;
  return mapAny((data: unknown) => {
    const value = isSupportedValue(data) ? data : undefined;
    const match = findFirstMatch(value, dictionary, direction);
    if (match === undefined || match === "*") {
      const starMatch = findFirstMatch("*", dictionary, direction);
      return starMatch === undefined ? match : starMatch;
    }
    return match;
  }, data);
}

function extractDictionary(
{ dictionary, dictionaries }: { dictionary?: Dictionary | string; dictionaries?: Dictionaries; } = {}) {
  if (typeof dictionary === "string") {
    return dictionaries && dictionaries[dictionary]; // eslint-disable-line security/detect-object-injection
  } else {
    return dictionary;
  }
}

const transformer: Transformer<Props> = props => (options) => {
  const dictionary = extractDictionary(
    { dictionary: props.dictionary, dictionaries: options && options.dictionaries }  );
  if (!dictionary) {
    return () => undefined;
  }
  return (data, state) => {
    const { rev = false } = state;
    const match = translate({ data: escapeValue(data), dictionary, rev });
    return match === "*" ? data : unescapeValue(match);
  };
};

export default transformer
