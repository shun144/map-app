# コーディング規約

このプロジェクトでコードを書くときのルール。設計判断の理由は [docs/adr/](./adr/)、用語は [GLOSSARY.md](../GLOSSARY.md) を参照。

## 責務

### 1つの関数・フックは、名前が表す仕事だけをする

名前に書いていない仕事（前提条件の確認、値の組み立て、別のデータの取得）を中に持ち込まない。それらは呼び出す側の責務にする。

```ts
// NG: 「保存する」フックが、地図の有無の確認と保存する値の組み立てまでしている
mutationFn: async () => {
  if (!mapController) throw new Error('地図がない')
  const viewport = mapController.getViewport()
  await repository.save(mapId, { viewport, layerState })
}

// OK: 保存するフックは、渡された値を保存するだけ
mutationFn: (savedMapState: SavedMapState) =>
  repository.save(mapId, savedMapState)
```

- 必要な値は引数で受け取る。フックの中で取りに行かない
- 前提が満たされないときの扱いは、利用者に見える場所（UI）で決める。例: 地図ができるまで保存ボタンを押せなくする（`src/features/map-viewer/components/save-map-state-button.tsx`）

## 命名

### 汎用的な名前を付けない

`state`・`data`・`value`・`controller`・`next`・`s` のような、何を指すか読み手が推測しないといけない名前は使わない。

| NG           | OK                      |
| ------------ | ----------------------- |
| `state`      | `layerState`            |
| `controller` | `mapController`         |
| `diff`       | `layerStateDiff`        |
| `applied`    | `lastAppliedLayerState` |
| `(s) => ...` | `(current) => ...`      |

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
| 依存の向きは `lib` / `config` → `features` → `app` の一方向                                              | ESLint   |
| features 同士は import しない                                                                            | ESLint   |
| `maplibre-gl` を import できるのは `src/lib/map/maplibre/` だけ                                          | ESLint   |
| バレルファイル（`index.ts` で re-export をまとめるファイル）を作らない。実体のファイルを直接 import する | レビュー |

`npm run lint` で検査できるものは、lint が通ることを確認してからコミットする。

## テスト

- 地図を使うフック・コンポーネントは、本物の地図ではなく `FakeMapController`（`src/lib/map/testing/fake-map-controller.tsx`）で検証する
- Testing Library で描画するテストには `afterEach(cleanup)` を書く。Vitest のグローバル関数を有効にしていないため、自動の後片付けが働かない
- TanStack Query のキャッシュ変更の通知は `setTimeout(0)` で遅れて届く。キャッシュを変えた直後の再描画を確かめるときは `waitFor` で待つ
