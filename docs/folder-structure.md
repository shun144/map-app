# フォルダ構成

Bulletproof React の構成をもとにしている。依存の向きは `value-objects` → `lib` / `config` → `shared` → `features` → `app` の一方向で、下の層は上の層を import できない（ESLint で検査）。書き方のルールは [coding-conventions.md](./coding-conventions.md) を参照。

```
src/
  main.tsx          起動処理
  styles.css
  value-objects/    値オブジェクト
  lib/              ライブラリを包む部品
  config/           アプリ全体の設定値
  shared/           複数の feature が使う業務の部品
  features/         機能ごとのまとまり
  app/              画面・ルーティング・組み立て
public/
  data/             オーバーレイヤーのサンプルデータ（GeoJSON）
```

## value-objects

範囲や意味が決まった値を、zod の brand で型にしたもの（例: `lng-lat.ts` の経度・緯度）。どの層からも使う、いちばん下の層。ほかのフォルダを import しない。

## lib

外部ライブラリを、このアプリ向けの設定で包んだ部品。業務（物件・レイヤー構成など）の知識を持たない。別の地図アプリにそのまま持っていけるものだけを置く。

| 場所                  | 置くもの                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| `lib/query-client.ts` | TanStack Query の設定                                                       |
| `lib/map/`            | 地図を操作する窓口（`MapController`）、`MapProvider`、`MapCanvas`、地図の型 |
| `lib/map/maplibre/`   | MapLibre を使う実装。`maplibre-gl` を import できるのはここだけ（ADR 0002） |

## config

アプリ全体で使う固定の設定値（地図 ID、初期ビューポート、物件の地図のズームなど）。

## shared

複数の feature が使う、このアプリの業務の部品。業務のまとまりごとにフォルダを分ける（今は `map/` だけ）。

| 場所                            | 置くもの                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `shared/map/types.ts`           | レイヤー構成などの業務の型                                                                            |
| `shared/map/api/`               | 地図情報・物件の取得（TanStack Query のクエリ）、キャッシュの書き換え、レイヤー構成を更新する純粋関数 |
| `shared/map/catalog/`           | ベースレイヤーとオーバーレイヤーの一覧（カタログ）                                                    |
| `shared/map/draw/`              | レイヤー構成を `MapController` で地図に描く関数                                                       |
| `shared/map/storage/`           | 保存先のインターフェース（Repository）と、その Context                                                |
| `shared/map/storage/indexeddb/` | IndexedDB を使う保存先の実装（仮の保存先。ADR 0004）                                                  |

## features

機能ごとのまとまり。片方を消しても、もう片方が動くように分ける。feature 同士は import しない。

各 feature の中は、ファイルの種類でフォルダを分ける。必要なフォルダだけ作る。

| フォルダ      | 置くもの                                                   |
| ------------- | ---------------------------------------------------------- |
| `components/` | その機能の UI                                              |
| `hooks/`      | その機能のフック（地図のイベントの購読、地図への描画など） |
| `api/`        | その機能の mutation（保存・作成）                          |
| `stores/`     | その機能だけが使う Zustand のストア                        |
| `logic/`      | その機能の純粋関数                                         |

| feature               | 機能                                                           |
| --------------------- | -------------------------------------------------------------- |
| `map-viewer`          | レイヤー構成を地図に描く、ビューポートとレイヤー構成を保存する |
| `layer-panel`         | レイヤーパネル                                                 |
| `feature-info`        | クリックした地物の情報を出す                                   |
| `reset-view`          | 保存した位置に戻る                                             |
| `map-context-menu`    | 右クリックのメニュー                                           |
| `estate-layer`        | 物件ポイントを描く、物件ポイントのクリックで物件詳細画面を開く |
| `estate-create`       | 物件の新規作成フォーム                                         |
| `estate-location-map` | 物件の位置を示す小さな地図                                     |

## app

アプリの最上位の層。feature を組み合わせて画面を作り、ルーティングと起動時の組み立てを行う。

| 場所                | 置くもの                                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/pages/`        | 画面だけ。feature を組み合わせる                                                                                                                                        |
| `app/routes/`       | URL ごとのルート定義（TanStack Router のファイルベースルーティング）。loader と `validateSearch` を書き、`component` に画面を渡す。ルート定義ではないファイルを置かない |
| `app/router/`       | ルーターの作成、自動生成のルート一覧（`routeTree.gen.ts`）、URL の検索パラメータの読み取り                                                                              |
| `app/providers/`    | React の Provider（アプリ全体用と、画面ごとに置く地図用）                                                                                                               |
| `app/repositories/` | どの保存先を使うかを決めて作る（保存先を選ぶ唯一の場所。ADR 0004）                                                                                                      |

`app` の直下にはファイルを置かず、役割ごとのフォルダに入れる。
