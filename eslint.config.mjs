import { defineConfig } from 'eslint/config';
import scality from '@scality/eslint-config-scality';
import { mocha } from '@scality/eslint-config-scality/testing';

export default defineConfig(
    ...scality,
    {
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'script',
        },
    },
    mocha(['tests/**/*.js']),
);
