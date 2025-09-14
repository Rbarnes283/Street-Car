function launchSideGame(type){
  const modalBody=document.getElementById("modalBody");
  modalBody.innerHTML="";
  if(type==="sidegame"){ Math.random()<0.5?miniReactionGame():miniGuessNumber(); }
  else if(type==="boost"){ modalBody.innerHTML="<h3>Boost</h3><p>Pay 6 coins to skip a level.</p>"; let b=document.createElement("button"); b.textContent="Pay"; b.onclick=()=>{ if(window.coins>=6){window.coins-=6;window.__gameSkipLevel();} }; modalBody.appendChild(b);}
  else if(type==="memory") memoryGame();
  else if(type==="reaction2") reactionGame2();
  else if(type==="bossquiz") bossQuiz();
}

function miniReactionGame(){
  const m=document.getElementById("modalBody"); m.innerHTML="<h3>Reaction</h3><p>Click fast!</p><div id='c' style='width:50px;height:50px;border-radius:50%;background:red;margin:20px auto;display:none;'></div>";
  let c=document.getElementById("c"),start=0; setTimeout(()=>{c.style.display="block";start=performance.now();},800); c.onclick=()=>{ if(performance.now()-start<600){window.__gameAddCoins(1);window.__gameAddScore(5);} document.getElementById("modal").classList.add("hidden");paused=false;};
}
function miniGuessNumber(){
  const m=document.getElementById("modalBody"); m.innerHTML="<h3>Guess</h3><p>Pick 1-5</p>"; let num=Math.floor(Math.random()*5)+1;
  for(let i=1;i<=5;i++){ let b=document.createElement("button"); b.textContent=i; b.onclick=()=>{ if(i===num){window.__gameAddCoins(1);window.__gameAddScore(5);} document.getElementById("modal").classList.add("hidden");paused=false;}; m.appendChild(b);}
}
function memoryGame(){
  const m=document.getElementById("modalBody"); m.innerHTML="<h3>Memory</h3><p>Match pairs</p>";
  let cards=[1,1,2,2,3,3]; cards.sort(()=>Math.random()-0.5); let sel=[],matched=0;
  cards.forEach(c=>{ let b=document.createElement("button"); b.textContent="?"; b.onclick=()=>{ b.textContent=c; sel.push({c,b}); if(sel.length===2){ if(sel[0].c===sel[1].c){matched++;if(matched===3){window.__gameAddCoins(3);window.__gameAddScore(10);document.getElementById("modal").classList.add("hidden");paused=false;}} else setTimeout(()=>{sel[0].b.textContent="?";sel[1].b.textContent="?"},700); sel=[];}}; m.appendChild(b);});
}
function reactionGame2(){
  const m=document.getElementById("modalBody"); m.innerHTML="<h3>Reaction 2.0</h3><p>Even faster!</p><div id='c2' style='width:60px;height:60px;border-radius:50%;background:blue;margin:20px auto;display:none;'></div>";
  let c=document.getElementById("c2"),start=0; setTimeout(()=>{c.style.display="block";start=performance.now();},1200); c.onclick=()=>{ if(performance.now()-start<400){window.__gameAddCoins(2);window.__gameAddScore(12);} document.getElementById("modal").classList.add("hidden");paused=false;};
}
function bossQuiz(){
  const m=document.getElementById("modalBody"); m.innerHTML="<h3>Boss Quiz</h3>"; let r=[{q:"What has to be broken before you can use it?",a:"egg"},{q:"Tall when young, short when old?",a:"candle"}][Math.floor(Math.random()*2)];
  m.innerHTML+=`<p>${r.q}</p>`; let input=document.createElement("input"); let b=document.createElement("button"); b.textContent="Submit"; b.onclick=()=>{ if(input.value.toLowerCase().includes(r.a)){window.__gameAddCoins(5);window.__gameAddScore(20);} document.getElementById("modal").classList.add("hidden");paused=false;}; m.append(input,b);
}
