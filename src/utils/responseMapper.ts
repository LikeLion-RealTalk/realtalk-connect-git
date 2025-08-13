export const mapResponseData = (data) => {
  if (Array.isArray(data)) return data.map(mapKeysToCamel);
  if (typeof data === 'object' && data !== null) return mapKeysToCamel(data);
  return data;
};

const mapKeysToCamel = (obj) => {
  return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamel(key),
        typeof value === 'object' && value !== null ? mapKeysToCamel(value) : value,
      ])
  );
};

const toCamel = (str) =>
    str.replace(/([-_][a-z])/gi, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
