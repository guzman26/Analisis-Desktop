import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]' },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Additional React best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/contexts/PalletContext',
              message:
                'PalletContext was retired. Use hooks from @/modules/inventory instead.',
            },
            {
              name: '@/contexts/BoxesContext',
              message:
                'BoxesContext was retired. Use hooks from @/modules/inventory instead.',
            },
            {
              name: '@/contexts/SalesContext',
              message:
                'SalesContext was retired. Use hooks from @/modules/sales instead.',
            },
          ],
          patterns: [
            {
              group: [
                '**/contexts/PalletContext',
                '**/contexts/BoxesContext',
                '**/contexts/SalesContext',
              ],
              message:
                'Legacy server-state contexts are retired. Use module hooks.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/modules/**/queries/**/*.{ts,tsx}',
      'src/modules/**/routes/**/*.{ts,tsx}',
      'src/modules/**/hooks/**/*.{ts,tsx}',
      'src/modules/**/components/**/*.{ts,tsx}',
      'src/views/Dispatch/DispatchesList.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/api/endpoints',
              message:
                'Use module adapters/hooks instead of importing endpoints directly in UI/query layers.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='style']",
          message:
            'Inline style objects are not allowed in migrated architecture zones.',
        },
      ],
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/api/*', '@/contexts/*', '@/modules/*'],
              message:
                'Shared UI components must stay presentational and cannot contain business/data-layer imports.',
            },
          ],
        },
      ],
    },
  },
];
