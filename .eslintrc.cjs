module.exports = {
  root: true,
  plugins: ['svelte3', 'unused-imports'],
  ignorePatterns: ['*.cjs', '*.config.js'],
  overrides: [
    {
      files: ['*.ts', '*.svelte'],
      extends: [
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
        project: ['./tsconfig.json'],
        extraFileExtensions: ['.svelte'],
      },
      rules: {
        'import/extensions': ['error', 'never'],
        'import/prefer-default-export': 'off',
        'unused-imports/no-unused-imports': 'error',
        'import/order': ['error', { 'newlines-between': 'always' }],
      },
    },
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
      rules: {
        'import/no-mutable-exports': 'off',
        'import/first': 'off',
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/extensions': 'off',
      },
    },
  ],
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
}
