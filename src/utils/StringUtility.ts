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
export function getNumberValueFromString(input: string): number {
  const numberPattern = /\d+/; // Regular expression to match one or more digits

  const match = input.match(numberPattern);
  if (match) {
    const integerValue = parseInt(match[0], 10);
    return integerValue;
  } else {
    //console.log('No integer value found');
    return -1;
  }
}
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
