export const convertObjToQueryString = (params: Record<string, any>) => {
  return Object.keys(params).map(key => key + '=' + params[key]).join('&');
}