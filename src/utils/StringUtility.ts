export const removeInvalidCharacter = (inputString: string): string => {
  const sanitizedString = inputString.replace(/[<>:"/|?]/g, '');
  return sanitizedString;
};
