import { toRaw, isRef, isReactive, isProxy, unref } from "vue";

/**
 * Deeply convert a reactive object to a raw object
 * @param sourceObj The object to convert
 * @returns The converted object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toRawDeep<T extends Record<string, any>>(sourceObj: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objectIterator = (input: any): any => {
    if (isRef(input)) {
      return objectIterator(unref(input));
    }
    if (isReactive(input) || isProxy(input)) {
      return objectIterator(toRaw(input));
    }
    if (Array.isArray(input)) {
      return input.map((item) => objectIterator(item));
    }
    if (input && typeof input === "object") {
      return Object.keys(input).reduce((acc, key) => {
        acc[key as keyof typeof acc] = objectIterator(input[key]);
        return acc;
      }, {} as T);
    }
    return input;
  };

  return objectIterator(sourceObj);
}
