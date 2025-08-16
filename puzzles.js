const PUZZLES = [
  {
    id: 1,
    title: "Hello Ruby!",
    level: "初級",
    description: "Rubyで「Hello Ruby!」と出力してみよう",
    hint: "putsメソッドを使います",
    testCases: [{ expected: "Hello Ruby!\n" }],
    initialCode: "# putsを使って「Hello Ruby!」と出力\n"
  },
  {
    id: 2,
    title: "数字の出力",
    level: "初級",
    description: "数字の42を出力しよう",
    hint: "puts 42",
    testCases: [{ expected: "42\n" }],
    initialCode: "# 42を出力\n"
  },
  {
    id: 3,
    title: "足し算",
    level: "初級",
    description: "10 + 20の結果を出力しよう",
    hint: "puts 10 + 20",
    testCases: [{ expected: "30\n" }],
    initialCode: "# 10 + 20の結果を出力\n"
  },
  {
    id: 4,
    title: "引き算",
    level: "初級",
    description: "100 - 25の結果を出力しよう",
    hint: "puts 100 - 25",
    testCases: [{ expected: "75\n" }],
    initialCode: "# 100 - 25の結果を出力\n"
  },
  {
    id: 5,
    title: "掛け算",
    level: "初級",
    description: "8 × 7の結果を出力しよう",
    hint: "Rubyでは * を使います",
    testCases: [{ expected: "56\n" }],
    initialCode: "# 8 × 7の結果を出力\n"
  },
  {
    id: 6,
    title: "割り算",
    level: "初級",
    description: "100 ÷ 4の結果を出力しよう",
    hint: "Rubyでは / を使います",
    testCases: [{ expected: "25\n" }],
    initialCode: "# 100 ÷ 4の結果を出力\n"
  },
  {
    id: 7,
    title: "余りの計算",
    level: "初級",
    description: "17を5で割った余りを出力しよう",
    hint: "% を使います",
    testCases: [{ expected: "2\n" }],
    initialCode: "# 17を5で割った余りを出力\n"
  },
  {
    id: 8,
    title: "変数の基本",
    level: "初級",
    description: "変数xに10を代入して出力しよう",
    hint: "x = 10, puts x",
    testCases: [{ expected: "10\n" }],
    initialCode: "# xに10を代入して出力\n"
  },
  {
    id: 9,
    title: "文字列の変数",
    level: "初級",
    description: "nameに「Alice」を代入して出力しよう",
    hint: "文字列は\"\"で囲みます",
    testCases: [{ expected: "Alice\n" }],
    initialCode: "# nameに「Alice」を代入して出力\n"
  },
  {
    id: 10,
    title: "変数の計算",
    level: "初級",
    description: "aに5、bに3を代入して、a + bの結果を出力",
    hint: "変数同士も計算できます",
    testCases: [{ expected: "8\n" }],
    initialCode: "# aに5、bに3を代入\n# a + bの結果を出力\n"
  },
  {
    id: 11,
    title: "文字列の連結",
    level: "初級",
    description: "「Hello」と「World」を連結して出力（スペースあり）",
    hint: "+ を使って連結できます",
    testCases: [{ expected: "Hello World\n" }],
    initialCode: "# 「Hello」と「World」を連結して出力\n"
  },
  {
    id: 12,
    title: "文字列の式展開",
    level: "初級",
    description: "変数nameを使って「My name is Ruby」と出力",
    hint: "#{変数名}を使います",
    testCases: [{ expected: "My name is Ruby\n" }],
    initialCode: "name = \"Ruby\"\n# 式展開を使って出力\n"
  },
  {
    id: 13,
    title: "数値を文字列に",
    level: "初級",
    description: "数値100を文字列に変換して出力",
    hint: "to_sメソッドを使います",
    testCases: [{ expected: "100\n" }],
    initialCode: "number = 100\n# 文字列に変換して出力\n"
  },
  {
    id: 14,
    title: "文字列を数値に",
    level: "初級",
    description: "文字列「50」を数値に変換して2倍にして出力",
    hint: "to_iメソッドを使います",
    testCases: [{ expected: "100\n" }],
    initialCode: "str = \"50\"\n# 数値に変換して2倍にして出力\n"
  },
  {
    id: 15,
    title: "配列の作成",
    level: "初級",
    description: "[1, 2, 3]の配列を作って出力",
    hint: "pメソッドで配列を出力",
    testCases: [{ expected: "[1, 2, 3]\n" }],
    initialCode: "# 配列を作って出力\n"
  },
  {
    id: 16,
    title: "配列の要素取得",
    level: "初級",
    description: "配列[10, 20, 30]の2番目の要素を出力",
    hint: "インデックスは0から始まります",
    testCases: [{ expected: "20\n" }],
    initialCode: "array = [10, 20, 30]\n# 2番目の要素を出力\n"
  },
  {
    id: 17,
    title: "配列に追加",
    level: "初級",
    description: "配列[1, 2]に3を追加して[1, 2, 3]を出力",
    hint: "<< または pushメソッド",
    testCases: [{ expected: "[1, 2, 3]\n" }],
    initialCode: "array = [1, 2]\n# 3を追加して出力\n"
  },
  {
    id: 18,
    title: "配列の長さ",
    level: "初級",
    description: "配列[1, 2, 3, 4, 5]の要素数を出力",
    hint: "lengthまたはsizeメソッド",
    testCases: [{ expected: "5\n" }],
    initialCode: "array = [1, 2, 3, 4, 5]\n# 要素数を出力\n"
  },
  {
    id: 19,
    title: "真偽値",
    level: "初級",
    description: "5 > 3の結果を出力",
    hint: "比較演算子の結果はtrueまたはfalse",
    testCases: [{ expected: "true\n" }],
    initialCode: "# 5 > 3の結果を出力\n"
  },
  {
    id: 20,
    title: "等しいか判定",
    level: "初級",
    description: "10 == 10の結果を出力",
    hint: "== で等しいか判定",
    testCases: [{ expected: "true\n" }],
    initialCode: "# 10 == 10の結果を出力\n"
  },
  {
    id: 21,
    title: "if文の基本",
    level: "初級",
    description: "xが5なら「five」と出力",
    hint: "if 条件 then ... end",
    testCases: [{ expected: "five\n" }],
    initialCode: "x = 5\n# xが5なら「five」と出力\n"
  },
  {
    id: 22,
    title: "if-else文",
    level: "初級",
    description: "10が偶数なら「偶数」、奇数なら「奇数」と出力",
    hint: "% 2 == 0で偶数判定",
    testCases: [{ expected: "偶数\n" }],
    initialCode: "number = 10\n# 偶数か奇数か判定して出力\n"
  },
  {
    id: 23,
    title: "elsif文",
    level: "初級",
    description: "scoreが90以上なら「A」、80以上なら「B」、それ以外は「C」",
    hint: "elsif を使います",
    testCases: [{ expected: "B\n" }],
    initialCode: "score = 85\n# 点数に応じて評価を出力\n"
  },
  {
    id: 24,
    title: "timesメソッド",
    level: "初級",
    description: "「Hello」を3回出力",
    hint: "3.times do ... end",
    testCases: [{ expected: "Hello\nHello\nHello\n" }],
    initialCode: "# 「Hello」を3回出力\n"
  },
  {
    id: 25,
    title: "uptoメソッド",
    level: "初級",
    description: "1から5まで順番に出力",
    hint: "1.upto(5) do |i| ... end",
    testCases: [{ expected: "1\n2\n3\n4\n5\n" }],
    initialCode: "# 1から5まで順番に出力\n"
  },
  {
    id: 26,
    title: "downtoメソッド",
    level: "初級",
    description: "5から1まで逆順に出力",
    hint: "5.downto(1) do |i| ... end",
    testCases: [{ expected: "5\n4\n3\n2\n1\n" }],
    initialCode: "# 5から1まで逆順に出力\n"
  },
  {
    id: 27,
    title: "whileループ",
    level: "初級",
    description: "1から3までwhileループで出力",
    hint: "while 条件 do ... end",
    testCases: [{ expected: "1\n2\n3\n" }],
    initialCode: "# whileループで1から3まで出力\n"
  },
  {
    id: 28,
    title: "break文",
    level: "初級",
    description: "1から10のループで5になったら終了",
    hint: "break で終了",
    testCases: [{ expected: "1\n2\n3\n4\n" }],
    initialCode: "# 5になったらbreakで終了\n"
  },
  {
    id: 29,
    title: "next文",
    level: "初級",
    description: "1から5で3をスキップして出力",
    hint: "next でスキップ",
    testCases: [{ expected: "1\n2\n4\n5\n" }],
    initialCode: "# 3をスキップして出力\n"
  },
  {
    id: 30,
    title: "eachメソッド",
    level: "初級",
    description: "配列[1, 2, 3]の各要素を出力",
    hint: "array.each do |item| ... end",
    testCases: [{ expected: "1\n2\n3\n" }],
    initialCode: "array = [1, 2, 3]\n# 各要素を出力\n"
  },
  {
    id: 31,
    title: "大文字に変換",
    level: "初級",
    description: "「ruby」を大文字に変換して出力",
    hint: "upcaseメソッド",
    testCases: [{ expected: "RUBY\n" }],
    initialCode: "text = \"ruby\"\n# 大文字に変換して出力\n"
  },
  {
    id: 32,
    title: "小文字に変換",
    level: "初級",
    description: "「HELLO」を小文字に変換して出力",
    hint: "downcaseメソッド",
    testCases: [{ expected: "hello\n" }],
    initialCode: "text = \"HELLO\"\n# 小文字に変換して出力\n"
  },
  {
    id: 33,
    title: "文字列の長さ",
    level: "初級",
    description: "「Ruby」の文字数を出力",
    hint: "lengthメソッド",
    testCases: [{ expected: "4\n" }],
    initialCode: "text = \"Ruby\"\n# 文字数を出力\n"
  },
  {
    id: 34,
    title: "文字列の反転",
    level: "初級",
    description: "「hello」を反転させて出力",
    hint: "reverseメソッド",
    testCases: [{ expected: "olleh\n" }],
    initialCode: "text = \"hello\"\n# 反転させて出力\n"
  },
  {
    id: 35,
    title: "メソッドの定義",
    level: "初級",
    description: "「Hello」を返すgreetメソッドを定義して呼び出す",
    hint: "def メソッド名 ... end",
    testCases: [{ expected: "Hello\n" }],
    initialCode: "# greetメソッドを定義\n\n# メソッドを呼び出して出力\n"
  },
  {
    id: 36,
    title: "引数のあるメソッド",
    level: "中級",
    description: "2つの数を足すaddメソッドを作って10+20を計算",
    hint: "def add(a, b) ... end",
    testCases: [{ expected: "30\n" }],
    initialCode: "# addメソッドを定義\n\n# 10と20を足して出力\n"
  },
  {
    id: 37,
    title: "配列のmap",
    level: "中級",
    description: "[1, 2, 3]の各要素を2倍にして出力",
    hint: "mapメソッドを使います",
    testCases: [{ expected: "[2, 4, 6]\n" }],
    initialCode: "array = [1, 2, 3]\n# 各要素を2倍にして出力\n"
  },
  {
    id: 38,
    title: "配列のselect",
    level: "中級",
    description: "[1, 2, 3, 4, 5]から偶数だけを選んで出力",
    hint: "selectメソッドを使います",
    testCases: [{ expected: "[2, 4]\n" }],
    initialCode: "array = [1, 2, 3, 4, 5]\n# 偶数だけを選んで出力\n"
  },
  {
    id: 39,
    title: "配列のsum",
    level: "中級",
    description: "[10, 20, 30]の合計を出力",
    hint: "sumメソッドを使います",
    testCases: [{ expected: "60\n" }],
    initialCode: "array = [10, 20, 30]\n# 合計を出力\n"
  },
  {
    id: 40,
    title: "配列のmax",
    level: "中級",
    description: "[5, 2, 8, 1, 9]の最大値を出力",
    hint: "maxメソッドを使います",
    testCases: [{ expected: "9\n" }],
    initialCode: "array = [5, 2, 8, 1, 9]\n# 最大値を出力\n"
  },
  {
    id: 41,
    title: "配列のmin",
    level: "中級",
    description: "[5, 2, 8, 1, 9]の最小値を出力",
    hint: "minメソッドを使います",
    testCases: [{ expected: "1\n" }],
    initialCode: "array = [5, 2, 8, 1, 9]\n# 最小値を出力\n"
  },
  {
    id: 42,
    title: "配列のsort",
    level: "中級",
    description: "[3, 1, 4, 1, 5]を昇順にソートして出力",
    hint: "sortメソッドを使います",
    testCases: [{ expected: "[1, 1, 3, 4, 5]\n" }],
    initialCode: "array = [3, 1, 4, 1, 5]\n# ソートして出力\n"
  },
  {
    id: 43,
    title: "配列のreverse",
    level: "中級",
    description: "[1, 2, 3, 4, 5]を逆順にして出力",
    hint: "reverseメソッドを使います",
    testCases: [{ expected: "[5, 4, 3, 2, 1]\n" }],
    initialCode: "array = [1, 2, 3, 4, 5]\n# 逆順にして出力\n"
  },
  {
    id: 44,
    title: "配列のuniq",
    level: "中級",
    description: "[1, 2, 2, 3, 3, 3]から重複を除去して出力",
    hint: "uniqメソッドを使います",
    testCases: [{ expected: "[1, 2, 3]\n" }],
    initialCode: "array = [1, 2, 2, 3, 3, 3]\n# 重複を除去して出力\n"
  },
  {
    id: 45,
    title: "配列のjoin",
    level: "中級",
    description: "[\"Ruby\", \"is\", \"fun\"]を空白で連結して出力",
    hint: "join(\" \")を使います",
    testCases: [{ expected: "Ruby is fun\n" }],
    initialCode: "array = [\"Ruby\", \"is\", \"fun\"]\n# 空白で連結して出力\n"
  },
  {
    id: 46,
    title: "文字列のsplit",
    level: "中級",
    description: "「Ruby,Python,JavaScript」をカンマで分割して配列を出力",
    hint: "split(\",\")を使います",
    testCases: [{ expected: "[\"Ruby\", \"Python\", \"JavaScript\"]\n" }],
    initialCode: "text = \"Ruby,Python,JavaScript\"\n# カンマで分割して配列を出力\n"
  },
  {
    id: 47,
    title: "文字列のinclude?",
    level: "中級",
    description: "「Hello World」に「World」が含まれるか判定",
    hint: "include?メソッドを使います",
    testCases: [{ expected: "true\n" }],
    initialCode: "text = \"Hello World\"\n# 「World」が含まれるか判定して出力\n"
  },
  {
    id: 48,
    title: "文字列のstart_with?",
    level: "中級",
    description: "「Ruby Programming」が「Ruby」で始まるか判定",
    hint: "start_with?メソッドを使います",
    testCases: [{ expected: "true\n" }],
    initialCode: "text = \"Ruby Programming\"\n# 「Ruby」で始まるか判定して出力\n"
  },
  {
    id: 49,
    title: "文字列のend_with?",
    level: "中級",
    description: "「hello.rb」が「.rb」で終わるか判定",
    hint: "end_with?メソッドを使います",
    testCases: [{ expected: "true\n" }],
    initialCode: "text = \"hello.rb\"\n# 「.rb」で終わるか判定して出力\n"
  },
  {
    id: 50,
    title: "文字列のgsub",
    level: "中級",
    description: "「Hello World」の「o」を「0」に置換して出力",
    hint: "gsubメソッドを使います",
    testCases: [{ expected: "Hell0 W0rld\n" }],
    initialCode: "text = \"Hello World\"\n# 「o」を「0」に置換して出力\n"
  },
  {
    id: 51,
    title: "ハッシュの作成",
    level: "中級",
    description: "{name: \"Ruby\", year: 1995}を出力",
    hint: "ハッシュはキーと値のペア",
    testCases: [{ expected: "{:name=>\"Ruby\", :year=>1995}\n" }],
    initialCode: "# ハッシュを作成して出力\n"
  },
  {
    id: 52,
    title: "ハッシュの値取得",
    level: "中級",
    description: "ハッシュ{name: \"Alice\", age: 20}からnameの値を出力",
    hint: "hash[:key]で値を取得",
    testCases: [{ expected: "Alice\n" }],
    initialCode: "person = {name: \"Alice\", age: 20}\n# nameの値を出力\n"
  },
  {
    id: 53,
    title: "ハッシュに追加",
    level: "中級",
    description: "ハッシュ{a: 1}に{b: 2}を追加して出力",
    hint: "hash[:key] = valueで追加",
    testCases: [{ expected: "{:a=>1, :b=>2}\n" }],
    initialCode: "hash = {a: 1}\n# b: 2を追加して出力\n"
  },
  {
    id: 54,
    title: "ハッシュのkeys",
    level: "中級",
    description: "{a: 1, b: 2, c: 3}のキーだけを配列で出力",
    hint: "keysメソッドを使います",
    testCases: [{ expected: "[:a, :b, :c]\n" }],
    initialCode: "hash = {a: 1, b: 2, c: 3}\n# キーだけを出力\n"
  },
  {
    id: 55,
    title: "ハッシュのvalues",
    level: "中級",
    description: "{a: 1, b: 2, c: 3}の値だけを配列で出力",
    hint: "valuesメソッドを使います",
    testCases: [{ expected: "[1, 2, 3]\n" }],
    initialCode: "hash = {a: 1, b: 2, c: 3}\n# 値だけを出力\n"
  },
  {
    id: 56,
    title: "範囲オブジェクト",
    level: "中級",
    description: "1から5の範囲を配列に変換して出力",
    hint: "(1..5).to_a",
    testCases: [{ expected: "[1, 2, 3, 4, 5]\n" }],
    initialCode: "# 1から5の範囲を配列にして出力\n"
  },
  {
    id: 57,
    title: "caseの使い方",
    level: "中級",
    description: "数値3に対して「三」と出力するcase文",
    hint: "case when構文",
    testCases: [{ expected: "三\n" }],
    initialCode: "number = 3\n# case文で「三」と出力\n"
  },
  {
    id: 58,
    title: "三項演算子",
    level: "中級",
    description: "10が5より大きければ「大」、そうでなければ「小」",
    hint: "条件 ? 真の値 : 偽の値",
    testCases: [{ expected: "大\n" }],
    initialCode: "# 三項演算子を使って出力\n"
  },
  {
    id: 59,
    title: "unless文",
    level: "中級",
    description: "falseでない限り「OK」と出力",
    hint: "unless は if not と同じ",
    testCases: [{ expected: "OK\n" }],
    initialCode: "flag = true\n# unless文を使って出力\n"
  },
  {
    id: 60,
    title: "配列のfind",
    level: "中級",
    description: "[1, 2, 3, 4, 5]から最初の偶数を見つけて出力",
    hint: "findメソッドを使います",
    testCases: [{ expected: "2\n" }],
    initialCode: "array = [1, 2, 3, 4, 5]\n# 最初の偶数を見つけて出力\n"
  },
  {
    id: 61,
    title: "配列のany?",
    level: "中級",
    description: "[1, 2, 3]に偶数が含まれるか判定",
    hint: "any?メソッドを使います",
    testCases: [{ expected: "true\n" }],
    initialCode: "array = [1, 2, 3]\n# 偶数が含まれるか判定して出力\n"
  },
  {
    id: 62,
    title: "配列のall?",
    level: "中級",
    description: "[2, 4, 6]が全て偶数か判定",
    hint: "all?メソッドを使います",
    testCases: [{ expected: "true\n" }],
    initialCode: "array = [2, 4, 6]\n# 全て偶数か判定して出力\n"
  },
  {
    id: 63,
    title: "配列のcount",
    level: "中級",
    description: "[1, 2, 2, 3, 3, 3]で3の個数を数える",
    hint: "count(値)を使います",
    testCases: [{ expected: "3\n" }],
    initialCode: "array = [1, 2, 2, 3, 3, 3]\n# 3の個数を出力\n"
  },
  {
    id: 64,
    title: "配列のindex",
    level: "中級",
    description: "[10, 20, 30, 40]で30のインデックスを出力",
    hint: "indexメソッドを使います",
    testCases: [{ expected: "2\n" }],
    initialCode: "array = [10, 20, 30, 40]\n# 30のインデックスを出力\n"
  },
  {
    id: 65,
    title: "配列のflatten",
    level: "中級",
    description: "[[1, 2], [3, 4]]を1次元配列にして出力",
    hint: "flattenメソッドを使います",
    testCases: [{ expected: "[1, 2, 3, 4]\n" }],
    initialCode: "array = [[1, 2], [3, 4]]\n# 1次元配列にして出力\n"
  },
  {
    id: 66,
    title: "配列のcompact",
    level: "中級",
    description: "[1, nil, 2, nil, 3]からnilを除去して出力",
    hint: "compactメソッドを使います",
    testCases: [{ expected: "[1, 2, 3]\n" }],
    initialCode: "array = [1, nil, 2, nil, 3]\n# nilを除去して出力\n"
  },
  {
    id: 67,
    title: "文字列のstrip",
    level: "中級",
    description: "「  Ruby  」の前後の空白を除去して出力",
    hint: "stripメソッドを使います",
    testCases: [{ expected: "Ruby\n" }],
    initialCode: "text = \"  Ruby  \"\n# 前後の空白を除去して出力\n"
  },
  {
    id: 68,
    title: "文字列のchars",
    level: "中級",
    description: "「Ruby」を1文字ずつの配列にして出力",
    hint: "charsメソッドを使います",
    testCases: [{ expected: "[\"R\", \"u\", \"b\", \"y\"]\n" }],
    initialCode: "text = \"Ruby\"\n# 1文字ずつの配列にして出力\n"
  },
  {
    id: 69,
    title: "ブロック引数",
    level: "中級",
    description: "[1, 2, 3]の各要素の2乗を出力",
    hint: "each { |n| puts n**2 }",
    testCases: [{ expected: "1\n4\n9\n" }],
    initialCode: "array = [1, 2, 3]\n# 各要素の2乗を出力\n"
  },
  {
    id: 70,
    title: "デフォルト引数",
    level: "中級",
    description: "引数がない時は「Guest」を返すgreetメソッド",
    hint: "def greet(name = \"Guest\")",
    testCases: [{ expected: "Hello Guest\n" }],
    initialCode: "# デフォルト引数付きgreetメソッドを定義\n\n# 引数なしで呼び出して出力\n"
  },
  {
    id: 71,
    title: "可変長引数",
    level: "上級",
    description: "任意個数の引数を受け取って合計を返すメソッド",
    hint: "def sum(*args)",
    testCases: [{ expected: "15\n" }],
    initialCode: "# 可変長引数のsumメソッドを定義\n\n# 1, 2, 3, 4, 5を渡して出力\nputs sum(1, 2, 3, 4, 5)"
  },
  {
    id: 72,
    title: "キーワード引数",
    level: "上級",
    description: "名前と年齢をキーワード引数で受け取るメソッド",
    hint: "def info(name:, age:)",
    testCases: [{ expected: "Alice is 20 years old\n" }],
    initialCode: "# キーワード引数のinfoメソッドを定義\n\n# name: \"Alice\", age: 20で呼び出し\nputs info(name: \"Alice\", age: 20)"
  },
  {
    id: 73,
    title: "ブロック付きメソッド",
    level: "上級",
    description: "3回ブロックを実行するrepeatメソッドを定義",
    hint: "yield を使います",
    testCases: [{ expected: "Hello\nHello\nHello\n" }],
    initialCode: "# repeatメソッドを定義\n\n# ブロック付きで呼び出し\nrepeat(3) { puts \"Hello\" }"
  },
  {
    id: 74,
    title: "Procオブジェクト",
    level: "上級",
    description: "数値を2倍にするProcを作成して使用",
    hint: "Proc.new { |x| x * 2 }",
    testCases: [{ expected: "10\n" }],
    initialCode: "# 2倍にするProcを作成\n\n# Procを使って5を2倍にして出力\n"
  },
  {
    id: 75,
    title: "lambdaの使用",
    level: "上級",
    description: "偶数判定のlambdaを作成して使用",
    hint: "lambda { |n| n.even? }",
    testCases: [{ expected: "true\nfalse\n" }],
    initialCode: "# 偶数判定のlambdaを作成\n\n# 4と5で判定して出力\n"
  },
  {
    id: 76,
    title: "シンボルをProcに",
    level: "上級",
    description: "[\"ruby\", \"python\"]を大文字に変換",
    hint: "&:upcase を使います",
    testCases: [{ expected: "[\"RUBY\", \"PYTHON\"]\n" }],
    initialCode: "languages = [\"ruby\", \"python\"]\n# &:シンボルを使って大文字に変換\n"
  },
  {
    id: 77,
    title: "injectメソッド",
    level: "上級",
    description: "[1, 2, 3, 4, 5]の積を計算",
    hint: "inject(:*) または inject { |acc, n| acc * n }",
    testCases: [{ expected: "120\n" }],
    initialCode: "array = [1, 2, 3, 4, 5]\n# injectで積を計算して出力\n"
  },
  {
    id: 78,
    title: "zip メソッド",
    level: "上級",
    description: "[1, 2, 3]と[\"a\", \"b\", \"c\"]を組み合わせる",
    hint: "zipメソッドを使います",
    testCases: [{ expected: "[[1, \"a\"], [2, \"b\"], [3, \"c\"]]\n" }],
    initialCode: "numbers = [1, 2, 3]\nletters = [\"a\", \"b\", \"c\"]\n# zipで組み合わせて出力\n"
  },
  {
    id: 79,
    title: "group_by",
    level: "上級",
    description: "[1, 2, 3, 4, 5, 6]を偶数と奇数でグループ化",
    hint: "group_by { |n| n.even? }",
    testCases: [{ expected: "{false=>[1, 3, 5], true=>[2, 4, 6]}\n" }],
    initialCode: "array = [1, 2, 3, 4, 5, 6]\n# 偶数と奇数でグループ化して出力\n"
  },
  {
    id: 80,
    title: "partition",
    level: "上級",
    description: "[1, 2, 3, 4, 5]を3以上とそれ未満に分割",
    hint: "partitionメソッドを使います",
    testCases: [{ expected: "[[3, 4, 5], [1, 2]]\n" }],
    initialCode: "array = [1, 2, 3, 4, 5]\n# 3以上とそれ未満に分割して出力\n"
  },
  {
    id: 81,
    title: "正規表現マッチ",
    level: "上級",
    description: "「Ruby 3.0.0」からバージョン番号を抽出",
    hint: "/\\d+\\.\\d+\\.\\d+/",
    testCases: [{ expected: "3.0.0\n" }],
    initialCode: "text = \"Ruby 3.0.0\"\n# 正規表現でバージョン番号を抽出して出力\n"
  },
  {
    id: 82,
    title: "正規表現の置換",
    level: "上級",
    description: "「2024-01-01」を「01/01/2024」形式に変換",
    hint: "gsub と キャプチャグループ",
    testCases: [{ expected: "01/01/2024\n" }],
    initialCode: "date = \"2024-01-01\"\n# 日付形式を変換して出力\n"
  },
  {
    id: 83,
    title: "例外処理",
    level: "上級",
    description: "0除算エラーをrescueして「エラー」と出力",
    hint: "begin rescue end",
    testCases: [{ expected: "エラー\n" }],
    initialCode: "# 10 / 0 を実行してエラーをキャッチ\n"
  },
  {
    id: 84,
    title: "クラスの定義",
    level: "上級",
    description: "nameを持つPersonクラスを定義",
    hint: "class Person ... end",
    testCases: [{ expected: "Alice\n" }],
    initialCode: "# Personクラスを定義\n\n# Aliceという名前でインスタンス作成\n# nameを出力"
  },
  {
    id: 85,
    title: "attr_accessor",
    level: "上級",
    description: "getter/setterを持つCarクラス",
    hint: "attr_accessor :属性名",
    testCases: [{ expected: "Toyota\n" }],
    initialCode: "# Carクラスを定義（modelアクセサ付き）\n\n# modelをToyotaに設定して出力"
  },
  {
    id: 86,
    title: "クラスメソッド",
    level: "上級",
    description: "円の面積を計算するクラスメソッド",
    hint: "self.method_name",
    testCases: [{ expected: "314\n" }],
    initialCode: "# Circleクラスを定義\n# 半径10の面積を計算（π=3.14として）\n"
  },
  {
    id: 87,
    title: "継承",
    level: "上級",
    description: "AnimalクラスからDogクラスを継承",
    hint: "class Dog < Animal",
    testCases: [{ expected: "Woof!\n" }],
    initialCode: "class Animal\n  def speak\n    \"...\"\n  end\nend\n\n# Dogクラスを定義（speakをオーバーライド）\n\n# Dogインスタンスでspeakを呼び出し"
  },
  {
    id: 88,
    title: "モジュール",
    level: "上級",
    description: "Greetableモジュールを定義してinclude",
    hint: "module Greatable ... end",
    testCases: [{ expected: "Hello from module\n" }],
    initialCode: "# Greetableモジュールを定義\n\n# Personクラスにinclude\n\n# greetメソッドを呼び出し"
  },
  {
    id: 89,
    title: "定数の定義",
    level: "上級",
    description: "PIという定数を定義して円周を計算",
    hint: "定数は大文字で始まる",
    testCases: [{ expected: "31.4\n" }],
    initialCode: "# PI定数を定義（3.14）\n# 半径5の円周を計算（2πr）\n"
  },
  {
    id: 90,
    title: "freeze",
    level: "上級",
    description: "配列をfreezeして変更不可にする",
    hint: "freezeメソッドで凍結",
    testCases: [{ expected: "true\n" }],
    initialCode: "array = [1, 2, 3]\n# freezeして、frozen?の結果を出力\n"
  },
  {
    id: 91,
    title: "tap メソッド",
    level: "上級",
    description: "配列を作成しながら要素を追加",
    hint: "tapでメソッドチェーン",
    testCases: [{ expected: "[1, 2, 3]\n" }],
    initialCode: "# [].tapを使って1,2,3を追加\n"
  },
  {
    id: 92,
    title: "lazy評価",
    level: "上級",
    description: "無限数列から最初の5つの偶数を取得",
    hint: "(1..).lazy.select",
    testCases: [{ expected: "[2, 4, 6, 8, 10]\n" }],
    initialCode: "# lazyを使って無限数列から偶数を5つ取得\n"
  },
  {
    id: 93,
    title: "Struct",
    level: "上級",
    description: "Personという構造体を作成",
    hint: "Struct.new(:name, :age)",
    testCases: [{ expected: "Bob\n" }],
    initialCode: "# Person構造体を定義\n# Bob, 25でインスタンス作成\n# nameを出力"
  },
  {
    id: 94,
    title: "alias",
    level: "上級",
    description: "メソッドに別名をつける",
    hint: "alias new_name old_name",
    testCases: [{ expected: "Hello\n" }],
    initialCode: "class Greeting\n  def say_hello\n    \"Hello\"\n  end\n  # hiという別名をつける\nend\n\n# hiメソッドを呼び出し\nputs Greeting.new.hi"
  },
  {
    id: 95,
    title: "method_missing",
    level: "上級",
    description: "存在しないメソッドをキャッチ",
    hint: "def method_missing(name)",
    testCases: [{ expected: "Method not found: hello\n" }],
    initialCode: "class Dynamic\n  # method_missingを定義\nend\n\n# 存在しないhelloメソッドを呼び出し\nDynamic.new.hello"
  },
  {
    id: 96,
    title: "define_method",
    level: "上級",
    description: "動的にメソッドを定義",
    hint: "define_method(:name) { }",
    testCases: [{ expected: "Dynamic method\n" }],
    initialCode: "class Dynamic\n  # greetメソッドを動的に定義\nend\n\n# greetメソッドを呼び出し\nputs Dynamic.new.greet"
  },
  {
    id: 97,
    title: "send メソッド",
    level: "上級",
    description: "メソッド名を文字列で指定して実行",
    hint: "object.send(:method_name)",
    testCases: [{ expected: "HELLO\n" }],
    initialCode: "text = \"hello\"\n# sendを使ってupcaseを実行\n"
  },
  {
    id: 98,
    title: "eval",
    level: "上級",
    description: "文字列をRubyコードとして実行",
    hint: "eval(\"code\")",
    testCases: [{ expected: "25\n" }],
    initialCode: "code = \"5 * 5\"\n# evalで実行して出力\n"
  },
  {
    id: 99,
    title: "メタプログラミング",
    level: "上級",
    description: "クラスに動的にアクセサを追加",
    hint: "attr_accessor を class_eval で",
    testCases: [{ expected: "Ruby\n" }],
    initialCode: "class Book\nend\n\n# class_evalでtitleアクセサを追加\nBook.class_eval { attr_accessor :title }\n\n# titleを設定して出力\nbook = Book.new\nbook.title = \"Ruby\"\nputs book.title"
  },
  {
    id: 100,
    title: "フィボナッチ数列",
    level: "上級",
    description: "10番目のフィボナッチ数を計算（0, 1, 1, 2, 3, 5, 8, 13, 21, 34）",
    hint: "再帰またはループで実装",
    testCases: [{ expected: "34\n" }],
    initialCode: "# fibonacciメソッドを定義\n\n# 10番目の値を出力（0から数えて9番目）\n"
  }
];