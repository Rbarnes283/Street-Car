// game.js - Adventure Game (Frogger Style with Sidegame Integration + Music)

(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const CANVAS_W = canvas.width, CANVAS_H = canvas.height;

  // UI
  const charSelect=document.getElementById("character-select");
  const hud=document.getElementById("hud");
  const scoreEl=document.getElementById("score");
  const coinsEl=document.getElementById("coins");
  const livesEl=document.getElementById("lives");
  const pauseBtn=document.getElementById("pauseBtn");
  const restartBtn=document.getElementById("restartBtn");
  const modal=document.getElementById("modal");
  const modalBody=document.getElementById("modalBody");
  const modalClose=document.getElementById("modalClose");
  const levelLabel=document.getElementById("levelLabel");

  const bgMusic=document.getElementById("bgMusic");

  // State
  let player=null, keys={}, running=false, paused=false, lastTime=0;
  window.score=0; window.coins=0; window.lives=3;
  let roads=[],cars=[],coinsArr=[],npcs=[];
  let level=1, MAX_LEVEL=10;
  const PLAYER_SPEED=3.6, INITIAL_LIVES=3;

  // Sound effects
  function playSfx(src){
    let a=new Audio(src); a.volume=0.3; a.play();
  }
  const sfxCoin="https://cdn.pixabay.com/download/audio/2022/03/15/audio_19cb9c4e0c.mp3";
  const sfxCrash="https://cdn.pixabay.com/download/audio/2022/03/15/audio_c345dfc4b3.mp3";

  // Utils
  const rand=(a,b)=>Math.random()*(b-a)+a;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rectsCollide=(a,b)=>a.x<a.w+b.x&&a.x+a.w>b.x&&a.y+a.h>b.y&&a.y<b.y+b.h;

  // --- Level setup with environments
  function setupLevel(lvl){
    roads=[]; cars=[]; coinsArr=[]; npcs=[];
    const roadHeight=60;
    const numRoads=Math.min(3+Math.floor(lvl/2),5);
    for(let i=0;i<numRoads;i++){
      let y=100+i*roadHeight;
      roads.push({y,h:roadHeight});
      for(let j=0;j<2+lvl;j++){
        let dir=(j%2===0)?1:-1;
        let x=dir===1?-rand(50,400):CANVAS_W+rand(50,400);
        cars.push({x,y:y+10,w:70,h:35,dir,speed:2+lvl*0.5,color:dir===1?"#d62828":"#003566"});
      }
    }
    for(let i=0;i<6+lvl*3;i++){
      coinsArr.push({x:rand(40,CANVAS_W-40),y:rand(40,CANVAS_H-40),r:10,picked:false});
    }
    npcs.push({x:CANVAS_W-160,y:40,w:36,h:48,name:"Maya",type:"sidegame"});
    if(lvl>=3) npcs.push({x:80,y:CANVAS_H-120,w:36,h:48,name:"Rita",type:"boost"});
    if(lvl>=5) npcs.push({x:400,y:80,w:36,h:48,name:"Zane",type:"memory"});
    if(lvl>=7) npcs.push({x:700,y:300,w:36,h:48,name:"Lily",type:"reaction2"});
    if(lvl>=9) npcs.push({x:200,y:100,w:36,h:48,name:"Kai",type:"bossquiz"});
    levelLabel.textContent=`Level: ${lvl}`;
    if(player){ player.x=48; player.y=CANVAS_H-80; }
  }

  function startLevel(lvl,char){
    if(!player) player={x:60,y:CANVAS_H-80,w:36,h:56,color:char==="boy"?"#1b77d6":"#ff7bbd"};
    else player.color=char==="boy"?"#1b77d6":"#ff7bbd";
    level=lvl; setupLevel(level);
    running=true; paused=false; lastTime=performance.now();
    updateHUD(); hud.classList.remove("hidden"); charSelect.style.display="none"; modal.classList.add("hidden");
    if(bgMusic.paused){ bgMusic.volume=0.2; bgMusic.play(); }
    requestAnimationFrame(gameLoop);
  }
  function resetGame(){ level=1; window.score=0;window.coins=0;window.lives=INITIAL_LIVES; player=null; running=false;paused=false; hud.classList.add("hidden"); charSelect.style.display=""; modal.classList.add("hidden"); updateHUD(); }

  // Input
  window.addEventListener("keydown",e=>{ keys[e.key]=true; if(e.key.toLowerCase()==="e")tryInteract(); });
  window.addEventListener("keyup",e=>keys[e.key]=false);
  pauseBtn.onclick=()=>{ paused=!paused; pauseBtn.textContent=paused?"Resume":"Pause"; if(!paused){lastTime=performance.now();requestAnimationFrame(gameLoop);} };
  restartBtn.onclick=resetGame; modalClose.onclick=()=>{ modal.classList.add("hidden"); paused=false; };
  document.querySelectorAll(".charBtn").forEach(b=>b.onclick=()=>startLevel(1,b.dataset.char));

  function tryInteract(){ for(let n of npcs){ if(rectsCollide(player,n)){ launchSideGame(n.type); modal.classList.remove("hidden"); paused=true; break; } } }

  // Update
  function update(dt){
    if(!player||paused)return;
    let dx=(keys["ArrowRight"]||keys["d"]?1:0)-(keys["ArrowLeft"]||keys["a"]?1:0);
    let dy=(keys["ArrowDown"]||keys["s"]?1:0)-(keys["ArrowUp"]||keys["w"]?1:0);
    player.x=clamp(player.x+dx*PLAYER_SPEED,0,CANVAS_W-player.w);
    player.y=clamp(player.y+dy*PLAYER_SPEED,0,CANVAS_H-player.h);
    cars.forEach(c=>{ c.x+=c.speed*c.dir*dt*0.05; if(c.dir===1&&c.x>CANVAS_W+100)c.x=-100; if(c.dir===-1&&c.x<-100)c.x=CANVAS_W+100; if(rectsCollide(player,c)){ window.lives--; playSfx(sfxCrash); player.x=48;player.y=CANVAS_H-80; if(window.lives<=0)resetGame(); updateHUD(); } });
    coinsArr.forEach(c=>{ if(!c.picked&&rectsCollide(player,{x:c.x-c.r,y:c.y-c.r,w:c.r*2,h:c.r*2})){ c.picked=true; window.coins++; window.score+=3; playSfx(sfxCoin); updateHUD(); } });
    if(coinsArr.every(c=>c.picked)){ level<MAX_LEVEL?nextLevel():resetGame(); }
  }

  // Draw
  function draw(){
    ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
    ctx.fillStyle=(level%3===1)?"#aee1f9":(level%3===2)?"#d4f7d4":"#f0e5ff";
    ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
    roads.forEach(r=>{ ctx.fillStyle="#555"; ctx.fillRect(0,r.y,CANVAS_W,r.h); ctx.strokeStyle="#fff"; ctx.setLineDash([20,20]); ctx.beginPath(); ctx.moveTo(0,r.y+r.h/2); ctx.lineTo(CANVAS_W,r.y+r.h/2); ctx.stroke(); ctx.setLineDash([]); });
    coinsArr.forEach(c=>{ if(!c.picked){ ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2); ctx.fillStyle="gold"; ctx.fill(); ctx.strokeStyle="#c90"; ctx.stroke(); }});
    cars.forEach(c=>{ ctx.fillStyle=c.color; ctx.fillRect(c.x,c.y,c.w,c.h); ctx.fillStyle="#eee"; ctx.fillRect(c.x+5,c.y+5,c.w-10,c.h/2-5); ctx.fillStyle="black"; ctx.fillRect(c.x+5,c.y-5,10,10); ctx.fillRect(c.x+c.w-15,c.y-5,10,10); ctx.fillRect(c.x+5,c.y+c.h-5,10,10); ctx.fillRect(c.x+c.w-15,c.y+c.h-5,10,10); });
    ctx.fillStyle=player.color; ctx.fillRect(player.x,player.y,player.w,player.h);
    npcs.forEach(n=>{ ctx.fillStyle="purple"; ctx.fillRect(n.x,n.y,n.w,n.h); ctx.fillStyle="black"; ctx.fillText(n.name,n.x,n.y-5); });
    ctx.fillStyle="black"; ctx.fillText(`Score:${window.score} Coins:${window.coins} Lives:${window.lives} Lvl:${level}`,10,20);
  }

  function updateHUD(){ scoreEl.textContent=`Score: ${window.score}`; coinsEl.textContent=`Coins: ${window.coins}`; livesEl.textContent=`Lives: ${window.lives}`; levelLabel.textContent=`Level: ${level}`; }
  function nextLevel(){ level++; setupLevel(level); }

  function gameLoop(time){ const dt=time-lastTime; lastTime=time; if(running&&!paused){ update(dt); draw(); } requestAnimationFrame(gameLoop); }

  // Hooks for sidegames
  window.__gameAddCoins=(n)=>{ window.coins+=n; updateHUD(); };
  window.__gameAddScore=(n)=>{ window.score+=n; updateHUD(); };
  window.__gameSkipLevel=()=>{ if(level<MAX_LEVEL){ nextLevel(); modal.classList.add("hidden"); paused=false; } };

  hud.classList.add("hidden");
  modal.classList.remove("hidden");
  modalBody.innerHTML=`<h2>Welcome!</h2><p>Survive 10 levels, dodge cars, and collect coins! Interact with NPCs for mini-games and bonuses.</p>`;
})();
