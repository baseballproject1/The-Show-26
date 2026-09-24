(()=>{
"use strict";
const $=id=>document.getElementById(id);
const SAVEKEY="roadToMajors_rtts_final_v1";
let player=null, game=null, lang="ko";
const T={
ko:{new:"새 커리어",continue:"이어하기",start:"커리어 시작",train:"훈련 시작",draw:"장비 1회 뽑기",offer:"계약 선택",noSave:"저장 데이터가 없습니다."},
en:{new:"New Career",continue:"Continue",start:"Start Career",train:"Start Training",draw:"Draw Equipment",offer:"Choose Contract",noSave:"No save data."},
ja:{new:"新しいキャリア",continue:"続ける",start:"キャリア開始",train:"トレーニング",draw:"装備を引く",offer:"契約を選ぶ",noSave:"保存データがありません。"}
};
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active")}
function msg(s){$("gameMessage").textContent=s}
function defaultPlayer(){
  const stats={contact:0,power:0,clutch:0,running:0,defense:0};
  return {name:"Rookie",number:7,position:"CF",batHand:"R",throwHand:"R",tokens:250,stats,stage:0,team:0,level:1,xp:0,
    season:{games:0,ab:0,h:0,hr:0,rbi:0,bb:0,sb:0,errors:0,wins:0},
    career:{games:0,h:0,hr:0,rbi:0,bb:0,sb:0},salary:0,
    equipment:{glove:null,shoes:null,bat:null,battingGloves:null,protective:null},
    abs:2,nextOpponent:1,offers:[]};
}
function statTotal(){return Object.values(player.stats).reduce((a,b)=>a+b,0)}
function equipBonus(){return Object.values(player.equipment).reduce((sum,e)=>sum+(e?e.bonus:0),0)}
function ovr(){return Math.round(statTotal()/5+equipBonus()/5)}
function saveSlot(i){if(!player)return;localStorage.setItem(SAVEKEY+i,JSON.stringify(player));$("saveMessage").textContent=`슬롯 ${i+1} 저장 완료`}
function loadSlot(i){const s=localStorage.getItem(SAVEKEY+i);if(!s){$("saveMessage").textContent=T[lang].noSave;return}player=JSON.parse(s);render();show("dashboard");$("saveMessage").textContent=`슬롯 ${i+1} 불러오기 완료`}
function autosave(){if(player)localStorage.setItem(SAVEKEY+"0",JSON.stringify(player))}
function renderAllocator(){
  const box=$("statAllocator");box.innerHTML="";
  for(const k of GAME_DATA.stats){
    const row=document.createElement("div");row.className="stat-row";
    row.innerHTML=`<b>${GAME_DATA.statNames[k]}</b><div class="stat-bar"><div class="stat-fill" style="width:${clamp(player.stats[k]/100*100,0,100)}%"></div></div><span>${player.stats[k]}</span><button data-plus="${k}">+</button><button data-minus="${k}">−</button>`;
    box.appendChild(row);
  }
  box.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>{let k=b.dataset.plus;if(player.tokens>0){player.stats[k]++;player.tokens--;renderAllocator()}});
  box.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>{let k=b.dataset.minus;if(player.stats[k]>0&&player.stats[k]>0&&player.stats[k]>0){player.stats[k]--;player.tokens++;renderAllocator()}});
  $("tokenCount").textContent=player.tokens;
}
function render(){
  if(!player)return;
  $("dashName").textContent=`#${player.number} ${player.name} · ${player.position}`;
  $("dashTeam").textContent=`${GAME_DATA.teams[player.team][0]} · ${GAME_DATA.careerStages[player.stage]}`;
  $("careerLevel").textContent=`LEVEL ${player.level} · XP ${player.xp}`;
  $("dashOvr").textContent=`OVR ${ovr()}`;
  $("status").textContent=`$${player.salary.toLocaleString()} · ${GAME_DATA.careerStages[player.stage]}`;
  $("statsBox").innerHTML=GAME_DATA.stats.map(k=>`<div class="stat-row"><b>${GAME_DATA.statNames[k]}</b><div class="stat-bar"><div class="stat-fill" style="width:${clamp((player.stats[k]+getEquipFor(k))/1.5,0,100)}%"></div></div><span>${player.stats[k]+getEquipFor(k)}</span><span></span><span></span></div>`).join("");
  $("goalBox").innerHTML=`<p>다음 목표: ${player.stage<4?`마이너리그 승격 (${GAME_DATA.careerStages[player.stage+1]})`:"MLB 주전 경쟁"}</p><p>시즌 경기: ${player.season.games}</p>`;
  $("nextGameBox").innerHTML=`<div class="next-line"><span>상대: ${GAME_DATA.teams[player.nextOpponent][0]}</span><span>경기 ${player.season.games+1}</span><span>ABS ${player.abs}/2</span></div>`;
  $("salaryBox").textContent=`보유 연봉: $${player.salary.toLocaleString()}`;
  renderEquipment();renderSeason();renderAllocator();
}
function getEquipFor(k){return Object.values(player.equipment).reduce((s,e)=>s+(e&&e.stat===k?e.bonus:0),0)}
function renderEquipment(){
  $("equipmentBox").innerHTML=`<div class="equip-grid">${GAME_DATA.equipment.map(([id,n,stat])=>{const e=player.equipment[id];return `<div class="equip"><b>${n}</b><br>${e?`${e.rarity} +${e.bonus}`:"없음"}</div>`}).join("")}</div>`;
}
function renderSeason(){
  const s=player.season;
  $("seasonBox").innerHTML=`<p>시즌 ${player.level} · 경기 ${s.games} · 안타 ${s.h} · 홈런 ${s.hr} · 타점 ${s.rbi} · 볼넷 ${s.bb} · 도루 ${s.sb}</p>`;
}
function create(){
  player=defaultPlayer();
  player.name=$("playerName").value.trim()||"Rookie";player.number=clamp(Number($("playerNumber").value)||7,0,99);
  player.position=$("position").value;player.batHand=$("batHand").value.toUpperCase().startsWith("L")?"L":"R";player.throwHand=$("throwHand").value.toUpperCase().startsWith("L")?"L":"R";
  player.team=rnd(0,29);player.salary=0;render();show("dashboard");autosave();
}
function drawEquipment(){
  if(player.salary<10000){$("drawResult").textContent="장비 뽑기에는 최소 $10,000이 필요합니다.";return}
  player.salary-=10000;
  const [id,n,stat]=GAME_DATA.equipment[rnd(0,GAME_DATA.equipment.length-1)];
  const rr=rnd(1,100), r=rr<=45?0:rr<=75?1:rr<=91?2:rr<=98?3:4, def=GAME_DATA.rarities[r], bonus=rnd(def[1],def[2]);
  player.equipment[id]={rarity:def[0],bonus,stat,name:n};
  $("drawResult").innerHTML=`<div class="offer"><b>${n}</b> · ${def[0]} · +${bonus}<br>${GAME_DATA.statNames[stat]} 능력치에 적용됩니다.</div>`;
  render();autosave();
}
function train(){
  const success=Math.random()<0.78;
  $("trainingResult").textContent=success?"훈련 성공! 토큰 +1":"훈련 실패. 다음 훈련에서 다시 도전하세요.";
  if(success){player.tokens++;player.xp+=10;if(player.xp>=100){player.xp-=100;player.level++}}
  render();autosave();
}
function negotiate(){
  if(player.season.games<10){$("offers").innerHTML="<p>시즌 경기를 10경기 이상 진행해야 연봉협상을 할 수 있습니다.</p>";return}
  const base=15000+player.level*10000+ovr()*1000;
  player.offers=[{team:player.team,salary:base+ rnd(-5000,12000)},{team:rnd(0,29),salary:base+rnd(5000,25000)},{team:rnd(0,29),salary:base+rnd(-2000,18000)}];
  $("offers").innerHTML=player.offers.map((o,i)=>`<div class="offer"><b>${GAME_DATA.teams[o.team][0]}</b><br>연봉 $${o.salary.toLocaleString()}<br><button data-offer="${i}" class="primary">이 계약 선택</button></div>`).join("");
  document.querySelectorAll("[data-offer]").forEach(b=>b.onclick=()=>{const o=player.offers[Number(b.dataset.offer)];player.team=o.team;player.salary=o.salary;player.season={games:0,ab:0,h:0,hr:0,rbi:0,bb:0,sb:0,errors:0,wins:0};player.offers=[];render();autosave();});
}
function startGame(){
  game={mode:"bat",pitchX:450,pitchY:280,cursorX:450,cursorY:280,ballX:450,ballY:95,phase:"pitch",pitchType:"FASTBALL",ballInPlay:false,absUsed:false};
  player.abs=2;show("game");setMode("bat");drawBat();msg("투수가 공을 던집니다. 존을 직접 맞추고 스윙하세요.");
}
function setMode(m){
  ["battingMode","runnerMode","fieldMode","pitchMode"].forEach(x=>$(x).classList.add("hidden"));
  const id={bat:"battingMode",run:"runnerMode",field:"fieldMode",pitch:"pitchMode"}[m];$(id).classList.remove("hidden");game.mode=m;
}
function ctx(id){return $(id).getContext("2d")}
function fieldBase(c,w,h){
  c.clearRect(0,0,w,h);c.fillStyle="#0b512e";c.fillRect(0,0,w,h);
  c.strokeStyle="#d7c69b";c.lineWidth=3;c.beginPath();c.moveTo(w/2,50);c.lineTo(w-100,h-80);c.lineTo(100,h-80);c.closePath();c.stroke();
}
function drawBat(){
  const c=ctx("batCanvas"),w=900,h=560;c.clearRect(0,0,w,h);c.fillStyle="#14263b";c.fillRect(0,0,w,h);
  c.fillStyle="#efe3c3";c.fillRect(260,110,380,340);c.strokeStyle="#fff";c.strokeRect(260,110,380,340);
  c.strokeStyle="#3e7fc8";c.lineWidth=2;c.beginPath();c.moveTo(450,110);c.lineTo(450,450);c.moveTo(260,280);c.lineTo(640,280);c.stroke();
  c.strokeStyle="#ffcc45";c.lineWidth=5;c.strokeRect(game.cursorX-28,game.cursorY-28,56,56);
  c.fillStyle="#fff";c.beginPath();c.arc(game.ballX,game.ballY,10,0,Math.PI*2);c.fill();
  c.fillStyle="#8fb6dc";c.font="22px system-ui";c.fillText(`투구: ${game.pitchType}`,30,40);c.fillText(`ABS ${player.abs}/2`,720,40);
  if(game.phase==="hit"){c.fillStyle="#fff";c.font="30px system-ui";c.fillText(game.result||"",300,520)}
}
function swing(){
  if(game.phase!=="pitch")return;
  const dx=Math.abs(game.cursorX-game.ballX),dy=Math.abs(game.cursorY-game.ballY);
  const timing=Math.abs(game.ballY-game.pitchY);
  let chance=0.25+(player.stats.contact+getEquipFor("contact"))/400;
  const quality=clamp(1-(dx+dy)/180,0,1);
  chance+=quality*.55-timing/1000;
  if(Math.random()<chance){
    const hitPower=player.stats.power+getEquipFor("power");
    const hr=hitPower>75&&quality>.78&&Math.random()<.22;
    const hit=quality>.35;
    if(hit){
      player.season.ab++;player.season.h++;player.career.h++;
      if(hr){player.season.hr++;player.career.hr++;player.season.rbi++;player.career.rbi++;game.result="홈런! 주자 시점으로 전환";startRunner("HR")}
      else {game.result="안타! 주자 시점으로 전환";startRunner("HIT")}
    }else outAtBat();
  }else outAtBat();
  game.phase="hit";drawBat();
}
function outAtBat(){player.season.ab++;game.result=Math.random()<.5?"헛스윙 삼진":"범타";setTimeout(()=>endPlay(),900)}
function walk(){player.season.bb++;player.career.bb++;startRunner("BB")}
function absReview(){
  if(game.phase!=="pitch"||player.abs<=0)return;
  const calledStrike=Math.random()<.55;
  const actualStrike=(game.cursorX>390&&game.cursorX<510&&game.cursorY>215&&game.cursorY<345);
  const overturned=calledStrike!==actualStrike;
  msg(overturned?"ABS 번복! 판독권 유지":"ABS 판정 유지. 판독권 1회 차감.");
  if(!overturned)player.abs--;
  setTimeout(()=>{msg("판정이 적용되었습니다.");render();},800);
}
function startRunner(reason){
  game.reason=reason;game.runnerX=450;game.runnerY=440;game.phase="runner";setMode("run");drawRunner();
}
function drawRunner(){
  const c=ctx("runnerCanvas"),w=900,h=560;c.clearRect(0,0,w,h);fieldBase(c,w,h);
  c.fillStyle="#fff";c.font="22px system-ui";c.fillText("주자 시점",30,35);c.fillText("▲ 전진 / ▼ 귀루",690,35);
  c.fillStyle="#ffd54a";c.beginPath();c.arc(game.runnerX,game.runnerY,18,0,Math.PI*2);c.fill();
}
function updateRunner(dx,dy){game.runnerX=clamp(game.runnerX+dx*7,100,800);game.runnerY=clamp(game.runnerY+dy*7,70,500);drawRunner()}
function runAction(){if(game.runnerY<180){player.season.sb++;player.career.sb++;msg("주루 성공! 득점권으로 진루했습니다.")}else msg("주자가 전진했습니다.");setTimeout(()=>startField(),700)}
function startField(){game.fieldX=450;game.fieldY=390;game.targetX=450;game.targetY=150;setMode("field");drawField();msg("수비수를 직접 움직여 공을 잡고 송구하세요.")}
function drawField(){
  const c=ctx("fieldCanvas"),w=900,h=560;c.clearRect(0,0,w,h);fieldBase(c,w,h);
  c.fillStyle="#4da3ff";c.beginPath();c.arc(game.fieldX,game.fieldY,18,0,Math.PI*2);c.fill();
  c.fillStyle="#fff";c.beginPath();c.arc(game.targetX,game.targetY,8,0,Math.PI*2);c.fill();
  c.font="22px system-ui";c.fillText("수비",30,35);
}
function updateField(dx,dy){game.fieldX=clamp(game.fieldX+dx*7,60,840);game.fieldY=clamp(game.fieldY+dy*7,60,500);drawField()}
function throwBall(){const dist=Math.hypot(game.fieldX-game.targetX,game.fieldY-game.targetY);if(dist<120){msg("정확한 송구! 아웃 처리.");player.season.errors+=0}else{msg("송구가 빗나갔습니다.")}setTimeout(()=>endPlay(),800)}
function endPlay(){player.season.games++;player.career.games++;player.xp+=15;if(player.xp>=100){player.level++;player.xp-=100}player.nextOpponent=rnd(0,29);autosave();render();show("dashboard")}
function startPitching(){game={mode:"pitch",pitchX:450,pitchY:280,targetX:450,targetY:280,pitchType:"FASTBALL"};show("game");setMode("pitch");drawPitch();msg("구종과 코스를 선택한 뒤 투구하세요.")}
function drawPitch(){const c=ctx("pitchCanvas"),w=900,h=560;c.clearRect(0,0,w,h);c.fillStyle="#151515";c.fillRect(0,0,w,h);c.fillStyle="#eee";c.fillRect(250,100,400,360);c.strokeStyle="#4d90d9";c.strokeRect(390,200,120,160);c.fillStyle="#ffcc45";c.beginPath();c.arc(game.targetX,game.targetY,13,0,Math.PI*2);c.fill();c.fillStyle="#fff";c.font="22px system-ui";c.fillText(`구종: ${game.pitchType}`,30,35)}
function pitch(){const accuracy=(player.stats.defense+getEquipFor("defense"))/150;const d=Math.hypot(game.targetX-450,game.targetY-280);const good=d<70&&Math.random()<(.55+accuracy*.35);msg(good?`${game.pitchType} 스트라이크!`:`${game.pitchType} 볼.`);setTimeout(()=>endPlay(),800)}
function setupJoystick(id,fn){
  const el=$(id),stick=el.querySelector(".stick");
  const move=e=>{const r=el.getBoundingClientRect(),p=e.touches?e.touches[0]:e,x=p.clientX-r.left-r.width/2,y=p.clientY-r.top-r.height/2,max=r.width*.34,len=Math.hypot(x,y),scale=Math.min(1,max/(len||1));stick.style.left=`${50+x*scale/r.width*100}%`;stick.style.top=`${50+y*scale/r.height*100}%`;fn(x/max,y/max)};
  const reset=()=>{stick.style.left="50%";stick.style.top="50%";fn(0,0)};
  el.addEventListener("pointermove",move);el.addEventListener("pointerdown",e=>{el.setPointerCapture(e.pointerId);move(e)});el.addEventListener("pointerup",reset);el.addEventListener("pointercancel",reset);
}
function key(e){
  const k=e.key.toLowerCase();if(game&&game.mode==="bat"){if(k===" "){e.preventDefault();swing()}if(k==="a")absReview();if(k==="w")game.cursorY-=15;if(k==="s")game.cursorY+=15;if(k==="a"&&e.repeat===false)return;if(k==="d")game.cursorX+=15;game.cursorX=clamp(game.cursorX,288,612);game.cursorY=clamp(game.cursorY,138,422);drawBat()}
  if(game&&game.mode==="run"){let dx=0,dy=0;if(k==="a")dx=-1;if(k==="d")dx=1;if(k==="w")dy=-1;if(k==="s")dy=1;updateRunner(dx,dy)}
  if(game&&game.mode==="field"){let dx=0,dy=0;if(k==="a")dx=-1;if(k==="d")dx=1;if(k==="w")dy=-1;if(k==="s")dy=1;updateField(dx,dy);if(k===" ")throwBall()}
  if(game&&game.mode==="pitch"){let dx=0,dy=0;if(k==="a")dx=-1;if(k==="d")dx=1;if(k==="w")dy=-1;if(k==="s")dy=1;game.targetX=clamp(game.targetX+dx*12,390,510);game.targetY=clamp(game.targetY+dy*12,200,360);drawPitch();if(k===" ")pitch()}
}
document.addEventListener("keydown",key);
$("newCareerBtn").onclick=()=>{player=defaultPlayer();renderAllocator();show("create")};
$("continueBtn").onclick=()=>loadSlot(0);
$("createPlayerBtn").onclick=create;
$("drawEquipmentBtn").onclick=drawEquipment;
$("trainBtn").onclick=train;
$("negotiateBtn").onclick=negotiate;
$("playGameBtn").onclick=startGame;
$("backCareerBtn").onclick=()=>{autosave();render();show("dashboard")};
$("swingBtn").onclick=swing;$("absBtn").onclick=absReview;$("runBtn").onclick=runAction;$("throwBtn").onclick=throwBall;$("pitchBtn").onclick=pitch;
document.querySelectorAll("[data-save]").forEach(b=>b.onclick=()=>saveSlot(Number(b.dataset.save)));
document.querySelectorAll("[data-load]").forEach(b=>b.onclick=()=>loadSlot(Number(b.dataset.load)));
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tabpage").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")});
document.querySelectorAll("[data-pitch]").forEach(b=>b.onclick=()=>{game.pitchType=b.dataset.pitch;document.querySelectorAll("[data-pitch]").forEach(x=>x.classList.remove("active"));b.classList.add("active");drawPitch()});
setupJoystick("batJoy",(x,y)=>{game&&game.mode==="bat"&&(game.cursorX=clamp(game.cursorX+x*12,288,612),game.cursorY=clamp(game.cursorY+y*12,138,422),drawBat())});
setupJoystick("runJoy",(x,y)=>{game&&game.mode==="run"&&updateRunner(x,y)});
setupJoystick("fieldJoy",(x,y)=>{game&&game.mode==="field"&&updateField(x,y)});
["batCanvas","fieldCanvas","pitchCanvas"].forEach(id=>{$(id).addEventListener("pointermove",e=>{const r=$(id).getBoundingClientRect(),x=(e.clientX-r.left)/r.width*900,y=(e.clientY-r.top)/r.height*560;if(game?.mode==="field"){game.targetX=x;game.targetY=y;drawField()}if(game?.mode==="pitch"){game.targetX=clamp(x,390,510);game.targetY=clamp(y,200,360);drawPitch()}})});
renderAllocator();
})();