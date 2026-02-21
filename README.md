# SimpleSit Addon

![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/Naru8521/SimpleSit/total) ![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/Naru8521/SimpleSit/latest/total?color=green) ![GitHub Release](https://img.shields.io/github/v/release/Naru8521/SimpleSit)
 
階段やハーフブロック、その場に座ることができます

アドオンのダウンロードは[コチラ](https://github.com/Naru8521/SimpleSit/releases)

クラフターズコロニーは[コチラ](https://minecraft-mcworld.com/204684/)

# 使い方
動画での説明は[コチラ](https://www.youtube.com/watch?v=cGPpEfAxdDg)

まずはアドオンをワールドにインポートしてください。

アドオンをワールドに適用したら、アドオンが使用できます。

# 右クリックで座れるブロック

**階段**
![img](https://github.com/Naru8521/SimpleSit/blob/main/assets/stairs.png)

**ハーフブロック**
![img](https://github.com/Naru8521/SimpleSit/blob/main/assets/slabs.png)

# その場に座るには
**"sit"** コマンドを使用することで、その場に座ることができます
![img](https://github.com/Naru8521/SimpleSit/blob/main/assets/sit_command.png)

![img](https://github.com/Naru8521/SimpleSit/blob/main/assets/sit.png)

# コマンド一覧
これらはチャット欄で実行してください。
| コマンド  | 説明 |
| ------------- | ------------- |
| /sit  | その場に座ります |
| /stand | 強制的に立ち上がります |
| /standall | 全プレイヤーを強制的に立ち上げさせます（権限が必要です） |
| /settings | SimpleSitの設定フォームを開きます（権限が必要です） |

# 設定フォーム
![img](https://github.com/Naru8521/SimpleSit/blob/main/assets/settings_form.png)  
上から、
- プレイヤーが座るのを許可されているタグ一覧（空の場合は全プレイヤーが対象）
- プレイヤーが立つのを許可されているタグ一覧（空の場合は全プレイヤーが対象）
- 詳細設定
    - OnlyStandCommand - standコマンド以外で強制的に立てなくする

です。


# 応用
すべてのプレイヤーを強制的に座らせる  
```/execute as @a at @s run sit```

特定のプレイヤーを強制的に立たせる  
```/execute at @s run stand```

すべてのプレイヤーを強制的に立たせる  
```/execute as @a at @s run standall```
