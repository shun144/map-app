# コーディング規約

このプロジェクトでコードを書くときのルール。設計判断の理由は [docs/adr/](./adr/)、用語は [GLOSSARY.md](../GLOSSARY.md) を参照。

## feature の分け方

### 互いに直接依存する必要がない機能は、別の feature に分ける

同じ画面に並ぶ、同じ地図を使う、といった理由だけでは同じ feature にしない。判断の基準は「片方の仕事が、もう片方のコードを使わずに成り立つか」。成り立つなら別の feature にする。

| 例                                                                  | 判断     | 理由                                                                           |
| ------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| map-viewer（表示状態の保存・復元）と feature-info（地物の情報表示） | 分ける   | 地物の情報表示は、ビューポートやレイヤー構成の保存・復元を使わずに成り立つ     |
| map-viewer と reset-view（初期位置に戻る）                          | 分ける   | 地図を初期位置へ動かすだけで、保存・復元もレイヤーも使わない                   |
| map-viewer（地図への反映）と layer-panel（レイヤーパネル）          | 分ける   | どちらも shared/map のレイヤー構成を読み書きするだけで、互いのコードを使わない |
| ビューポートとレイヤー構成                                          | 分けない | 保存ボタンで両方を1つのレコードとして保存するため、片方だけでは成り立たない    |

- 2つの機能が同じものを使うときは、それを下の層に置き、両方がそこに依存する形にする。feature 同士を import でつながない

  | 置くもの                                | 置き場所 | 例                               |
  | --------------------------------------- | -------- | -------------------------------- |
  | ライブラリを包む部品                    | `lib`    | MapController・MapLibre アダプタ |
  | アプリ全体の設定                        | `config` | 地図 ID・初期ビューポート        |
  | 複数の feature が使う業務の状態・データ | `shared` | レイヤー構成・カタログ・保存先   |

- 2つの機能を組み合わせるのは `app/pages`（画面）の仕事にする。ある feature の部品を別の feature の UI の中に置きたいときは、受け取る側が `children` などの枠を用意し、画面が差し込む（例: レイヤーパネルの中の保存ボタン）
- 分けたあとに片方を消しても、もう片方がそのまま動くことを確認の目安にする

## 責務

### 1つの関数・フックは、名前が表す仕事だけをする

名前に書いていない仕事（前提条件の確認、値の組み立て、別のデータの取得）を中に持ち込まない。それらは呼び出す側の責務にする。

```ts
// NG: 「保存する」フックが、地図の有無の確認と保存する値の組み立てまでしている
mutationFn: async () => {
  if (!mapController) throw new Error('地図がない')
  const viewport = mapController.getViewport()
  await repository.save(mapId, { viewport, layers: layersState })
}

// OK: 保存するフックは、渡された値を保存するだけ
mutationFn: (mapSnapshot: MapSnapshot) => repository.save(mapId, mapSnapshot)
```

- 必要な値は引数で受け取る。フックの中で取りに行かない
- 前提が満たされないときの扱いは、利用者に見える場所（UI）で決める。例: 地図ができるまで保存ボタンを押せなくする（`src/features/map-viewer/components/save-map-snapshot-button.tsx`）

## 命名

### 汎用的な名前を付けない

`state`・`data`・`value`・`controller`・`next`・`s` のような、何を指すか読み手が推測しないといけない名前は使わない。

| NG           | OK                    |
| ------------ | --------------------- |
| `state`      | `layersState`         |
| `controller` | `mapController`       |
| `setting`    | `overlayerSetting`    |
| `definition` | `overlayerDefinition` |
| `diff`       | `layersChanges`       |
| `applied`    | `lastDrawnLayers`     |
| `(s) => ...` | `(current) => ...`    |

### 名前は長くてもよいので、役割と処理内容が分かるものにする

名前の短さより、名前だけを読んで「何をするか」「何を表すか」が分かることを優先する。本体を読まないと処理内容が分からない名前は付けない。曖昧な名前は読み手の誤解を生み、誤解した前提で設計の議論が進んでしまうため。

- 関数名は「動詞＋対象」で書き、動詞は実際に起きることを具体的に表すものを選ぶ。どこに書くか・何を作るかまで名前に入れてよい
- 確認の目安：名前だけを見て、引数と戻り値と副作用（キャッシュ・地図・保存先のどれが変わるか）を言い当てられるか。言い当てられないなら名前を変える

次の動詞は、何が起きるかを特定できないので使わない。

| 使わない動詞              | 理由                                             | このプロジェクトでの言い換え                              |
| ------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| `select`                  | 利用者の行為なのか、値の読み出しなのか分からない | `updateBaseLayer`、`setSelectedFeature`                   |
| `apply`                   | 何に何を当てはめるのか分からない                 | `writeChangedLayersStateToCache`                          |
| `update`（対象なし）      | 何を書き換えるのか分からない                     | `updateOverlayerAppearance`、`writeLayersStateToCache`    |
| `sync`                    | どちらからどちらへ、何をするのか分からない       | `useDrawLayersStateOnMap`                                 |
| `reconcile`・`diff`       | 結果として何を返すのか分からない                 | `createLayersMatchingCatalog`、`findChangesBetweenLayers` |
| `toggle`（対象なし）      | 何を切り替えるのか分からない                     | `switchBetweenOpenAndClosed`                              |
| `handle`・`process`・`do` | 何をするのかを何も表していない                   | 実際の処理を表す動詞にする                                |

書き込み先ごとに動詞をそろえる。非破壊的更新とは、元のオブジェクトを書き換えず、更新した結果を新しいオブジェクトとして返すこと。`copy`（複製が目的に読める）や `create`（無から作るように読める）は使わない。名前だけでは非破壊的更新だと分からないので、そのことはファイル冒頭のコメントに書く。

| 処理                                         | 名前の形                                                     | 例                                                     |
| -------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| 新しいオブジェクトとして非破壊的更新をする   | `update〜`（元の値を引数で受け取り、新しい値を戻り値で返す） | `updateOverlayerOpacity(layers, overlayerId, opacity)` |
| TanStack Query のキャッシュを書き換える      | `write〜ToCache`                                             | `writeLayersStateToCache`                              |
| 地図に描く・地図を動かす                     | `draw〜OnMap`・`moveMapTo〜`                                 | `useDrawLayersStateOnMap`、`useMoveMapToViewport`      |
| 保存先に保存する                             | `save〜`                                                     | `saveCurrentMapSnapshot`                               |
| 実在するもの（地図・ストア）の値を書き換える | `set〜`・`add〜`・`remove〜`                                 | `mapController.setBaseLayer`、`setSelectedFeature`     |

### 複数のものをまとめた値は、名前でも複数だと分かるようにする

修飾する語を単数形にする英語の慣習（`layer state`、`user list`）より、読み手が誤読しないことを優先する。単数形の修飾語だと「1つ分の状態」と読めてしまい、1つ分を表す別の型（例: `OverlayerSetting`）と取り違えやすい。

| NG           | OK            | 中身                                                   |
| ------------ | ------------- | ------------------------------------------------------ |
| `Layer`      | `Layers`      | ベースレイヤーの選択と、全オーバーレイヤーの設定（型） |
| `layerState` | `layersState` | キャッシュにある、そのレイヤー構成（状態の変数）       |

- 1つ分を表すものは単数形のままにする（例: `OverlayerSetting`、`overlayerSetting`）
- 保存データのプロパティ名も同じ規則に従う。保存データのプロパティ名を変えるときは、保存先の版番号を上げる（ADR 0004）

### `State` は、Zustand か TanStack Query が管理する状態の変数名にだけ使う

`State` という語は「アプリが管理していて、時間とともに変わる値」を指す。ただの型・interface・関数の引数・保存データに使うと、それが管理された状態なのか、ただの値なのか区別がつかなくなる。

| 使ってよい                                                                   | 例                                                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Zustand のストアや TanStack Query のキャッシュから取り出した値を入れる変数   | `const layersState = useLayersState(mapId)`                            |
| その状態を読み書きするフック・関数（名前が指しているのが状態そのもののとき） | `useLayersState`、`writeLayersStateToCache`、`useDrawLayersStateOnMap` |

| 使わない                   | NG                                    | OK                                     |
| -------------------------- | ------------------------------------- | -------------------------------------- |
| 型・interface              | `LayersState`                         | `Layers`                               |
| 保存データの型・リポジトリ | `SavedMapState`、`MapStateRepository` | `MapSnapshot`、`MapSnapshotRepository` |
| 純粋関数の引数・戻り値     | `(layersState: LayersState)`          | `(layers: Layers)`                     |
| 保存データのプロパティ     | `{ viewport, layersState }`           | `{ viewport, layers }`                 |

- 状態の変数を、状態ではない場所（保存データ・純粋関数の引数）へ渡すときは、受け取る側の名前で渡す（例: `{ layers: layersState }`）

### 名前を付け替えない

受け取った値を、途中で別の名前に変えて渡し直さない。同じものはどこでも同じ名前で呼ぶ。

```ts
// NG: setter を registerController という別名で Context に載せる
const [controller, setController] = useState(...)
const value = { controller, registerController: setController }

// OK: useState の名前のまま載せる
const [mapController, setMapController] = useState(...)
const value = { mapController, setMapController }
```

### 同じ操作には同じ言葉を使う

コメントやドキュメントで、同じ操作を別の言葉で書かない。例: キャッシュの値を `setQueryData` で置き換える操作は「キャッシュを書き換える」に統一し、「写す」「反映する」と混在させない。

### コンポーネントの props の型は `Props`

型はファイルの中だけで使うので、コンポーネント名を繰り返さない。

## コメント

### 書くのは「なぜ」だけ

コードを読めば分かる「何をしているか」は書かない。書くのは、コードからは読み取れない理由・捨てた代替案・守っている制約・壊すと何が起きるか。理由がなければコメント自体を書かない。

```ts
// NG: コードの言い換え
// 同じ Repository を React（Provider）とルーター（loader）の両方に渡す

// OK: なぜそうしたか
// loader は React の外で動き Context を読めないため、ルーター経由でも渡す。
// 同じインスタンスにするのは、loader が読む保存先と mutation が書く保存先を食い違わせないため
```

型だけでは伝わらない約束事（`null` の意味、配列の並び順、値の範囲）は書いてよい。

## import と依存

| ルール                                                                                                   | 検査     |
| -------------------------------------------------------------------------------------------------------- | -------- |
| 依存の向きは `lib` / `config` → `shared` → `features` → `app` の一方向                                   | ESLint   |
| features 同士は import しない                                                                            | ESLint   |
| `maplibre-gl` を import できるのは `src/lib/map/maplibre/` だけ                                          | ESLint   |
| バレルファイル（`index.ts` で re-export をまとめるファイル）を作らない。実体のファイルを直接 import する | レビュー |

`npm run lint` で検査できるものは、lint が通ることを確認してからコミットする。

## テスト

現在はテストコードを置いていない（2026-11-22 時点）。設計と命名を変えるたびにテストを書き直すコストを避けるため。修正のたびにテストを書き足したり書き直したりしない。テストを再開するときは次に従う。

- Testing Library で描画するテストには `afterEach(cleanup)` を書く。Vitest のグローバル関数を有効にしていないため、自動の後片付けが働かない
- TanStack Query のキャッシュ変更の通知は `setTimeout(0)` で遅れて届く。キャッシュを変えた直後の再描画を確かめるときは `waitFor` で待つ
