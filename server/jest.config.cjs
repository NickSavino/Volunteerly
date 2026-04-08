module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/test"],
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/jest.env.ts"],
  clearMocks: true,
  moduleNameMapper: {
    "^@volunteerly/shared$": "<rootDir>/../shared/src/index.ts",
    "^@volunteerly/shared/(.*)$": "<rootDir>/../shared/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
        },
      },
    ],
  },
};