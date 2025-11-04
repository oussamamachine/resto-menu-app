module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  settings: {
    react: { version: 'detect' }
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/prop-types': 'off'
  }
}
