//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

/*
 * 注: no-restricted-imports の group は gitignore 形式で、先頭の # がコメント扱いになる。
 *     そのため #/ 別名のパターンは regex で書く。
 *
 * 依存の向きを機械的に守らせるルール（README「依存ルール」参照）。
 *   lib / config → shared → features → app
 * - features 同士は import しない。複数の feature が使うものは shared へ移し、組み合わせは app で行う
 * - バレルファイル（index.ts）は使わず、実体のファイルを直接 import する
 * - maplibre-gl を import できるのは lib/map/maplibre だけ（ADR 0002）
 *
 * no-restricted-imports は、同じファイルに当たる後の設定が前の設定を丸ごと上書きする。
 * そのため層ごとの設定には、その層に必要なパターンをすべて並べる。
 */

const maplibreOnlyInAdapter = {
  group: ['maplibre-gl', 'maplibre-gl/*'],
  message:
    '地図ライブラリは MapController（#/lib/map/map-controller）経由で使ってください。直接 import できるのは src/lib/map/maplibre だけです（ADR 0002）。',
}

const noApp = {
  regex: '^#/app(/|$)',
  message: 'app 層は最上位です。下の層から import しないでください。',
}

const noOtherFeatures = {
  regex: '^#/features/',
  message:
    'feature 同士は import できません。複数の feature が使うものは shared へ移し、組み合わせは app/pages で行ってください。',
}

const noLeavingFeature = {
  // ファイルは features/<name>/<dir>/ の深さにあるので、../../ は feature の外を指す
  group: ['../../*'],
  message:
    '相対パスで feature の外へ出ないでください。shared や lib は #/ の別名で import します。',
}

const noFeatures = {
  regex: '^(#/features(/|$)|(\\.\\./)+features/)',
  message:
    'features より下の層（lib / config / shared）は features に依存できません。',
}

const noShared = {
  regex: '^(#/shared(/|$)|(\\.\\./)+shared/)',
  message: 'lib / config は shared に依存できません。',
}

const restrictImports = (files, patterns, ignores = []) => ({
  files,
  ignores,
  rules: { 'no-restricted-imports': ['error', { patterns }] },
})

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
  restrictImports(
    ['src/main.tsx', 'src/app/**/*.{ts,tsx}'],
    [maplibreOnlyInAdapter],
  ),
  restrictImports(
    ['src/features/**/*.{ts,tsx}'],
    [maplibreOnlyInAdapter, noApp, noOtherFeatures, noLeavingFeature],
  ),
  restrictImports(
    ['src/shared/**/*.{ts,tsx}'],
    [maplibreOnlyInAdapter, noApp, noFeatures],
  ),
  restrictImports(
    ['src/lib/**/*.{ts,tsx}', 'src/config/**/*.{ts,tsx}'],
    [maplibreOnlyInAdapter, noApp, noFeatures, noShared],
    ['src/lib/map/maplibre/**'],
  ),
  // MapLibre アダプタは maplibre-gl を使ってよいが、lib 層としての依存の向きは守る
  restrictImports(
    ['src/lib/map/maplibre/**/*.{ts,tsx}'],
    [noApp, noFeatures, noShared],
  ),
  // zod の brand で作った型は、as で書き換えると範囲の確認を飛ばせてしまうので、parse / safeParse で作らせる。
  // brand で型を足したら、名前をここにも足す
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            ':matches(TSAsExpression, TSTypeAssertion) > TSTypeReference.typeAnnotation[typeName.name=/^(Longitude|Latitude|LngLat)$/]',
          message:
            'brand で作った型は as で作れません。スキーマの parse / safeParse で作ってください（docs/coding-conventions.md「型」）。',
        },
      ],
    },
  },
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'src/app/router/routeTree.gen.ts',
    ],
  },
]
