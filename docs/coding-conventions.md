# コーディング規約

設計判断の理由は [docs/adr/](./adr/)、用語は [GLOSSARY.md](../GLOSSARY.md) を参照。

## feature の分け方

- 片方の仕事が、もう片方のコードを使わずに成り立つなら別の feature にする。同じ画面に並ぶ・同じ地図を使うだけでは同じ feature にしない（例: map-viewer と feature-info は分ける。保存ボタンで1レコードにするビューポートとレイヤー構成は分けない）
- 2つの feature が同じものを使うときは下の層に置く（ライブラリを包む部品は `lib`、アプリ全体の設定は `config`、複数の feature が使う状態・データは `shared`）
- feature 同士の組み合わせは `app/pages`（画面）で行う。ほかの feature の部品を UI に入れたいときは、受け取る側が `children` などの枠を用意し、画面が差し込む
- 片方を消しても、もう片方がそのまま動くことを確認の目安にする

## 責務

1つの関数・フックは、名前が表す仕事だけをする。前提条件の確認・値の組み立て・別のデータの取得は呼び出す側に任せ、必要な値は引数で受け取る。前提が満たされないときの扱いは UI で決める（例: 地図ができるまで保存ボタンを押せなくする）。

```ts
// NG: 保存するフックが、地図の有無の確認と値の組み立てまでしている
mutationFn: async () => {
  if (!mapController) throw new Error('地図がない')
  await repository.save(mapId, {
    viewport: mapController.getViewport(),
    layers: layersState,
  })
}
// OK: 渡された値を保存するだけ
mutationFn: (mapSnapshot: MapSnapshot) => repository.save(mapId, mapSnapshot)
```

## 命名

名前だけを読んで、何をするか・何を表すか（引数・戻り値・キャッシュや地図や保存先のどれが変わるか）が分かるようにする。長くてよい。

- 汎用的な語だけの名前にしない（`state`・`data`・`value`・`controller`・`handler`・`select`・`apply`・`sync`・`diff`・`s` など）。対象を表す語と組み合わせて意味が特定できればよい（`layersState`・`mapController`・`handleFeatureClick`・`findChangesBetweenLayers`）
- 関数名は「動詞＋対象」。動詞は処理ごとにそろえる

  | 処理                                                             | 動詞                         | 例                                                     |
  | ---------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------ |
  | 非破壊的更新（元の値を書き換えず、新しい値を返す）               | `update〜`                   | `updateOverlayerOpacity(layers, overlayerId, opacity)` |
  | TanStack Query のキャッシュを書き換える                          | `write〜ToCache`             | `writeLayersStateToCache`                              |
  | 地図に描く・地図を動かす                                         | `draw〜OnMap`・`moveMapTo〜` | `drawAllLayersOnMap`、`useMoveMapToViewport`           |
  | 保存先に保存する                                                 | `save〜`                     | `saveCurrentMapSnapshot`                               |
  | 実在するもの（地図・ストア）の値を変える                         | `set〜`・`add〜`・`remove〜` | `mapController.setBaseLayer`                           |
  | 必ずある値を取り出す                                             | `get〜`                      | `getBaseLayer`                                         |
  | 見つからないことがある値を探す（`undefined`・`null` を返しうる） | `find〜`                     | `findOverlayerDefinition`                              |

- 複数のものをまとめた値は、修飾語も複数形にする（`Layers`、`layersState`）。単数形は1つ分を表すもの（`OverlayerAppearance`）と取り違えるため
- `State` は、Zustand・TanStack Query が管理する状態を入れる変数と、それを読み書きするフック・関数にだけ使う（`layersState`、`useLayersState`）。型・保存データ・純粋関数の引数には使わず、渡すときは受け取る側の名前にする（`{ layers: layersState }`）
- 同じものはどこでも同じ名前で呼ぶ。途中で別名に付け替えない（`setMapController` を `registerController` として渡さない）。コメントでも、同じ操作は同じ言葉で書く
- コンポーネントの props の型は `Props`
- 保存データのプロパティ名を変えるときは、保存先の版番号を上げる（ADR 0004）

## 条件分岐

- `&&`・`||` で複数の比較をつなぐ条件は、`is`・`has` で始まる肯定形の名前の定数に入れてから使う
- 条件を満たさないときは `return`・`continue`・`break` で先に抜け、本来の処理を `if` の中に入れない。`else if` を重ねない（JSX の中の条件付き表示は除く）
- 条件は肯定形を優先する。どちらの場合にも処理があるときは肯定形の側を `if` に書く。値が見つからないときに抜けるだけの確認（`if (!overlayerDefinition) continue`）は否定形でよい

```ts
const isMapInfoUpdated =
  queryCacheEvent.type === 'updated' &&
  queryCacheEvent.query.queryHash === hashKey(mapInfoQueryKey(mapId))
if (!isMapInfoUpdated) return
```

## 型

経度・緯度のように、ただの `number`・`string` では範囲外の値や取り違えを防げない値は、zod の `.brand()` で型を分ける（例: `src/lib/map/lng-lat.ts`）。plain object のまま state・保存先・URL に入れられるよう、クラスにはしない。

- スキーマと型は同じ名前で export し、モジュールの一番外で定義する
- 値は `parse`・`safeParse` で作る。アプリの外から来る値（URL・保存先・地図ライブラリ）は必ず通す
- `as` で brand の型に書き換えない（ESLint で検査。brand の型を足したら `eslint.config.js` の型名の一覧にも足す）

## コメント

- 書くのは「なぜ」だけ（コードから読み取れない理由・捨てた代替案・守っている制約・壊すと何が起きるか）。コードの言い換えは書かない。型で伝わらない約束事（`null` の意味、配列の並び順、値の範囲）は書いてよい
- 主語・述語・目的語を省かない
- 「合わせる」「処理する」「対応する」「反映する」「整える」のような抽象的な言葉を使わず、何をどこからどこへどう変えるかを書く

```ts
// NG: キャッシュのビューポートは「保存した値」を表すので、保存できたときだけ合わせる
// OK: キャッシュのビューポートは、最後に保存したビューポートを表す。
//     そのため、保存先への保存が成功したときだけ、キャッシュのビューポートを保存したビューポートで書き換える
```

## import と依存

- 依存の向きは `lib` / `config` → `shared` → `features` → `app` の一方向（ESLint で検査）
- features 同士は import しない（ESLint で検査）
- `maplibre-gl` を import できるのは `src/lib/map/maplibre/` だけ（ESLint で検査）
- バレルファイル（`index.ts` で re-export をまとめるファイル）を作らず、実体のファイルを直接 import する
- lint が通ることを確認してからコミットする

## テスト

現在はテストコードを置いていない（2026-11-22 時点）。設計と命名を変えるたびに書き直すコストを避けるため、修正のたびにテストを書き足さない。再開するときは次に従う。

- Testing Library で描画するテストには `afterEach(cleanup)` を書く（Vitest のグローバル関数を有効にしていないため）
- TanStack Query のキャッシュ変更の通知は `setTimeout(0)` で遅れて届くので、直後の再描画は `waitFor` で待つ
