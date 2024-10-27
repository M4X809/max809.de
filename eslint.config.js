// const config = {
//   "parser": "@typescript-eslint/parser",
//   "parserOptions": {
//     "project": true
//   },
//   "plugins": [
//     "@typescript-eslint",
//     "drizzle"
//   ],
//   "extends": [
//     "next/core-web-vitals",
//     "plugin:@typescript-eslint/recommended-type-checked",
//     "plugin:@typescript-eslint/stylistic-type-checked"
//   ],
//   "rules": {
//     "@typescript-eslint/array-type": "off",
//     "@typescript-eslint/consistent-type-definitions": "off",
//     "@typescript-eslint/consistent-type-imports": [
//       "warn",
//       {
//         "prefer": "type-imports",
//         "fixStyle": "inline-type-imports"
//       }
//     ],
//     "@typescript-eslint/no-unused-vars": [
//       "warn",
//       {
//         "argsIgnorePattern": "^_"
//       }
//     ],
//     "@typescript-eslint/require-await": "off",
//     "@typescript-eslint/no-misused-promises": [
//       "error",
//       {
//         "checksVoidReturn": {
//           "attributes": false
//         }
//       }
//     ],
//     "drizzle/enforce-delete-with-where": [
//       "error",
//       {
//         "drizzleObjectName": [
//           "db",
//           "ctx.db"
//         ]
//       }
//     ],
//     "drizzle/enforce-update-with-where": [
//       "error",
//       {
//         "drizzleObjectName": [
//           "db",
//           "ctx.db"
//         ]
//       }
//     ]
//   }
// }
// module.exports = config;

import tsParser from "@typescript-eslint/parser";

import typescriptPlugin from "@typescript-eslint/eslint-plugin";
// @ts-ignore
import drizzlePlugin from "eslint-plugin-drizzle";
// @ts-ignore
import nextPlugin from "@next/eslint-plugin-next";


export default [
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs", "**/*.ts", "**/*.tsx"],
    languageOptions: {
        parser: tsParser
    },
    plugins: {
      typescript: typescriptPlugin,
      drizzle: drizzlePlugin,
      next: nextPlugin
    },

    
  }
]