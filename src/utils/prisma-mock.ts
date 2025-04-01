export const mockPrismaClient = {
  stockPrice: {
    create: jest.fn(),
    findFirstOrThrow: jest.fn(),
    findMany: jest.fn(),
  },
};
