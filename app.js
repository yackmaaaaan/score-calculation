const $ = id => document.getElementById(id);

const ids = ["ankoC","ankoY","minkoC","minkoY","ankanC","ankanY","minkanC","minkanY"];

// Excel側の入力規則を想定し、面子数は0～4。
function fill(id){
  const s = $(id);
  s.innerHTML = "";
  for(let i=0;i<=4;i++){
    const o=document.createElement("option");
    o.value=i;
    o.textContent=i;
    s.appendChild(o);
  }
}
ids.forEach(fill);

let han = 2;
let parent = false;

// Excel ROUNDUP(number,-2) と同じ結果になる、非負数専用の切り上げ。
function roundUp100(x){
  return Math.ceil(x / 100) * 100;
}

// ExcelのGeneral表示に近づけるため、計算値は必要以上に丸めない。
function displayNumber(x){
  if (Object.is(x, -0) || x === 0) return "0";
  if (Number.isInteger(x)) return x.toLocaleString("ja-JP");
  return String(x);
}

// Excelの文字列連結時の数値表示に合わせ、整数は .0 を付けない。
function concatNumber(x){
  if (Object.is(x, -0) || x === 0) return "0";
  return Number.isInteger(x) ? String(x) : String(x);
}

function getSpecialFu(subtotal){
  const special = $("special").value;
  if (special.includes("七対子")) return 25;
  if (special.includes("平和ツモ")) return 0;
  if (special.includes("門前ロン")) return subtotal + 10;
  return subtotal;
}

function calculate(){
  // Excel C3:D6
  const C3 = +$("ankoC").value;
  const D3 = +$("ankoY").value;
  const C4 = +$("minkoC").value;
  const D4 = +$("minkoY").value;
  const C5 = +$("ankanC").value;
  const D5 = +$("ankanY").value;
  const C6 = +$("minkanC").value;
  const D6 = +$("minkanY").value;

  // B12 = ((C3*4)+(D3*8)+(C4*2)+(D4*4)+(C5*16)+(D5*32)+(C6*8)+(D6*16))
  const mentsuFu =
    (C3*4) + (D3*8) + (C4*2) + (D4*4) +
    (C5*16) + (D5*32) + (C6*8) + (D6*16);

  // B13 = IF(COUNTIF(B7,"*以外*"),0,2)
  const jantoFu = $("janto").value.includes("以外") ? 0 : 2;

  // B14 = IF(OR(COUNTIF(B8,"*両面*"),COUNTIF(B8,"*シャンポン*")),0,2)
  const machiValue = $("machi").value;
  const machiFu = (machiValue.includes("両面") || machiValue.includes("シャンポン")) ? 0 : 2;

  // B15 = IF(COUNTIF(B9,"*ロン*"),0,2)
  const agariFu = $("agari").value.includes("ロン") ? 0 : 2;

  // B16 = ROUNDUP(SUM(B12:B15),-1)
  const subtotal = Math.ceil((mentsuFu + jantoFu + machiFu + agariFu) / 10) * 10;

  // B17 = 特殊上がりの計算結果 + 20
  const calculatedFu = getSpecialFu(subtotal) + 20;

  // D17が空欄ならB17、入力されていればD17をそのまま使用。
  // ※ここが前版との重要な修正点。手動符にさらに20符を足さない。
  const manualValue = $("manualFu").value.trim();
  const hasManualFu = $("manualOn").checked && manualValue !== "";
  const scoreFu = hasManualFu ? +manualValue : calculatedFu;

  // B21: 通常の点数計算（Excel式をそのままロジック化）
  const base = (parent ? 48 : 32) * scoreFu * Math.pow(2, han - 1);
  let score;
  if (roundUp100(base) >= (parent ? 12000 : 8000)) {
    // 5飜以上など、Excel本来の満貫判定。
    score = "満貫";
  } else if ($("agari").value.includes("ロン")) {
    score = roundUp100(base);
  } else if (parent) {
    score = roundUp100(roundUp100(base) / 3) + "オール";
  } else {
    score = roundUp100(roundUp100(base) / 4) + "-" + roundUp100(roundUp100(base) / 2);
  }

  // 追加仕様：6～12飜、13飜以上は通常点数欄を役満系表示に置換。
  // 青天井欄はこの判定の影響を受けない。
  if (han >= 13) score = "数え役満";
  else if (han >= 11) score = "三倍満";
  else if (han >= 8) score = "倍満";
  else if (han >= 6) score = "跳満";

  // B22: 青天井計算。ここはExcel式の計算をそのまま維持。
  const aotenBase = (parent ? 6 : 4) * scoreFu * Math.pow(2, han + 2);
  let aoten;
  if ($("agari").value.includes("ロン")) {
    aoten = aotenBase;
  } else if (parent) {
    aoten = concatNumber(aotenBase / 3) + "オール";
  } else {
    aoten = concatNumber(aotenBase / 4) + "-" + concatNumber(aotenBase / 2);
  }

  $("mentsuFu").textContent = mentsuFu + "符";
  $("subtotal").textContent = subtotal + "符";
  $("fu").textContent = scoreFu + "符";
  $("score").textContent = typeof score === "number" ? displayNumber(score) : score;
  $("aoten").textContent = typeof aoten === "number" ? displayNumber(aoten) : aoten;
}

ids.forEach(id => $(id).addEventListener("change", calculate));
["janto","machi","agari","special"].forEach(id => $(id).addEventListener("change", calculate));

$("minus").onclick = () => {
  han = Math.max(1, han - 1);
  $("han").textContent = han;
  calculate();
};

$("plus").onclick = () => {
  han += 1;
  $("han").textContent = han;
  calculate();
};

document.querySelectorAll("[data-parent]").forEach(button => {
  button.onclick = () => {
    parent = button.dataset.parent === "true";
    document.querySelectorAll("[data-parent]").forEach(x => x.classList.toggle("active", x === button));
    calculate();
  };
});

$("manualOn").onchange = () => {
  $("manualFu").disabled = !$("manualOn").checked;
  calculate();
};
$("manualFu").oninput = calculate;

$("reset").onclick = () => {
  ids.forEach(id => $(id).value = 0);
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
  document.querySelectorAll("[data-parent]").forEach((x,i) => x.classList.toggle("active", i === 0));
  calculate();
};

calculate();

if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}
