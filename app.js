const T=["1m","2m","3m","4m","5m","6m","7m","8m","9m","1p","2p","3p","4p","5p","6p","7p","8p","9p","1s","2s","3s","4s","5s","6s","7s","8s","9s","1z","2z","3z","4z","5z","6z","7z"];
const N={"1m":"一萬","2m":"二萬","3m":"三萬","4m":"四萬","5m":"五萬","6m":"六萬","7m":"七萬","8m":"八萬","9m":"九萬","1p":"一筒","2p":"二筒","3p":"三筒","4p":"四筒","5p":"五筒","6p":"六筒","7p":"七筒","8p":"八筒","9p":"九筒","1s":"一索","2s":"二索","3s":"三索","4s":"四索","5s":"白","6s":"發","7s":"中"};
const id=t=>T.indexOf(t), su=t=>t[1], no=t=>+t[0], hon=t=>su(t)==="z", ter=t=>!hon(t)&&(no(t)==1||no(t)==9), sim=t=>!hon(t)&&no(t)>=2&&no(t)<=8, seq=g=>g.length==3&&!g.every(x=>x==g[0])&&no(g[0])+1==no(g[1])&&no(g[1])+1==no(g[2]), trip=g=>g.length==3&&g.every(x=>x==g[0]);
const cnt=a=>{let c=Array(34).fill(0);a.forEach(x=>c[id(x)]++);return c}, img=t=>`tiles/${t}.svg`, $=x=>document.getElementById(x);
let hand=[],melds=[],win=null, red=new Set(),dora=[],ura=[], edit=null, dealer=false, mh=2;

function B(t,fn,cls="chosen"){let b=document.createElement("button");b.className=cls;b.title=N[t]||t;let i=document.createElement("img");i.src=img(t);i.alt=N[t]||t;b.append(i);b.onclick=fn;return b}
function renderTiles(){let g=$("tileGrid");g.innerHTML="";T.forEach(t=>g.append(Object.assign(B(t,()=>addTile(t),"tilebtn"),{title:N[t]})));renderHand();renderWin();renderDora();renderUra()}
function addTile(t){if(hand.length>=14)return;if(cnt(hand)[id(t)]>=4)return;hand.push(t);renderHand();renderWin();analyze()}
function renderHand(){let e=$("hand");e.innerHTML="";hand.forEach((t,i)=>e.append(B(t,()=>{hand.splice(i,1);if(win===t&&!hand.includes(t))win=null;renderHand();renderWin();analyze()})));$("handCount").textContent=hand.length}
function renderWin(){let e=$("winChoices");e.innerHTML="";[...new Set(hand)].forEach(t=>e.append(Object.assign(B(t,()=>{win=t;renderWin();analyze()}),{className:"chosen"+(win===t?" selected":"")})))}
function renderMelds(){let e=$("meldList");e.innerHTML="";melds.forEach((m,i)=>{let r=document.createElement("div");r.className="meldRow";r.innerHTML=`<b>${m.type=="chi"?"チー":m.type=="pon"?"ポン":m.type=="ankan"?"暗槓":"明槓"}</b>`;m.tiles.forEach(t=>r.append(B(t,()=>{})));let d=document.createElement("button");d.textContent="削除";d.onclick=()=>{melds.splice(i,1);renderMelds();analyze()};r.append(d);e.append(r)})}
function openMeld(type){edit={type,tiles:[]};let e=$("meldEditor");e.classList.remove("hidden");e.innerHTML="<b>副露牌を選択</b><div id='editTiles' class='tiles'></div><div id='editPick' class='tile-grid'></div><button id='addMeld' class='wide'>副露を確定</button>";T.forEach(t=>$("editPick").append(B(t,()=>{let n=type=="chi"||type=="pon"?3:4;if(edit.tiles.length<n&&edit.tiles.filter(x=>x==t).length<4){edit.tiles.push(t);renderEdit()}},"tilebtn")));renderEdit();$("addMeld").onclick=finishMeld}
function renderEdit(){let e=$("editTiles");e.innerHTML="";edit.tiles.forEach((t,i)=>e.append(B(t,()=>{edit.tiles.splice(i,1);renderEdit()})))}
function finishMeld(){let n=edit.type=="chi"||edit.type=="pon"?3:4;if(edit.tiles.length!==n)return alert(n+"枚選択してね");if(edit.type=="chi"){let a=edit.tiles.map(id).sort((a,b)=>a-b);if(a.some(i=>hon(T[i]))||!(a[1]==a[0]+1&&a[2]==a[1]+1))return alert("チーは同じ種類の連続3枚");}else if(new Set(edit.tiles).size!==1)return alert("同じ牌を選択してね");melds.push({...edit});edit=null;$("meldEditor").classList.add("hidden");renderMelds();analyze()}
document.querySelectorAll(".meldBtns button").forEach(b=>b.onclick=()=>openMeld(b.dataset.type));
function pickUI(el,arr,setter){let e=$(el);e.innerHTML="";T.forEach(t=>{let b=B(t,()=>{let i=arr.indexOf(t);if(i>=0)arr.splice(i,1);else arr.push(t);setter();});if(arr.includes(t))b.classList.add("selected");e.append(b)})}
function renderDora(){pickUI("doraPicker",dora,renderDora)}function renderUra(){pickUI("uraPicker",ura,renderUra)}
function doraOf(t){if(hon(t)){let n=no(t);return T[26+(n==7?1:n)]}let n=no(t),s=su(t);return `${n==9?1:n+1}${s}`}
function doraCount(){let h=0;dora.forEach(x=>{let d=doraOf(x);h+=hand.filter(t=>t==d).length+melds.flatMap(m=>m.tiles).filter(t=>t==d).length});red.forEach(t=>{h+=allTiles().filter(x=>x==t).length});if($("uraEnabled").checked&&$("riichi").checked)ura.forEach(x=>{let d=doraOf(x);h+=allTiles().filter(t=>t==d).length});return h}
function allTiles(){return hand.concat(melds.flatMap(m=>m.tiles))}
function closed(){return melds.length===0}
function chiitoi(){return closed()&&hand.length==14&&cnt(hand).filter(x=>x==2).length==7}
function kokushi(){if(!closed()||hand.length!=14)return false;let req=T.filter(x=>hon(x)||ter(x));let c=cnt(hand);return req.every(x=>c[id(x)]>=1)&&req.some(x=>c[id(x)]>=2)}
function kokushi13(){if(!kokushi())return false;let req=T.filter(x=>hon(x)||ter(x));let c=cnt(hand);return req.every(x=>c[id(x)]==1||c[id(x)]==2)&&req.filter(x=>c[id(x)]==2).length==1}
function decomps(a){
 let c=cnt(a),out=[];
 function rec(x,g){let p=x.findIndex(v=>v);if(p<0){out.push(g.map(z=>z.slice()));return}let t=T[p];if(x[p]>=3){x[p]-=3;rec(x,g.concat([[t,t,t]]));x[p]+=3}
 if(!hon(t)&&no(t)<=7){let ii=[p,p+1,p+2],ts=ii.map(i=>T[i]);if(su(ts[0])==su(ts[1])&&su(ts[1])==su(ts[2])&&ii.every(i=>x[i]>0)){ii.forEach(i=>x[i]--);rec(x,g.concat([ts]));ii.forEach(i=>x[i]++)}}}
 for(let p=0;p<34;p++)if(c[p]>=2){c[p]-=2;let before=out.length;rec(c,[]);for(let i=before;i<out.length;i++)out[i].pair=[T[p],T[p]];c[p]+=2}return out
}
function fixedGroups(){return melds.map(m=>m.tiles)}
function isOpenMeld(m){return m.type=="chi"||m.type=="pon"||m.type=="minkan"}
function everyTile(f){return f.flat().concat(f.pair||[])}
function shapeData(d){
 let gs=d.groups, pair=d.pair, all=everyTile(d).concat(...fixedGroups());
 let seqs=gs.filter(seq), trips=gs.filter(trip).concat(fixedGroups().filter(g=>g.length==3&&trip(g))), kans=melds.filter(m=>m.type=="ankan"||m.type=="minkan");
 return {gs,pair,all,seqs,trips,kans}
}
function addY(arr,n,h,tag=""){if(!arr.some(x=>x[0]==n))arr.push([n,h,tag])}
function calcYaku(d){
 let r=[],s=shapeData(d),all=s.all,seqs=s.seqs,trips=s.trips,kans=s.kans;
 const open=!closed();
 if($("tenhou").checked){addY(r,"天和",13,"yakuman")} if($("chiihou").checked){addY(r,"地和",13,"yakuman")}
 if($("doubleRiichi").checked&&closed())addY(r,"ダブル立直",2);else if($("riichi").checked&&closed())addY(r,"立直",1);
 if($("ippatsu").checked&&closed())addY(r,"一発",1);
 if($("winMethod").value=="tsumo"&&closed())addY(r,"門前清自摸和",1);
 if($("rinshan").checked)addY(r,"嶺上開花",1);if($("chankan").checked)addY(r,"槍槓",1);if($("haitei").checked)addY(r,"海底摸月",1);if($("houtei").checked)addY(r,"河底撈魚",1);
 if(!open || $("openTanyao").checked){if(all.every(sim))addY(r,"断么九",1)}
 if(chiitoi())addY(r,"七対子",2);
 // pinfu
 let allSeq=gs=>gs.length==4&&gs.every(seq), pairNoY=!(["5z","6z","7z",$("seat").value,$("round").value].includes(s.pair[0]));
 let ryanmen=win && seqs.some(g=>g.includes(win)&&((no(g[0])==2&&win==g[2])||(no(g[0])==3&&win==g[0])||(no(g[0])>2&&no(g[0])<8&&win!=g[1])));
 if(closed()&&allSeq(s.gs)&&pairNoY&&ryanmen)addY(r,"平和",1);
 if(closed()){let keys=seqs.map(g=>g.join(","));let dup=keys.some((k,i)=>keys.indexOf(k)!=i);if(dup)addY(r,"一盃口",1)}
 // yakuhai
 trips.forEach(g=>{if(["5z","6z","7z"].includes(g[0]))addY(r,"役牌",1);if(g[0]==$("seat").value)addY(r,"自風牌",1);if(g[0]==$("round").value)addY(r,"場風牌",1)});
 // sanshoku doujun
 for(let n=1;n<=7;n++)if(["m","p","s"].every(x=>seqs.some(g=>g[0]==`${n}${x}`))){addY(r,"三色同順",closed()?2:1);break}
 // ittsu
 for(let x of ["m","p","s"])if([1,4,7].every(n=>seqs.some(g=>g[0]==`${n}${x}`))){addY(r,"一気通貫",closed()?2:1);break}
 // sanshoku dokou
 for(let n=1;n<=9;n++)if(["m","p","s"].every(x=>trips.some(g=>g[0]==`${n}${x}`))){addY(r,"三色同刻",2);break}
 // toitoi / sanankou
 if(trips.length==4)addY(r,"対々和",2);
 let concealedTrip=gs.filter(g=>trip(g)).length+melds.filter(m=>m.type=="ankan").length;if(concealedTrip>=3)addY(r,"三暗刻",2);
 if(kans.length==3)addY(r,"三槓子",2);
 // chanta/junchan
 let everyGroupHasY=[...gs,...fixedGroups()].every(g=>g.some(x=>ter(x)||hon(x)))&& (ter(s.pair[0])||hon(s.pair[0]));
 let hasHonor=all.some(hon),hasTerm=all.some(ter);
 if(everyGroupHasY&&seqs.length>0)addY(r,hasHonor?"混全帯么九":"純全帯么九",closed()?(hasHonor?2:3):(hasHonor?1:2));
 if(all.every(x=>ter(x)||hon(x))){if(all.every(ter))addY(r,"清老頭",13,"yakuman");else if(all.every(hon))addY(r,"字一色",13,"yakuman");else addY(r,"混老頭",2)}
 // shousangen/daisangen
 let dragons=["5z","6z","7z"],dt=dragons.filter(x=>trips.some(g=>g[0]==x)).length,dp=dragons.includes(s.pair[0]);if(dt==2&&dp)addY(r,"小三元",2);if(dt==3)addY(r,"大三元",13,"yakuman");
 // winds
 let winds=["1z","2z","3z","4z"],wt=winds.filter(x=>trips.some(g=>g[0]==x)).length,wp=winds.includes(s.pair[0]);if(wt==3&&wp)addY(r,"小四喜",13,"yakuman");if(wt==4)addY(r,"大四喜",13,"yakuman");
 // flush
 let ns=new Set(all.filter(x=>!hon(x)).map(su));if(ns.size==1){if(hasHonor)addY(r,"混一色",closed()?3:2);else addY(r,"清一色",closed()?6:5)}
 // honroutou may coexist with toitoi; already handled
 // suuankou
 if(!open&&gs.filter(trip).length==4){if(win&&s.pair[0]==win)addY(r,"四暗刻単騎",26,"yakuman2");else addY(r,"四暗刻",13,"yakuman")}
 // suukantsu
 if(kans.length==4)addY(r,"四槓子",13,"yakuman");
 // ryuuiisou
 if(all.every(x=>["2s","3s","4s","6s","8s","6z"].includes(x)))addY(r,"緑一色",13,"yakuman");
 // chuuren
 if(closed()&&all.length==14&&new Set(all.map(su)).size==1&&!hasHonor){let s0=su(all[0]),c=cnt(all),base=[1,1,1,2,2,2,3,3,3].map((n,i)=>n);let ok=true;for(let n=1;n<=9;n++){let need=(n==1||n==9)?3:1;if(c[id(`${n}${s0}`)]<need)ok=false}if(ok){let nine=win&&all.filter(x=>x==win).length==2&&all.every(x=>su(x)==s0)&&[1,9].every(n=>c[id(`${n}${s0}`)]>=3);addY(r,nine?"九蓮宝燈（純正）":"九蓮宝燈",nine?26:13,"yakuman")}}
 if(kokushi()){addY(r,kokushi13()?"国士無双十三面待ち":"国士無双",kokushi13()?26:13,"yakuman")}
 return r
}
function fuCalc(d){
 if(chiitoi())return 25;let f=20,s=shapeData(d),open=!closed();
 if($("winMethod").value=="ron"&&closed())f+=10;
 s.gs.forEach(g=>{if(trip(g)){let term=ter(g[0])||hon(g[0]);f+=term?4:2}});
 melds.forEach(m=>{if(m.type=="chi")return;let term=ter(m.tiles[0])||hon(m.tiles[0]);if(m.type=="ankan")f+=term?32:16;else f+=term?16:8});
 if(["5z","6z","7z",$("seat").value,$("round").value].includes(s.pair[0]))f+=2;if($("doubleWind4").checked&&s.pair[0]==$("seat").value&&s.pair[0]==$("round").value)f+=2;
 if(win&&s.pair[0]==win)f+=2;
 // wait fu: find a sequence containing winning tile that can be completed by it
 s.gs.filter(seq).forEach(g=>{if(!win||!g.includes(win))return;let n=no(win),a=no(g[0]);if((a==1&&n==3)||(a==7&&n==7)||(n==a+1)){}});
 let waitFu=false;
 s.gs.filter(seq).forEach(g=>{if(!win||!g.includes(win))return;let a=no(g[0]),n=no(win);if((a==1&&n==3)||(a==7&&n==7)||(n==a+1))waitFu=true});
 if(waitFu)f+=2;
 if($("winMethod").value=="tsumo")f+=2;
 // pinfu tsumo special 20 fu
 let y=calcYaku(d);if(y.some(x=>x[0]=="平和")&&$("winMethod").value=="tsumo")f=20;
 return Math.ceil(f/10)*10
}
function score(h,fu){
 let basic;
 if(h>=13&&$("kazoe").checked)basic=8000;
 else if(h>=11)basic=6000;else if(h>=8)basic=4000;else if(h>=6)basic=3000;else if(h>=5)basic=2000;else {basic=fu*Math.pow(2,h+2);if($("kiriage").checked&&((h==4&&fu==30)||(h==3&&fu==60)))basic=2000;basic=Math.min(2000,basic)}
 basic=Math.ceil(basic/100)*100;
 let d=$("dealer").value=="true";if($("winMethod").value=="ron")return `${d?basic*6:basic*4}点`;return d?`${basic*2}点オール`:`${basic} / ${basic*2}点`;
}
function aoten(h,fu){return Math.ceil(fu*Math.pow(2,h+2)/100)*100}
function analyze(){
 let st=$("status"),res=$("yakuResult");res.innerHTML="";$("totalHan").textContent="—";$("totalFu").textContent="—";$("autoScore").textContent="—";$("autoAoten").textContent="—";
 let total=hand.length+melds.reduce((a,m)=>a+m.tiles.length,0);if(total!=14){st.className="status";st.textContent=`牌が${total}枚。14枚にしてね`;return}if(!win){st.className="status";st.textContent="和了牌を選択してね";return}
 if(kokushi()||chiitoi()){let d={groups:[],pair:null};let y=calcYaku(d);finish(y,25);return}
 let need=4-melds.length;if(need<0)return;let ds=decomps(hand);let best=null;
 ds.forEach(d=>{let y=calcYaku(d), yak=y.filter(x=>x[2]?.startsWith("yakuman"));let h=y.reduce((a,x)=>a+x[1],0)+doraCount();let fu=fuCalc(d);let valid=y.length>0;let ym=yak.reduce((a,x)=>a+(x[1]/13),0);if(valid&&(!best||ym>best.ym||(ym==best.ym&&(h*100+fu>best.h*100+best.fu))))best={d,y,h,fu,ym}});
 if(!best){st.className="status err";st.textContent="役がないか、牌姿を作れないよ";return}
 finish(best.y,best.fu,best)
}
function finish(y,fu,best){
 let doraH=doraCount(),h=y.reduce((a,x)=>a+x[1],0)+doraH, yak=y.filter(x=>x[2]?.startsWith("yakuman")), ym=yak.reduce((a,x)=>a+(x[1]/13),0);
 $("status").className="status ok";$("status").textContent=ym>=1?`${ym}倍相当の役満判定`:"判定完了";
 $("yakuResult").innerHTML=y.map(x=>`<div class="yaku"><span>${x[0]}</span><b>${x[1]==26?"ダブル役満":x[1]==13?"役満":x[1]+"飜"}</b></div>`).join("")+(doraH?`<div class="yaku"><span>ドラ（赤・裏を含む）</span><b>${doraH}飜</b></div>`:"");
 $("totalHan").textContent=ym>=1?"役満":h+"飜";$("totalFu").textContent=ym>=1?"—":fu+"符";
 if(ym>=1){let base=8000*ym,d=$("dealer").value=="true";$("autoScore").textContent=$("winMethod").value=="ron"?base*(d?1.5:1)+"点":(d?base/4000*2:base/8000);$("autoScore").textContent=$("winMethod").value=="ron"?Math.round(base*(d?1.5:1))+"点":(d?Math.round(base/4)+" / "+Math.round(base/2)+"点":"");}
 else {$("autoScore").textContent=score(h,fu);$("autoAoten").textContent=aoten(h,fu)+"点"}
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tabpane").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")});
$("clearHand").onclick=()=>{hand=[];win=null;renderHand();renderWin();analyze()};$("resetAll").onclick=()=>location.reload();
["seat","round","dealer","winMethod","riichi","doubleRiichi","ippatsu","rinshan","chankan","haitei","houtei","tenhou","chiihou","uraEnabled","kiriage","kazoe","doubleYakuman","openTanyao","doubleWind4","red5m","red5p","red5s"].forEach(id=>$(id).addEventListener("change",()=>{if(id.startsWith("red5")){let t=id=="red5m"?"5m":id=="red5p"?"5p":"5s";if($(id).checked)red.add(t);else red.delete(t)}analyze()}));

const specialSelect=$("specialYakuSelect"),specialToggle=specialSelect.querySelector(".multi-select-toggle"),specialCount=$("specialYakuCount");
function updateSpecialYakuLabel(){
  const ids=["riichi","doubleRiichi","ippatsu","rinshan","chankan","haitei","houtei","tenhou","chiihou"];
  const n=ids.filter(x=>$(x).checked).length;
  specialCount.textContent=n?`(${n}件選択中)`:"";
}
specialToggle.onclick=()=>{
  const open=specialSelect.classList.toggle("open");
  specialToggle.setAttribute("aria-expanded",open?"true":"false");
};
document.addEventListener("click",e=>{
  if(!specialSelect.contains(e.target)){
    specialSelect.classList.remove("open");
    specialToggle.setAttribute("aria-expanded","false");
  }
});
["riichi","doubleRiichi","ippatsu","rinshan","chankan","haitei","houtei","tenhou","chiihou"].forEach(x=>$(x).addEventListener("change",updateSpecialYakuLabel));
updateSpecialYakuLabel();
function manual(){let v=id=>+$("m_"+id).value,mf=v("ankoC")*4+v("ankoY")*8+v("minkoC")*2+v("minkoY")*4+v("ankanC")*16+v("ankanY")*32+v("minkanC")*8+v("minkanY")*16,sub=mf+($("m_janto").value=="役牌"?2:0)+(["両面","シャンポン"].includes($("m_machi").value)?0:2)+($("m_agari").value=="ロン"?0:2),sp=$("m_special").value,f=sp=="七対子"?25:sp=="平和ツモ"?20:sp=="門前ロン"?sub+10:sub+20;if($("m_manualOn").checked)f=+$("m_manualFu").value||0;$("m_mentsuFu").textContent=mf+"符";$("m_subtotal").textContent=sub+"符";$("m_fu").textContent=f+"符";let h=mh,b=h>=13?"数え役満":h>=11?"三倍満":h>=8?"倍満":h>=6?"跳満":h>=5?"満貫":"";let basic=b?0:Math.min(2000,f*Math.pow(2,h+2));$("m_score").textContent=b||($("m_agari").value=="ロン"?(dealer?basic*6:basic*4)+"点":(dealer?basic*2+"点オール":basic+" / "+basic*2+"点"));$("m_aoten").textContent=Math.ceil(f*Math.pow(2,h+2)/100)*100+"点"}
["ankoC","ankoY","minkoC","minkoY","ankanC","ankanY","minkanC","minkanY"].forEach(k=>{let s=$("m_"+k);for(let i=0;i<=4;i++)s.add(new Option(i,i));s.onchange=manual});["janto","machi","agari","special","manualOn","manualFu"].forEach(k=>$("m_"+k).addEventListener("change",manual));$("m_minus").onclick=()=>{mh=Math.max(0,mh-1);$("m_han").textContent=mh;manual()};$("m_plus").onclick=()=>{mh++;$("m_han").textContent=mh;manual()};document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".seg button").forEach(x=>x.classList.remove("active"));b.classList.add("active");dealer=b.dataset.parent=="true";manual()});
renderTiles();renderMelds();manual();analyze();