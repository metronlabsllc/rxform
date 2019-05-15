export const throwError = (input: any): void => {
  if (input instanceof Error) {
    throw input;
  } else {
    throw new Error(JSON.stringify(input));
  }
};
