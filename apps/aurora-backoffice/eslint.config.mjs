import { eslintConfig as common } from '@gewis/eslint-config-typescript';
import { eslintConfig as vue } from '@gewis/eslint-config-vue';
import { eslintConfig as prettier } from '@gewis/prettier-config';

export default [
  ...common,
  ...vue,
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
