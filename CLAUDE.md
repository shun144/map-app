# CLAUDE.md

## 必ず従うこと

- コードを書く・直すときは [docs/coding-conventions.md](./docs/coding-conventions.md) に従う。既存コードを触ったときも、近くの規約違反（汎用的な変数名、what だけのコメントなど）は合わせて直す
- 用語は [GLOSSARY.md](./GLOSSARY.md) の語を使う。新しい用語が確定したら GLOSSARY.md に追記する
- 設計を変えるときは [docs/adr/](./docs/adr/) の該当 ADR を確認し、判断が変わるなら ADR を更新する

## 完了前の確認

変更を終えたと報告する前に、次がすべて通ることを確認する。

```bash
npx tsc --noEmit
npm run lint
npm test
```

画面の見た目や地図の描画に関わる変更は、型チェックとテストだけでは確認できない。ブラウザで確認していない場合は、そのことを報告に書く。
