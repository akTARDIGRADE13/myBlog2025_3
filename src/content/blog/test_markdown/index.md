---
id: "-2"
title: "表示テスト"
date: "2025-03-23"
updated: "2025-03-23"
eyecatch: ""
tags: ["Astro", "Markdown", "ブログ"]
---

以下は、コードブロック、引用、表などの要素がどのように表示されるか確認するためのテスト用 Markdown の例です。Astro の MDX や Markdown コンテンツとして配置して、表示を確認してみてください。

---

# 表示テスト文書

この文書は、**コードブロック**、*引用*、および **表** などの Markdown 要素がどのようにレンダリングされるか確認するためのテスト用です。

---

## コードブロック

以下は JavaScript のサンプルコードです:

```js
// 配列の要素を合計する関数
function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

console.log(sum([1, 2, 3, 4])); // 10 を出力
```

また、インラインコードも試してみます。たとえば、`const x = 10;` のように記述できます。

---

## C++ の例

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}
```

---

## Go の例

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
```

---

## Bash の例

```bash
#!/bin/bash
echo "Hello, Bash!"
```

---

## Python の例

```python
def greet(name):
    print(f"Hello, {name}!")

greet("Python")
```

---

## 引用

以下は引用の例です:

> 「成功するためには、準備が必要だ。― ベンジャミン・フランクリン」
>
> > ネストした引用も可能です。これは、さらに深いレベルの引用です。

---

## 表

以下はシンプルな表の例です:

| 名前       | 年齢 | 国      |
| ---------- | ---- | ------- |
| 山田 太郎  | 30   | 日本    |
| John Smith | 25   | アメリカ |
| 李 小龍    | 32   | 香港    |

表の見た目はテーマやスタイルシート（例: Tailwind CSS の `prose` クラスなど）によって変わりますが、基本的な表構造はこのようになります。

---

## その他の要素

- **リスト:**  
  - 順不同リストの例
  - アイテム1
  - アイテム2

1. 順序付きリストの例
2. ステップ2
3. ステップ3

---
