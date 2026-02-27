export const mockLeanResult = <T>(value: T) => ({
  lean: jest.fn().mockResolvedValue(value),
});

export const mockSortLeanResult = <T>(value: T) => ({
  sort: jest.fn().mockReturnValue(mockLeanResult(value)),
});

export const mockSelectLeanResult = <T>(value: T) => ({
  select: jest.fn().mockReturnValue(mockLeanResult(value)),
});

export const mockPopulateSortLeanResult = <T>(value: T) => ({
  populate: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue(mockLeanResult(value)),
  }),
});
