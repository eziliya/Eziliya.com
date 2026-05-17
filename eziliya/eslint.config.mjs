import js from "@eslint/js"
import globals from "globals"
import reactHooks, { rules } from "eslint-plugin-react-hooks"
import reactRefersh from "eslint-plugin-react-refresh"
import { defineConfig,globalsIgnores } from "eslint/config"
import { jsx } from "react/jsx-runtime"
export default defineConfig([
    globalsIgnores['dist'],
    {
        files:['**/*.{js,jsx}'],
        extends:[
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefersh.configs.vite,
        ],
        languageOptions:{
            ecmaVersion:2020,
            globals:globals.browser,
            parserOptions:{
                ecmaVersion:'latest',
                ecmaFeatures:{
                 jsx:true
                },
                SourceType:'module'
            },
    },
    rules:{
        'no-unused-vars':['error',{varsIgnorePattern:'^[A-Z_]'}],
    },
  },
])