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


/* ========================================
   上がり・特殊上がりの選択制限
   ======================================== */

const AGARI_OPTIONS = [
  ["ツモ", "ツモ"],
  ["ロン", "ロン"]
];

const SPECIAL_OPTIONS = [
  ["なし", "なし"],
  ["七対子", "七対子"],
  ["平和ツモ", "平和ツモ"],
  ["門前ロン", "門前ロン"]
];

function updateAgariSpecialOptions() {

  const agari = $("agari");
  const special = $("special");

  const currentAgari = agari.value;
  const currentSpecial = special.value;

  /*
   * 上がり
   *
   * 特殊上がりが平和ツモ → ロンを除外
   * 特殊上がりが門前ロン → ツモを除外
   */
  agari.innerHTML = "";

  AGARI_OPTIONS.forEach(([value, text]) => {

    if (
      (currentSpecial === "平和ツモ" && value === "ロン") ||
      (currentSpecial === "門前ロン" && value === "ツモ")
    ) {
      return;
    }

    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;

    agari.appendChild(option);
  });


  /*
   * 特殊上がり
   *
   * 上がりがツモ → 門前ロンを除外
   * 上がりがロン → 平和ツモを除外
   */
  special.innerHTML = "";

  SPECIAL_OPTIONS.forEach(([value, text]) => {

    if (
      (currentAgari === "ツモ" && value === "門前ロン") ||
      (currentAgari === "ロン" && value === "平和ツモ")
    ) {
      return;
    }

    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;

    special.appendChild(option);
  });


  /*
   * 現在の選択が残っていれば維持。
   * 残っていなければ安全な値に戻す。
   */

  if (
    Array.from(agari.options)
      .some(o => o.value === currentAgari)
  ) {
    agari.value = currentAgari;
  } else {
    agari.value = "ツモ";
  }


  if (
    Array.from(special.options)
      .some(o => o.value === currentSpecial)
  ) {
    special.value = currentSpecial;
  } else {
    special.value = "なし";
  }
}


/* ========================================
   メイン計算
   ======================================== */

function calc() {

  const C3 = +$("ankoC").value;
  const D3 = +$("ankoY").value;

  const C4 = +$("minkoC").value;
  const D4 = +$("minkoY").value;

  const C5 = +$("ankanC").value;
  const D5 = +$("ankanY").value;

  const C6 = +$("minkanC").value;
  const D6 = +$("minkanY").value;


  /* B12：面子符 */

  const mentsu =
    (C3 * 4) +
    (D3 * 8) +
    (C4 * 2) +
    (D4 * 4) +
    (C5 * 16) +
    (D5 * 32) +
    (C6 * 8) +
    (D6 * 16);


  /* B13：雀頭符 */

  const janto =
    $("janto").value.includes("以外")
      ? 0
      : 2;


  /* B14：待ち符 */

  const machi =
    ["両面", "シャンポン"].includes($("machi").value)
      ? 0
      : 2;


  /* B15：上がり符 */

  const agari =
    $("agari").value.includes("ロン")
      ? 0
      : 2;


  /* B16：10符単位に切り上げ */

  const subtotal =
    Math.ceil(
      (mentsu + janto + machi + agari) / 10
    ) * 10;


  /* B17：符 */

  let calculatedFu;

  if ($("special").value.includes("七対子")) {

    calculatedFu = 25;

  } else if ($("special").value.includes("平和ツモ")) {

    calculatedFu = 0;

  } else if ($("special").value.includes("門前ロン")) {

    calculatedFu = subtotal + 10;

  } else {

    calculatedFu = subtotal;
  }


  /* 手動符 */

  const manual =
    $("manualOn").checked &&
    $("manualFu").value !== "";

  let fu;

  if (manual) {

    fu = +$("manualFu").value;

  } else {

    fu = calculatedFu + 20;
  }


  /* ========================================
     通常点数
     ======================================== */

  const base =
    (parent ? 48 : 32) *
    fu *
    Math.pow(2, han - 1);

  let score;


  /* 飜数による表示 */

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

    score = "満貫";

  } else if (
    $("agari").value.includes("ロン")
  ) {

    score = fmt(ceil100(base));

  } else if (parent) {

    score =
      fmt(
        ceil100(
          ceil100(base) / 3
        )
      ) + "オール";

  } else {

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


  /* ========================================
     青天井
     ======================================== */

  const unit =
    (parent ? 6 : 4) *
    fu *
    Math.pow(2, han + 2);

  let aoten;

  if ($("agari").value.includes("ロン")) {

    aoten = fmt(unit);

  } else if (parent) {

    aoten =
      fmt(unit / 3) +
      "オール";

  } else {

    aoten =
      fmt(unit / 4) +
      "-" +
      fmt(unit / 2);
  }


  /* ========================================
     表示
     ======================================== */

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


/* ========================================
   イベント
   ======================================== */

ids.forEach(id => {
  $(id).addEventListener("change", calc);
});

["janto", "machi"].forEach(id => {
  $(id).addEventListener("change", calc);
});


$("agari").addEventListener("change", () => {

  updateAgariSpecialOptions();
  calc();

});


$("special").addEventListener("change", () => {

  updateAgariSpecialOptions();
  calc();

});


/* 飜数 */

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


/* 親・子 */

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


/* 手動符 */

$("manualOn").onchange = () => {

  $("manualFu").disabled =
    !$("manualOn").checked;

  calc();
};

$("manualFu").oninput = calc;


/* ========================================
   リセット
   ======================================== */

$("reset").onclick = () => {

  ids.forEach(id => {
    $(id).value = 0;
  });

  $("janto").value = "役牌以外";
  $("machi").value = "両面";

  $("agari").value = "ツモ";
  $("special").value = "なし";

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


/* ========================================
   初期化
   ======================================== */

updateAgariSpecialOptions();
calc();


/* ========================================
   PWA Service Worker
   ======================================== */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker.register(
      "sw.js"
    );

  });

}
