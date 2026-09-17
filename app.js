const $ = id => document.getElementById(id);

const ids = [
  "ankoC",
  "ankoY",
  "minkoC",
  "minkoY",
  "ankanC",
  "ankanY",
  "minkanC",
  "minkanY"
];

function fill(id) {
  const s = $(id);
  s.innerHTML = "";

  for (let i = 0; i <= 4; i++) {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = i;
    s.appendChild(o);
  }
}

ids.forEach(fill);

let han = 2;
let parent = false;

function ceil100(x) {
  return Math.ceil(x / 100) * 100;
}

function fmt(x) {
  if (Object.is(x, -0) || x === 0) {
    return "0";
  }

  if (Number.isInteger(x)) {
    return x.toLocaleString("ja-JP");
  }

  return x.toLocaleString("ja-JP", {
    maximumFractionDigits: 2
  });
}

/*
 * 「上がり」と「特殊上がり」の矛盾した組み合わせを
 * 同時に選択できないようにする。
 *
 * ツモ       × 門前ロン
 * ロン       × 平和ツモ
 */
function updateAgariSpecialOptions() {
  const agari = $("agari");
  const special = $("special");

  // 特殊上がり側の選択肢を制限
  Array.from(special.options).forEach(o => {
    o.disabled =
      (agari.value === "ツモ" && o.value === "門前ロン") ||
      (agari.value === "ロン" && o.value === "平和ツモ");
  });

  // 上がり側の選択肢を制限
  Array.from(agari.options).forEach(o => {
    o.disabled =
      (special.value === "平和ツモ" && o.value === "ロン") ||
      (special.value === "門前ロン" && o.value === "ツモ");
  });

  /*
   * 万一、HTMLやブラウザ側の状態によって
   * 矛盾した組み合わせになった場合は、
   * 特殊上がりを「なし」に戻す。
   */
  if (
    (agari.value === "ツモ" && special.value === "門前ロン") ||
    (agari.value === "ロン" && special.value === "平和ツモ")
  ) {
    special.value = "なし";
    updateAgariSpecialOptions();
  }
}


/*
 * メイン計算
 *
 * Excelの
 * B12～B22
 * の計算式を基本的にそのままJavaScriptへ移植。
 */
function calc() {

  // -------------------------
  // B12：面子符
  // -------------------------

  const C3 = +$("ankoC").value;
  const D3 = +$("ankoY").value;

  const C4 = +$("minkoC").value;
  const D4 = +$("minkoY").value;

  const C5 = +$("ankanC").value;
  const D5 = +$("ankanY").value;

  const C6 = +$("minkanC").value;
  const D6 = +$("minkanY").value;

  const mentsu =
    (C3 * 4) +
    (D3 * 8) +
    (C4 * 2) +
    (D4 * 4) +
    (C5 * 16) +
    (D5 * 32) +
    (C6 * 8) +
    (D6 * 16);


  // -------------------------
  // B13：雀頭符
  // -------------------------

  const janto =
    $("janto").value.includes("以外")
      ? 0
      : 2;


  // -------------------------
  // B14：待ち符
  // -------------------------

  const machi =
    ["両面", "シャンポン"].includes($("machi").value)
      ? 0
      : 2;


  // -------------------------
  // B15：上がり符
  // -------------------------

  const agari =
    $("agari").value.includes("ロン")
      ? 0
      : 2;


  // -------------------------
  // B16：10符単位に切り上げ
  // -------------------------

  const subtotal =
    Math.ceil(
      (mentsu + janto + machi + agari) / 10
    ) * 10;


  // -------------------------
  // B17：符
  // -------------------------

  let calculatedFu;

  if ($("special").value.includes("七対子")) {

    // 七対子
    calculatedFu = 25;

  } else if ($("special").value.includes("平和ツモ")) {

    // 平和ツモ
    calculatedFu = 0;

  } else if ($("special").value.includes("門前ロン")) {

    // 門前ロン
    calculatedFu = subtotal + 10;

  } else {

    calculatedFu = subtotal;
  }


  /*
   * Excelでは通常、
   *
   * 特殊上がりの符 + 20
   *
   * となる。
   *
   * ただし手動符入力時は、
   * D17の値をそのまま使う。
   */
  const manual =
    $("manualOn").checked &&
    $("manualFu").value !== "";

  let fu;

  if (manual) {

    // 手動入力値をそのまま使用
    fu = +$("manualFu").value;

  } else {

    fu = calculatedFu + 20;
  }


  // -------------------------
  // 通常点数
  // -------------------------

  /*
   * Excel：
   *
   * 親 = 48
   * 子 = 32
   *
   * × 符
   * × 2^(飜数-1)
   */

  const base =
    (parent ? 48 : 32) *
    fu *
    Math.pow(2, han - 1);


  let score;


  /*
   * 飜数による満貫以上の表示
   *
   * 6～7飜  → 跳満
   * 8～10飜 → 倍満
   * 11～12飜 → 三倍満
   * 13飜以上 → 数え役満
   *
   * これはユーザー指定の表示ルール。
   */
  if (han >= 13) {

    score = "数え役満";

  } else if (han >= 11) {

    score = "三倍満";

  } else if (han >= 8) {

    score = "倍満";

  } else if (han >= 6) {

    score = "跳満";

  } else if (
    ceil100(base) >= (parent ? 12000 : 8000)
  ) {

    // Excelの満貫判定
    score = "満貫";

  } else if (
    $("agari").value.includes("ロン")
  ) {

    // ロン
    score = fmt(ceil100(base));

  } else if (parent) {

    // 親ツモ
    score =
      fmt(
        ceil100(
          ceil100(base) / 3
        )
      ) + "オール";

  } else {

    // 子ツモ
    score =
      fmt(
        ceil100(
          ceil100(base) / 4
        )
      ) +
      "-" +
      fmt(
        ceil100(
          ceil100(base) / 2
        )
      );
  }


  // -------------------------
  // B22：青天井
  // -------------------------

  /*
   * Excelの青天井計算式を維持。
   *
   * 親 = 6
   * 子 = 4
   *
   * × 符
   * × 2^(飜数+2)
   */

  const unit =
    (parent ? 6 : 4) *
    fu *
    Math.pow(2, han + 2);


  let aoten;

  if ($("agari").value.includes("ロン")) {

    // ロン
    aoten = fmt(unit);

  } else if (parent) {

    // 親ツモ
    aoten =
      fmt(unit / 3) +
      "オール";

  } else {

    // 子ツモ
    aoten =
      fmt(unit / 4) +
      "-" +
      fmt(unit / 2);
  }


  // -------------------------
  // 画面表示
  // -------------------------

  $("mentsuFu").textContent =
    mentsu + "符";

  $("subtotal").textContent =
    subtotal + "符";

  $("fu").textContent =
    fu + "符";

  $("score").textContent =
    score;

  $("aoten").textContent =
    aoten;
}


// -------------------------
// 各入力項目のイベント
// -------------------------

ids.forEach(id => {
  $(id).addEventListener("change", calc);
});

["janto", "machi"].forEach(id => {
  $(id).addEventListener("change", calc);
});


// 上がり
$("agari").addEventListener("change", () => {

  updateAgariSpecialOptions();
  calc();

});


// 特殊上がり
$("special").addEventListener("change", () => {

  updateAgariSpecialOptions();
  calc();

});


// -------------------------
// 飜数
// -------------------------

$("minus").onclick = () => {

  han = Math.max(1, han - 1);

  $("han").textContent = han;

  calc();
};


$("plus").onclick = () => {

  han++;

  $("han").textContent = han;

  calc();
};


// -------------------------
// 親・子
// -------------------------

document
  .querySelectorAll("[data-parent]")
  .forEach(b => {

    b.onclick = () => {

      parent =
        b.dataset.parent === "true";

      document
        .querySelectorAll("[data-parent]")
        .forEach(x => {

          x.classList.toggle(
            "active",
            x === b
          );

        });

      calc();
    };

  });


// -------------------------
// 手動符
// -------------------------

$("manualOn").onchange = () => {

  $("manualFu").disabled =
    !$("manualOn").checked;

  calc();
};


$("manualFu").oninput = calc;


// -------------------------
// リセット
// -------------------------

$("reset").onclick = () => {

  ids.forEach(id => {
    $(id).value = 0;
  });

  $("janto").value =
    "役牌以外";

  $("machi").value =
    "両面";

  $("agari").value =
    "ツモ";

  $("special").value =
    "なし";

  han = 2;
  parent = false;

  $("han").textContent = 2;

  $("manualOn").checked = false;

  $("manualFu").value = "";

  $("manualFu").disabled = true;


  document
    .querySelectorAll("[data-parent]")
    .forEach((x, i) => {

      x.classList.toggle(
        "active",
        i === 0
      );

    });


  updateAgariSpecialOptions();

  calc();
};


// -------------------------
// 初期化
// -------------------------

updateAgariSpecialOptions();

calc();


// -------------------------
// PWA Service Worker
// -------------------------

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker.register("sw.js");

  });

}
