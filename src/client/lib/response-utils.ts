export const getResponse = async <T = unknown>(response: Response): Promise<T> => {
  const res = await response.json();
  if (!res.ok) {
    throw new Error(res.message);
  }
  return res;
};
