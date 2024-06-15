export const removeInvalidCharacter = (inputString: string): string => {
  const sanitizedString = inputString.replace(/[<>:"/|?]/g, '');
  return sanitizedString;
};

export const removeBracket = (inputString: string): string => {
  let sanitizedString = inputString.replaceAll(/\[(.*?)\]/g, '');
  sanitizedString = sanitizedString.trim();
  return sanitizedString;
};
export function convertToUnicodeAndCreateURL(input: string): string {
  // Convert ASCII string to Unicode string
  const unicodeString = encodeURIComponent(input);

  // Replace spaces with hyphens
  const url = unicodeString.split(' ').join('-');

  return url;
}