module.exports = {
  extends: ['eslint:recommended'],
  plugins: ['prettier'],
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8
  },
  rules: {
    'no-empty': ['error', { allowEmptyCatch: true }],
    indent: ['error', 2],
    'object-curly-spacing': [2, 'always'],
    strict: 0,
    quotes: [2, 'single', 'avoid-escape'],
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'comma-spacing': ['error', { before: false, after: true }],
    'keyword-spacing': [2, { before: true, after: true }],
    'space-infix-ops': 2,
    'spaced-comment': [2, 'always'],
    'arrow-spacing': 2,
    'no-console': 0,
    'padded-blocks': ['error', 'never'],
    'no-cond-assign': ['error', 'always'],
    'no-return-await': 'error',
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: false
      }
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0
      }
    ],
    'key-spacing': [
      2,
      {
        singleLine: { beforeColon: false, afterColon: true }
        // "multiLine": { "beforeColon": false, "afterColon": true, "align": "colon" }
      }
    ]
  }
}
