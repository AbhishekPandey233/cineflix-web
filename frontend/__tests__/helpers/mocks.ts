export const createSearchParams = (params: Record<string, string>) => ({
  get: (key: string) => params[key] ?? null,
});

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};
