const $=id=>document.getElementById(id);
const ids=["ankoC","ankoY","minkoC","minkoY","ankanC","ankanY","minkanC","minkanY"];
function fill(id){const s=$(id);s.innerHTML="";for(let i=0;i<=4;i++){const o=document.createElement("option");o.value=i;o.textContent=i;s.appendChild(o)}}
ids.forEach(fill);
let han=2,parent=false;
function ceil100(x){return Math.ceil(x/100)*100}
function fmt(x){return Number.isInteger(x)?x.toLocaleString("ja-JP"):x.toLocaleString("ja-JP",{maximumFractionDigits:2})}

function updateAgariSpecialOptions(){
 const agari=$("agari");
 const special=$("special");
 Array.from(special.options).forEach(o=>{
   o.disabled=(agari.value==="ツモ" && o.value==="門前ロン") || (agari.value==="ロン" && o.value==="平和ツモ");
 });
 Array.from(agari.options).forEach(o=>{
   o.disabled=(special.value==="平和ツモ" && o.value==="ロン") || (special.value==="門前ロン" && o.value==="ツモ");
 });
 if((agari.value==="ツモ" && special.value==="門前ロン") || (agari.value==="ロン" && special.value==="平和ツモ")){
   special.value="なし";
   updateAgariSpecialOptions();
 }
}

function calc(){
 const C3=+$("ankoC").value,D3=+$("ankoY").value,C4=+$("minkoC").value,D4=+$("minkoY").value;
 const C5=+$("ankanC").value,D5=+$("ankanY").value,C6=+$("minkanC").value,D6=+$("minkanY").value;
 const mentsu=(C3*4)+(D3*8)+(C4*2)+(D4*4)+(C5*16)+(D5*32)+(C6*8)+(D6*16);
 const janto=$("janto").value.includes("以外")?0:2;
 const machi=(["両面","シャンポン"].includes($("machi").value))?0:2;
 const agari=$("agari").value.includes("ロン")?0:2;
 const subtotal=Math.ceil((mentsu+janto+machi+agari)/10)*10;
 let fu;
 if($("manualOn").checked && $("manualFu").value!=="") fu=+$("manualFu").value;
 else if($("special").value.includes("七対子")) fu=25;
 else if($("special").value.includes("平和ツモ")) fu=0;
 else if($("special").value.includes("門前ロン")) fu=subtotal+10;
 else fu=subtotal;
 if(!($("manualOn").checked && $("manualFu").value!=="")) fu+=20;

 const base=(parent?48:32)*fu*Math.pow(2,han-1);
 let score;
 if(ceil100(base)>=(parent?12000:8000)) score="満貫";
 else if($("agari").value.includes("ロン")) score=fmt(ceil100(base));
 else if(parent) score=fmt(ceil100(ceil100(base)/3))+"オール";
 else score=fmt(ceil100(ceil100(base)/4))+"-"+fmt(ceil100(ceil100(base)/2));

 const unit=(parent?6:4)*fu*Math.pow(2,han+2);
 let aoten;
 if($("agari").value.includes("ロン")) aoten=fmt(unit);
 else if(parent) aoten=fmt(unit/3)+"オール";
 else aoten=fmt(unit/4)+"-"+fmt(unit/2);

 $("mentsuFu").textContent=mentsu+"符";
 $("subtotal").textContent=subtotal+"符";
 $("fu").textContent=fu+"符";
 $("score").textContent=score;
 $("aoten").textContent=aoten;
}
ids.forEach(id=>$(id).addEventListener("change",calc));
["janto","machi"].forEach(id=>$(id).addEventListener("change",calc));
$("agari").addEventListener("change",()=>{updateAgariSpecialOptions();calc()});
$("special").addEventListener("change",()=>{updateAgariSpecialOptions();calc()});
$("minus").onclick=()=>{han=Math.max(1,han-1);$("han").textContent=han;calc()};
$("plus").onclick=()=>{han++;$("han").textContent=han;calc()};
document.querySelectorAll("[data-parent]").forEach(b=>b.onclick=()=>{parent=b.dataset.parent==="true";document.querySelectorAll("[data-parent]").forEach(x=>x.classList.toggle("active",x===b));calc()});
$("manualOn").onchange=()=>{$("manualFu").disabled=!$("manualOn").checked;calc()};
$("manualFu").oninput=calc;
$("reset").onclick=()=>{ids.forEach(id=>$(id).value=0);$("janto").value="役牌以外";$("machi").value="両面";$("agari").value="ツモ";$("special").value="なし";han=2;parent=false;$("han").textContent=2;$("manualOn").checked=false;$("manualFu").value="";$("manualFu").disabled=true;document.querySelectorAll("[data-parent]").forEach((x,i)=>x.classList.toggle("active",i===0));updateAgariSpecialOptions();calc()};
updateAgariSpecialOptions();
calc();
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
