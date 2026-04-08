import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        ...betterTailwindcss.configs.recommended,
        files: ["src/**/*.{js,jsx,ts,tsx}"],
        settings: {
            "better-tailwindcss": {
                entryPoint: "src/app/globals.css",
            },
        },
        plugins: {
            ...betterTailwindcss.configs.recommended.plugins,
            "unused-imports": unusedImports,
        },
        rules: {
            ...betterTailwindcss.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            "better-tailwindcss/enforce-consistent-line-wrapping": [
                "warn",
                {
                    group: "newLine",
                    preferSingleLine: false,
                    printWidth: 100,
                    indent: 4,
                    lineBreakStyle: "windows",
                    strictness: "loose",
                },
            ],
            "better-tailwindcss/no-conflicting-classes": "error",
            "better-tailwindcss/no-unknown-classes": "error",
            "better-tailwindcss/no-duplicate-classes": "warn",
            "better-tailwindcss/no-unnecessary-whitespace": "warn",
            "better-tailwindcss/no-deprecated-classes": "warn",
            "better-tailwindcss/enforce-canonical-classes": [
                "warn",
                { collapse: true, logical: true },
            ],
            "better-tailwindcss/enforce-shorthand-classes": "off",
            "better-tailwindcss/enforce-consistent-important-position": "off",
            "better-tailwindcss/enforce-consistent-variable-syntax": "off",
        },
    },
    prettier,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
