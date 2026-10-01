import { defineConfig } from "vitest/config";
export default defineConfig({test:{include:["tests/unit/**/*.test.ts"],coverage:{provider:"v8",include:["src/lib/**/*.ts"],exclude:["src/lib/generated.ts"],thresholds:{lines:80,branches:80,functions:80,statements:80}}}});
