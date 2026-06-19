import { eslintConfig as common } from '@gewis/eslint-config-typescript';
import { eslintConfig as react } from '@gewis/eslint-config-react';
import { eslintConfig as prettier } from '@gewis/prettier-config';

export default [...common, ...react, prettier];
