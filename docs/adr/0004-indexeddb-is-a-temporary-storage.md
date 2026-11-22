# IndexedDB は本番の保存先が決まるまでの仮の保存先とする

地図の状態の保存先として IndexedDB を使っているが、これは本番の保存先（サーバー API など）が決まるまでのダミーで、いずれ差し替える。差し替えの手間を小さくするため、IndexedDB に関わるコードはすべて `src/shared/map/storage/indexeddb/` に閉じ込め、それ以外のコードは `MapSnapshotRepository` インターフェースにだけ依存させる。

## Consequences

- 保存先の種類を決めるのは `src/app/repositories.ts` の1か所だけ。差し替えるときは、新しい実装を作ってここを書き換え、`indexeddb/` フォルダを消す。
- 保存先が満たすべき振る舞いは `MapSnapshotRepository`（`src/shared/map/storage/map-snapshot-repository.ts`）の型とコメントで定義する。以前は契約テストで定義していたが、2026-11-22 にテストコードをいったんすべて削除したため、現在は契約テストはない。
- 版番号付きのレコード形式や、古い DB の移行は IndexedDB の都合なので、`indexeddb/` の外に出さない。保存先をまたいで共通なのは、読み込んだ値の検証（`isMapSnapshot`）だけ。
- IndexedDB の古い版のデータは、移し替えずに捨ててよい。仮の保存先で、失うのは最後に保存した表示状態だけのため。
