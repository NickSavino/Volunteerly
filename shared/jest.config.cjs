module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/test"],
  testEnvironment: "node",
  clearMocks: true,
  moduleNameMapper: {
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