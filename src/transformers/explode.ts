import { Transformer } from "../types.js"
import { isObject } from "../utils/is.js"

export interface KeyValue {
  key: string | number;
  value: unknown;
}

const isExplodedArray = (data: unknown[]) =>
  data.length > 0 &&
  data.every((item) => {
    if (isObject(item)) {
      const keyValue = item as Record<string, unknown>;
      return keyValue.key === "number";
    }
    return false;
  });

const setValueOnKey = (
  target: unknown[] | Record<string, unknown>,
  keyValue: unknown
) => {
  if (isObject(keyValue)) {
    const { key, value } = keyValue as  Record<string, unknown >;
    if (Array.isArray(target)) {
      target[key as number] = value;
    } else {
      target[String(key)] = value;
    }
  }
  return target;
};

function doImplode(data: unknown|unknown[]) {
  if (Array.isArray(data)) {
    return data.reduce(
      setValueOnKey,
      isExplodedArray(data)
        ? ([] as unknown[])
        : ({} as Record<string, unknown>)
    );
  } else {
    return undefined;
  }
}

function doExplode(data: unknown): unknown[] | undefined {
  if (isObject(data)) {
    return Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]: [string, unknown]) => ({
        key,
        value,
      }));
  } else if (Array.isArray(data)) {
    return data.map((value: unknown, key: number) => ({ key, value }));
  } else {
    return undefined;
  }
}

const explode: Transformer = () => () => (data, state) => state.rev ? doImplode(data) : doExplode(data);

const implode: Transformer = () => () => (data, state) => state.rev ? doExplode(data) : doImplode(data);

export { explode, implode }
