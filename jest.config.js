const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setup-env.js"],
  testMatch: ["**/test/**/*.test.ts"],
  transform: {
    ...tsJestTransformCfg,
  },
};