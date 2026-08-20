// Flat ESLint config (ESLint 9). eslint-config-expo bundles the RN/Expo rules;
// eslint-config-prettier turns off formatting rules Prettier owns.
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettier,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
];
