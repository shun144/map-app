# 地図ビューア

React + TanStack Router / Query + Zustand + MapLibre GL JS で作る、Bulletproof React 構成（feature 単位のフォルダ分割）の学習用地図アプリ。

- ベースマップ（地理院タイル 3 種 / OpenStreetMap）の切り替え
- オーバーレイ（駅・路線・公園のサンプル GeoJSON）の表示切り替え・不透明度・重なり順
- 地物クリックで属性を表示
- 保存ボタンでビューポートとレイヤー構成を IndexedDB に保存し、次回起動時に復元

用語は [GLOSSARY.md](./GLOSSARY.md)、設計判断は [docs/adr/](./docs/adr/)、コードの書き方は [docs/coding-conventions.md](./docs/coding-conventions.md) を参照。

## コマンド

| コマンド                  | 内容                                                    |
| ------------------------- | ------------------------------------------------------- |
| `npm run dev`             | 開発サーバー（http://localhost:3000）                   |
| `npm run build`           | 本番ビルド                                              |
| `npm test`                | テスト（Vitest）                                        |
| `npm run typecheck`       | 型チェック                                              |
| `npm run lint`            | ESLint（依存ルールの検査を含む）                        |
| `npm run generate-routes` | ルートツリーの手動生成（通常は dev サーバーが自動生成） |

## 状態の置き場所

| 状態                                               | 置き場所                                                          | 正の持ち主           | IndexedDB へ               |
| -------------------------------------------------- | ----------------------------------------------------------------- | -------------------- | -------------------------- |
| 地図インスタンス                                   | `MapProvider`（`lib/map`）。`MapController` だけを配る            | —                    | 保存しない                 |
| ビューポート                                       | 地図インスタンス（キャッシュ `['viewport', mapId]` は保存した値） | **地図インスタンス** | 保存ボタンを押したときだけ |
| レイヤー構成（ベースマップ＋オーバーレイ表示設定） | TanStack Query `['layers', mapId]`                                | **キャッシュ**       | 保存ボタンを押したときだけ |
| 選択中の地物・パネル開閉                           | Zustand（`features/map-viewer/stores/`）                          | ストア               | 保存しない                 |

レイヤー構成はキャッシュが操作中の最新状態を持つ。ビューポートは地図が持ち、地図を動かしてもキャッシュは書き換えない。IndexedDB は「最後に保存した状態」を持つ。保存せずにリロードすると、最後に保存した状態に戻る（[ADR 0003](./docs/adr/0003-save-only-on-explicit-action.md)）。

## データの流れ

```
                  loader: ensureQueryData
  IndexedDB ─────────────────────────▶ TanStack Query キャッシュ
      ▲                                  │ ['viewport']  初期表示のみ ─▶ MapCanvas ─生成─▶ MapController ◀─ MapLibre アダプタ ─▶ maplibre-gl
      │                                  │ ['layers'] ── useLayerSync（差分）──────────────▶     │  ▲
      │                                  ▲                                                       │  │ getViewport
      │                                  └── useUpdateLayerState ◀── LayerPanel                  │  │
      │                                                                                          │  │
      └──── useSaveMapState（渡された値を保存するだけ）◀── 保存ボタン（地図とキャッシュから値を集める）─┘
                                                                    onFeatureClick ─▶ Zustand（選択中の地物）
```

- **ビューポート：地図だけが持つ**（[ADR 0001](./docs/adr/0001-map-instance-is-source-of-truth-during-interaction.md)）
  地図を動かしてもキャッシュは書き換えない。必要なとき（保存ボタン）に `MapController.getViewport()` で読む。アプリ側から地図を動かすのは「初期位置に戻る」のような明示的な操作だけ（`useMoveToViewport`）。
- **レイヤー：キャッシュ → 地図**
  パネル操作はキャッシュだけを書き換え、`useLayerSync` が前回反映分との差分だけを `MapController` に適用する。
- **保存：IndexedDB へ**（[ADR 0003](./docs/adr/0003-save-only-on-explicit-action.md)）
  保存ボタンを押すと、地図から読んだビューポートとキャッシュのレイヤー構成を、1つのレコードとして1回で書く（片方だけ保存される状態を作らない）。成功したらキャッシュのビューポートも保存した値に合わせる。
- **起動時**
  `main.tsx` で Repository を用意 → ルートの `loader` が `ensureQueryData` で保存データを読み終えてから描画 → `MapCanvas` が保存済みビューポートで地図を生成する（初期位置からのちらつきがない）。

## フォルダ構成

```
src/
├── main.tsx                 起動処理（QueryClient・Repository・Router を作って描画）
├── app/                     ── app 層：組み立て役
│   ├── provider.tsx         Provider の合成。地図ライブラリと保存先の差し替え口
│   ├── repositories.ts      保存先の選択（IndexedDB / 使えなければメモリ）
│   ├── router.tsx           ルーター生成。loader 用の context（queryClient, repositories）
│   ├── routeTree.gen.ts     自動生成（編集しない）
│   ├── pages/               画面。feature の部品を並べて配線する
│   └── routes/              ファイルベースルーティング。URL と画面の対応・loader だけを持つ
├── features/                ── features 層：機能ごとに独立。互いに import しない
│   └── map-viewer/          地図ビューア（ビューポート・レイヤー・地物情報・保存）
├── lib/                     ── shared 層：features から使われる。features を知らない
│   ├── map/                 MapController（地図操作の窓口）・MapProvider・MapCanvas
│   │   ├── maplibre/        MapLibre アダプタ（maplibre-gl を import できる唯一の場所）
│   │   └── testing/         テスト用の FakeMapController
│   ├── db/                  IndexedDB の接続とスキーマ
│   └── query-client.ts
└── config/                  アプリ全体の定数（地図 ID）
```

feature の中は役割ごとに分ける（使わないフォルダは作らない）。

```
features/map-viewer/
├── types.ts        レイヤー構成の型
├── api/            Repository（インターフェース・IndexedDB 実装・メモリ実装・Provider）、クエリ、保存
├── config/         ベースマップ・オーバーレイカタログ・初期ビューポート
├── logic/          純粋関数（合わせ込み・操作・差分計算）。テストの主対象
├── hooks/          地図との同期・移動・地物の選択
├── stores/         Zustand（保存しない UI 状態）
└── components/     レイヤーパネル・保存ボタン・地物情報パネル・初期位置に戻るボタン
```

## 依存ルール

```
lib / config（shared）  ──▶  features  ──▶  app
```

矢印の向きにだけ import できる。`npm run lint` で機械的に検査する（`eslint.config.js`）。

| ルール                                                      | 理由                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `maplibre-gl` を import できるのは `lib/map/maplibre/` だけ | 地図ライブラリを差し替え可能にする（[ADR 0002](./docs/adr/0002-hide-map-library-behind-map-controller.md)） |
| features 同士は import しない                               | feature を独立に足し引きできるようにする                                                                    |
| lib / config は features・app を import しない              | shared 層を特定機能に依存させない                                                                           |

バレルファイル（`index.ts` で re-export をまとめるファイル）は使わず、実体のファイルを直接 import する。Vite のツリーシェイキングと開発サーバーの速度を落とさないため（Bulletproof React の現行の推奨とも同じ）。

地図インスタンスを feature ではなく `lib/map` に置いているのは、将来 feature が増えても同じ地図を共有できるようにするため。

## 差し替え方

### 保存先を替える（例：サーバー API）

1. `features/map-viewer/api/map-state-repository.ts` のインターフェース（`MapStateRepository`）を満たす実装を `api/` に追加する
2. `app/repositories.ts` で使う実装を切り替える

クエリ・保存処理・UI は Repository のインターフェースにしか依存していないので変更不要。

### 地図ライブラリを替える（例：Leaflet）

1. `lib/map/leaflet/` に `MapFactory` 型の関数（`MapController` の実装）を作る
2. `app/provider.tsx` の `createMap={createMapLibreMap}` を差し替える
3. ESLint の `maplibreOnlyInAdapter` を新しいライブラリ用に書き換える

features は `MapController` にしか依存していないので変更不要。`lib/map/testing/fake-map-controller.tsx` は実装の参考になる最小の `MapController`。

### feature を追加・削除する

- **追加**：`features/<name>/` を作り、中のファイルを `app/pages` から直接 import して使う（loader が必要ならクエリを `app/routes` からも使う）。保存が必要なら `lib/db/database.ts` にオブジェクトストアを足し、DB_VERSION を上げる
- **削除**：`features/<name>/` を消し、`app/` 内の参照を消す。状態（Zustand ストア・Repository）も feature 内にあるので残骸は残らない

## 保存データの扱い

- 保存データには `schemaVersion` を持たせ、版が違う・形が壊れているものは読み込み時に捨ててデフォルト値を使う
- レイヤー構成は読み込み時にカタログと合わせ込む（カタログから消えたオーバーレイは捨て、増えたものは非表示で最上位に足す）
- IndexedDB が使えない環境（プライベートブラウズなど）ではメモリ保存に切り替わる（リロードで消える）

## テスト

| 対象                               | 方法                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `logic/` の純粋関数                | そのまま呼んで結果を比較                                                                               |
| Repository                         | `fake-indexeddb` で Node 上に IndexedDB を再現                                                         |
| 保存処理（`useSaveMapState`）      | 渡した値がメモリ実装の Repository に書かれ、成功時だけキャッシュのビューポートが変わることを確認       |
| 保存ボタン（`SaveMapStateButton`） | 押した時点の地図のビューポートとキャッシュのレイヤー構成を渡すこと、地図ができるまで押せないことを確認 |
| 同期フック（`useLayerSync`）       | `FakeMapController` を `FakeMapProvider` で渡し、地図への呼び出しを記録して検証                        |

同期フックのテストに本物の地図がいらないのは、地図ライブラリを `MapController` の裏に隠しているため。

## 開発ツール

画面左下の TanStack Devtools から、Router と Query（キャッシュの中身）のパネルを開ける。レイヤーを操作すると `['layers', 'default']` が即座に変わり、`['viewport', 'default']` と IndexedDB の中身は保存ボタンを押すまで変わらないことを確認できる（IndexedDB はブラウザの開発者ツールの Application タブで見られる）。

## サンプルデータ

`public/data/*.geojson` の座標は手書きの概略で、実際の位置とはずれる。
