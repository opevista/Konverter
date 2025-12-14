# Konverter

Konverter は、メディアファイルの変換を目的とした Electron ベースのデスクトップアプリケーションです。

## 特長

* さまざまなメディアファイル形式の変換に対応しています。
* 直感的で使いやすいユーザーインターフェースを備えています。

## インストール

Konverter をインストールするには、[リリースページ](https://github.com/opevista/Konverter/releases) から最新の `.dmg`（macOS 用）または `.zip`（macOS 用）をダウンロードしてください。

## ソースからのビルド

ソースコードから Konverter をビルドする手順は以下のとおりです。

1. **リポジトリをクローンする**

   ```bash
   git clone https://github.com/opevista/Konverter.git
   cd Konverter
   ```

2. **electron ディレクトリへ移動する**

   ```bash
   cd electron
   ```

3. **依存関係をインストールする**

   ```bash
   npm install
   ```

4. **アプリケーションをパッケージ化する**

   ```bash
   npm run package
   ```

   これにより、`Package` ディレクトリ内に `.dmg` および `.zip` ファイルが生成されます。

## メディアファイルの推奨アプリケーション設定（macOS）

Konverter は macOS において、各種メディアファイルの「別の推奨アプリケーション」として表示されるよう設定されています。これにより、メディアファイルを右クリックし、「このアプリケーションで開く」から Konverter を選択できます。

この設定に必要な `Info.plist` の変更は、`electron/package.json` に定義された `postpackage` スクリプトによって、`npm run package` 実行時に自動的に適用されます。

## コントリビューション

コントリビューションは歓迎しています。Issue の作成、またはプルリクエストの送信をご検討ください。

## ライセンス

本プロジェクトは MIT ライセンスのもとで公開されています。
