const { OFF, ERROR } = {
  OFF: 0,
  WARN: 1,
  ERROR: 2,
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/jsx-runtime',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    'arrow-parens': [ERROR, 'as-needed'],
    'import/prefer-default-export': OFF,
    'no-console': OFF,
    'react/function-component-definition': [ERROR, {
      namedComponents: 'arrow-function',
      unnamedComponents: 'arrow-function',
    }],
  },
};
