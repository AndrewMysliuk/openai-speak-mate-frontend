module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:vue/vue3-essential", "airbnb-base", "plugin:@typescript-eslint/recommended", "plugin:@typescript-eslint/recommended-requiring-type-checking", "plugin:prettier/recommended"],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
    extraFileExtensions: [".vue"],
    ecmaVersion: 2021,
    sourceType: "module",
  },
  plugins: ["vue", "import", "@typescript-eslint", "prettier", "simple-import-sort"],
  rules: {
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          ["^node:"],
          ["^vue", "^@?\\w"],
          ["^@/app", "^@/layouts", "^@/pages", "^@/widgets", "^@/shared", "^@/"],
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          ["^.+\\.s?css$"],
        ],
      },
    ],
    "simple-import-sort/exports": "error",
    "prettier/prettier": "error",
    "@typescript-eslint/consistent-generic-constructors": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        ts: "never",
        tsx: "never",
        js: "never",
        jsx: "never",
      },
    ],
    "no-return-await": "off",
    "no-useless-catch": "off",
    "import/prefer-default-export": "off",
    "no-shadow": "off",
    camelcase: "off",
    "no-use-before-define": "off",
    "no-param-reassign": "off",
    "no-console": "off",
    "no-nested-ternary": "off",
    "no-plusplus": "off",
    "func-names": "off",
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/consistent-type-assertions": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-misused-promises": "off",
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: ["./tsconfig.json", "./tsconfig.node.json"],
      },
    },
  },
}
