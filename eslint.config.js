import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        process: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        navigator: "readonly",
        location: "readonly",
        history: "readonly",
        fetch: "readonly",
        URLSearchParams: "readonly",
        CustomEvent: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },
    rules: {
      /* 📌 قواعد أساسية */
      eqeqeq: ["error", "always"],
      "no-unused-vars": ["warn"],
      "no-console": ["warn"],
      "no-debugger": "error",
      curly: ["error", "all"],
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      indent: ["error", 2],
      "no-trailing-spaces": "error",
      "space-before-blocks": ["error", "always"],
      "keyword-spacing": ["error", { before: true, after: true }],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "comma-dangle": ["error", "always-multiline"],
      "prefer-const": "error",
      "arrow-spacing": ["error", { before: true, after: true }],
      "no-var": "error",

      /* 📌 قواعد React */
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off",
      "react/jsx-key": "error",
      "react/self-closing-comp": "error",
      "react/jsx-curly-spacing": ["error", { when: "never" }],
      "react/jsx-indent": ["error", 2],
      "react/jsx-tag-spacing": ["error", { beforeSelfClosing: "always" }],
      "react/jsx-closing-bracket-location": ["error", "tag-aligned"],
      "react/no-unescaped-entities": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-useless-fragment": "error",

      /* 📌 تحسينات الجودة */
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "max-lines": ["warn", { max: 500, skipBlankLines: true, skipComments: true }],
      "max-depth": ["warn", 4],
      complexity: ["warn", 10],
      "no-nested-ternary": "error",
      "prefer-template": "error",
      "no-useless-concat": "error",

      /* 📌 قواعد React Hooks */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      /* 📌 قواعد Import */
      "import/no-unused-modules": "off",
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^React$",
          argsIgnorePattern: "^_",
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
