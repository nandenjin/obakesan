<script setup lang="ts">
  import pkg from "../../package.json"
  </script>

# クイックスタート

## インストール

Windows, macOS, Linux で利用できます。

- バージョン {{ pkg.version }}
  - <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-win.exe`">Windows（インストーラー）</a>
  - <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-mac.dmg`">macOS (.dmg)</a>
  - <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-linux.AppImage`">
        Linux (AppImage)
      </a>
    </li>
    <li>
      <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-linux.deb`">
        Linux (Debian/.deb)
      </a>
    </li>
    <li>
      <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-linux.snap`">
        Linux (Snap)
      </a>

その他のバージョンは、[ダウンロードページ](./download.md)から取得できます。

## 主な機能

### DMX データの監視

リアルタイムで DMX チャンネルの値を確認できます。

### プロトコル変換

受信した信号を任意の出力インターフェースに転送し、簡易なプロトコル変換器として使用することができます。

## 対応インターフェース

現在は以下のインターフェース（プロトコル）に対応しています。

- [Art-Net](./interfaces/artnet) - ネットワークベースのDMXプロトコル
- [信号ジェネレータ](./interfaces/signal) - 数学的な波形でテスト信号を生成
- [FTDI USB DMX](./interfaces/ftdi)（出力のみ）- USB DMXインターフェース
