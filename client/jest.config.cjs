// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
    roots: ["<rootDir>/test"],
    testEnvironment: "jsdom",
    setupFiles: ["<rootDir>/test/jest.env.ts"],
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@volunteerly/shared$": "<rootDir>/../shared/src/index.ts",
        "^@volunteerly/shared/(.*)$": "<rootDir>/../shared/src/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};

module.exports = createJestConfig(customJestConfig);
