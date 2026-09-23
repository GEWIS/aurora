import { eslintConfig as common } from '@gewis/eslint-config-typescript';
import { eslintConfig as react } from '@gewis/eslint-config-react';
import { eslintConfig as prettier } from '@gewis/prettier-config';

export default [
  ...common,
  ...react,
  prettier,
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.app.json',
          conditionNames: [
            'development',
            'types',
            'import',
            'require',
            'node',
            'browser',
            'default',
          ],
        },
        node: {
          project: './tsconfig.node.json',
        },
      },
    },
  },
];
