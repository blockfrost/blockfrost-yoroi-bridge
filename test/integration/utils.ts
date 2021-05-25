import join from 'url-join';

export const getApiUrl = (endpoint: string): string => {
  if (!process.env.BASE_URL) {
    throw Error('Missing base api url process.env.BASE_URL');
  }

  return join(process.env.BASE_URL, `/api/v2`, endpoint);
};
