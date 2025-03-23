---
id: "-1"
title: "KaTeX 全マクロテスト"
date: "2025-03-23"
updated: "2025-03-23"
eyecatch: ""
tags: ["Astro", "Markdown", "KaTeX", "ブログ"]
---

このドキュメントは、設定されたすべてのカスタムマクロの動作確認用テストケースです。  
各マクロが意図した記法でレンダリングされるか、下記の例を確認してください。

---

## 1. 括弧・行列系マクロ

- **\quantity, \qty**  
  行内数式:  
  
  $\quantity{a+b} \quad \qty{a+b}$
  
  → どちらも `{a+b}` のような大括弧で囲む。

- **\pqty, \bqty, \vqty, \Bqty**  
  行内数式:  
  
  $\pqty{a+b} \quad \bqty{a+b} \quad \vqty{x} \quad \Bqty{a+b}$
  
  → `\pqty` は丸括弧、`\bqty` は角括弧、`\vqty` は縦線、`\Bqty` は大括弧（再定義）になるはずです。

- **\mqty, \pmqty, \bmqty, \vmqty, \mdet**  
  配列系（複数行の要素を扱う）:  
  
  $\mqty{a\\b} \quad \pmqty{a\\b} \quad \bmqty{a\\b} \quad \vmqty{a\\b} \quad \mdet{a\\b}$
  
  → それぞれ、単一の配列、丸括弧内、角括弧内、縦線内、そして行列式形式になるはずです。

---

## 2. 絶対値・ノルム

- **\absolutevalue, \abs**  
  
  $\absolutevalue{x} \quad \abs{x}$
  
  → 両方とも絶対値記号を出力。

- **\norm**  
  
  $\norm{v}$
  
  → ノルム（ベクトルの大きさ）を表す。

---

## 3. 評価・オーダー

- **\evaluated, \eval**  
  
  $\evaluated{x} \quad \eval{x}$
  
  → 数式の評価記号として出力（例: x の後ろに縦線がつく）。

- **\order**  
  
  $\order{n}$
  
  → Big-O 記法として出力。

---

## 4. 演算子・括弧付き演算

- **\commutator, \comm**  
  
  $\commutator{A}{B} \quad \comm{A}{B}$
  
  → 角括弧で囲まれた [A, B] を出力。

- **\anticommutator, \acomm**  
  
  $\anticommutator{A}{B} \quad \acomm{A}{B}$
  
  → 中括弧で囲まれた {A, B} を出力。

- **\poissonbracket, \pb**  
  
  $\poissonbracket{f}{g} \quad \pb{f}{g}$
  
  → 同様に中括弧で囲む。

---

## 5. ベクトル関連

- **\vectorbold, \vb**  
  
  $\vectorbold{v} \quad \vb{v}$
  
  → 太字の v を出力。

- **\vectorarrow, \va**  
  
  $\vectorarrow{v} \quad \va{v}$
  
  → 矢印付きの太字 v を出力。

- **\vectorunit, \vu**  
  
  $\vectorunit{v} \quad \vu{v}$
  
  → 単位ベクトルを表す記法。

- **\dotproduct, \vdot**  
  
  $A \dotproduct B \quad A \vdot B$
  
  → ドット積記号を出力。

- **\crossproduct, \cross, \cp**  
  
  $\crossproduct{a}{b} \quad \cross{a}{b} \quad \cp{a}{b}$
  
  → クロス積記号で出力。

- **\gradient, \grad**  
  
  $\gradient f \quad \grad f$
  
  → 勾配（∇）を出力。

- **\divergence, \div**  
  
  $\divergence{F} \quad \div{F}$
  
  → 発散を表す記法。

- **\curl**  
  
  $\curl{F}$
  
  → 回転（カール）を出力。

- **\laplacian**  
  
  $\laplacian$
  
  → ラプラシアン演算子を出力。

---

## 6. 行列演算子とその他の記号

- **\tr, \Tr**  
  
  $\tr{A} \quad \Tr{A}$
  
  → 行列のトレースを表す。

- **\rank**  
  
  $\rank{A}$
  
  → 行列のランクを出力。

- **\erf**  
  
  $\erf(x)$
  
  → 誤差関数を出力。

- **\Res**  
  
  $\Res(f)$
  
  → 留数を出力。

- **\principalvalue, \pv, \PV**  
  
  $\principalvalue \quad \pv \quad \PV$
  
  → 主値を表す記号を出力。

- **\Re, \Im**  
  
  $\Re{x} \quad \Im{x}$
  
  → 実部と虚部を出力。

---

## 7. テキストとスペース挿入用マクロ

- **\qqtext, \qq**  
  
  $\qqtext{Sample Text} \quad \qq{Sample Text}$
  
- **\qcomma, \qc, \qcc**  
  
  $a\qcomma b \quad a\qc b \quad a\qcc b$
  
- **\qif, \qthen, \qelse, \qotherwise**  
  
  $\qif\; P \qthen\; Q \qelse\; R \quad \qotherwise$
  
- **\qunless, \qgiven, \qusing, \qassume, \qsince, \qlet, \qfor, \qall, \qeven, \qodd, \qinteger, \qand, \qor, \qas, \qin**  
  
  $\qunless\; x \qgiven\; y \qusing\; z \qassume\; P \qsince\; t \qlet\; n \qfor\; i \qall\; j \qeven\; k \qodd\; l \qinteger\; m \qand\; N \qor\; O \qas\; P \qin\; Q$
  
  → 各マクロが、前後に適切なスペースやテキストを挿入するか確認してください。

---

## 8. 微分と導関数

- **\differential, \dd, \d**  
 
  $\differential x \quad \dd \quad \d$
  
- **\derivative, \dv**  
  
  $\derivative{f}{x} \quad \dv{f}{x}$
  
- **\partialderivative, \pdv**  
  
  $\partialderivative{f}{x} \quad \pdv{f}{x}$
  
- **\variation, \var**  
  
  $\variation \quad \var$
  
- **\functionalderivative, \fdv**  
  
  $\functionalderivative{S}{\phi} \quad \fdv{S}{\phi}$
  

---

## 9. ブラケット・内積系マクロ

- **\ket, \bra**  
  
  $\ket{\psi} \quad \bra{\phi}$
  
- **\innerproduct, \braket**  
  
  $\innerproduct{\phi}{\psi} \quad \braket{\phi}{\psi}$
  
- **\outerproduct, \dyad, \ketbra, \op**  
  
  $\outerproduct{\psi}{\phi} \quad \dyad{\psi}{\phi} \quad \ketbra{\psi}{\phi} \quad \op{\psi}{\phi}$
  
- **\expectationvalue, \expval, \ev**  
  
  $\expectationvalue{A} \quad \expval{A} \quad \ev{A}$
  

---

## 10. 行列要素マクロ

- **\matrixelement, \matrixel, \mel**  
  
  $\matrixelement{v}{A}{w} \quad \matrixel{v}{A}{w} \quad \mel{v}{A}{w}$
  

---

## 11. その他の記号

- **\slashed**  
  
  $\slashed{p}$
  
- **\ce, \si, \SI**  
  
  $\ce{H2O} \quad \si{m} \quad \SI{100}{kg}$
  
- **\micro, \ohm**  
  
  $\micro \quad \ohm$
  
- **\num**  
  
  $\num{12345}$
  

---

## 12. ブロック数式での一括テスト

以下は、複数のマクロを組み合わせたブロック数式の例です。

$$
\begin{aligned}
\qty{1+2} &= 3, \quad
\pqty{1+2} = 3, \quad
\bqty{1+2} = 3, \\
\vqty{x} &= |x|, \\
\mqty{a\\b} &= \begin{array}{c} a \\ b \end{array}, \\
\pmqty{a\\b} &= \left( \begin{array}{c} a \\ b \end{array} \right), \\
\norm{v} &= \left\Vert v \right\Vert, \quad \\
\derivative{f}{x} &= \frac{\text{d} f}{\text{d} x}, \\
\partialderivative{f}{x} &= \frac{\partial f}{\partial x}.
\end{aligned}
$$

