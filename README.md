# HTTP　再送検証
## 目的
POSTリクエストが再送される条件を探って再現する
同様の現象が[stackoverflow](https://stackoverflow.com/questions/15155014/inconsistent-browser-retry-behaviour-for-timed-out-post-requests)で報告されていたため Express + 簡易HTMLで再現

## 関連しそうな資料
- https://blogs.oracle.com/ravello/beware-http-requests-automatic-retries
- https://tools.ietf.org/html/rfc2616#section-8.2.4 
  - [(訳文)](https://triple-underscore.github.io/rfc-others/RFC2616-ja.html#section-8.2.4)
- https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Expect
- https://blog.hashihei.com/2019/02/02/tcp%E3%81%AE%E5%86%8D%E9%80%81%E6%99%82%E9%96%93%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6/

## 起きてたこと
- HTTPは以下の条件を満たすとクライアントが再送を試みるようになっている（RFC 2616 8.2.4章に記述)
  - `Expect リクエストヘッダ`がない
  - サーバから何の応答も帰ってこない
  - クライアント <=> サーバのコネクションが切れる
- 基本ブラウザからのリクエストには`Expect リクエストヘッダ`はついていないらしい。curlはついているらしい
- 「応答を返さない」は、node + expressの場合はサーバの実装で`res.send()`などを一切記述していないエンドポイントにリクエストを飛ばすと出来る
- またコネクションが切断する要件としてはサーバがLinuxの場合、TCPの再送タイムアウトの最大値が120秒に設定されている（少なくとも実験環境に用いたCentOS7.7のカーネルでは）ため、2分でコネクションが切れる
  - https://github.com/torvalds/linux/blob/v3.10/include/net/tcp.h#L134
- 上記3つの事象が相まって「2分おきに」サーバ側にブラウザからのリクエストのログが残り続ける事象が発生すると考えられる

## 再現方法
このコードを適当なLinuxにデプロイし
```
docker build -t moja0316/node-web-app .
docker run --name node-web-app -p 3000:3000  moja0316/node-web-app
```
とかでいける

## 再現結果
1つのsleep requestに対し2分後に2つめのrequestをサーバ側で受信している
### ブラウザ
![スクリーンショット 2021-03-23 2 35 20](https://user-images.githubusercontent.com/45286006/112033268-98c42c00-8b80-11eb-845b-47eceae67fa0.png)
### サーバ
```bash
[root@apps browser_retry_test]# docker run --name node-web-app -p 3000:3000  moja0316/node-web-app
listening on 3000
[Mon Mar 22 2021 17:30:28 GMT+0000 (Coordinated Universal Time)] /hi requrst recieved!!
{ hello: 'world' }
[Mon Mar 22 2021 17:30:38 GMT+0000 (Coordinated Universal Time)] /sleep requrst recieved!!
{ hello: 'world' }
[Mon Mar 22 2021 17:32:38 GMT+0000 (Coordinated Universal Time)] /sleep requrst recieved!!
{ hello: 'world' }
```
