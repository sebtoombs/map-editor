export const parseNumber = (value: string | number | undefined | null) => {
  if (typeof value === "string") {
    try {
      let v = Number(value);
      if (isNaN(v)) {
        return 0;
      }
      return v;
    } catch (e) {
      return 0;
    }
  } else if (typeof value === "number") {
    return value;
  }
  return 0;
};

export const getInputMin = (element: HTMLInputElement) => {
  const min = element.min;
  if (min) {
    return parseNumber(min);
  }
  return false;
};
