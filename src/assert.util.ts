const defined = <T>(value?: T | null, message?: string): T => {
  if (value === undefined || value === null) {
    throw new Error(message ?? 'Value is not defined');
  }
  return value;
};

const notEmpty = <T extends string | Array<U>, U>(value?: T | null, message?: string): T => {
  const definedValue = defined(value);

  if (definedValue.length === 0) {
    throw new Error(message ?? 'Value is empty');
  }
  return definedValue;
};

export const Assert = {
  defined,
  notEmpty,
};
