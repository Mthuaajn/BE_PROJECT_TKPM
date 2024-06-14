export const removeInvalidCharacter = (inputString: string): string => {
  const sanitizedString = inputString.replace(/[<>:"/|?]/g, '');
  return sanitizedString;
};

export const removeBracket = (inputString: string): string => {
  let sanitizedString = inputString.replaceAll(/\[(.*?)\]/g, '');
  sanitizedString = sanitizedString.trim();
  return sanitizedString;
};
