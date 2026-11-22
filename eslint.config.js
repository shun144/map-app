//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

/*
 * 注: no-restricted-imports の group は gitignore 形式で、先頭の # がコメント扱いになる。
 *     そのため #/ 別名のパターンは regex で書く。
 *
 * 依存の向きを機械的に守らせるルール（README「依存ルール」参照）。
 *   lib / config（shared） → features → app
 * - features 同士は import しない。共有したいものは lib へ下ろすか、app で配線する
 * - バレルファイル（index.ts）は使わず、実体のファイルを直接 import する
 * - maplibre-gl を import できるのは lib/map/maplibre だけ（ADR 0002）
 */

const maplibreOnlyInAdapter = {
  group: ['maplibre-gl', 'maplibre-gl/*'],
  message:
    '地図ライブラリは MapController（#/lib/map/map-controller）経由で使ってください。直接 import できるのは src/lib/map/maplibre だけです（ADR 0002）。',
}

const noAppFromBelow = {
  regex: '^#/app(/|$)',
  message: 'app 層は最上位です。下の層から import しないでください。',
}

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/map/maplibre/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [maplibreOnlyInAdapter] }],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            maplibreOnlyInAdapter,
            noAppFromBelow,
            {
              regex: '^#/features/',
              message:
                'feature 同士は import できません。共有するものは lib へ移すか、app/pages で組み合わせてください。',
            },
            {
              // ファイルは features/<name>/<dir>/ の深さにあるので、../../ は feature の外を指す
              group: ['../../*'],
              message:
                '相対パスで feature の外へ出ないでください。shared は #/lib などの別名で import します。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/**/*.{ts,tsx}', 'src/config/**/*.{ts,tsx}'],
    ignores: ['src/lib/map/maplibre/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            maplibreOnlyInAdapter,
            noAppFromBelow,
            {
              regex: '^(#/features(/|$)|(\\.\\./)+features/)',
              message:
                'shared 層（lib / config）は features に依存できません。',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'src/app/routeTree.gen.ts',
    ],
  },
]
