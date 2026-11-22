# 地図ライブラリを MapController の裏に隠す

features は地図ライブラリ（MapLibre GL JS）を直接 import せず、アプリ側で定義した MapController インターフェース経由でのみ地図を操作する。MapLibre 固有のコードは MapLibre アダプタに閉じ込める。将来 Leaflet などへ差し替える可能性を残すためである。

生の地図インスタンスを取り出す抜け道（`getNativeMap()` など）は意図的に用意しない。抜け道があると MapLibre 固有コードが features に漏れ、差し替え可能性が失われるため。MapController に足りない操作は、その都度 MapController へメソッドを追加して対応する。

## Consequences

- MapLibre の機能を使うたびに MapController の拡張が必要になり、直接呼ぶより手間がかかる。
- レイヤーの表現（ベースレイヤー・オーバーレイヤーの定義）はライブラリ非依存の型で持ち、アダプタが MapLibre のソース/レイヤーへ変換する。
