import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
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
        rules: {
            "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { printWidth: 100 }],
        },
    },
    prettier,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
