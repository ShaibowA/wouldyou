const $ = id => document.getElementById(id);
const st = {slot:"", act:""};
let name = "", recapText = "";

// Prénom pris dans le lien : …/#camille  ou  …/#marie-lou
try{
  name = decodeURIComponent(location.hash.slice(1)).replace(/-/g," ").trim();
  if(name) name = name[0].toUpperCase()+name.slice(1);
}catch(e){}
if(name) $("greet").textContent = "Coucou " + name + ",";

function show(id){ document.querySelectorAll("section").forEach(s=>s.classList.toggle("on", s.id===id)); }

function pops(){
  const em=["💛","✨","🎉","💌","🥰"];
  for(let i=0;i<22;i++){
    const s=document.createElement("span");
    s.className="pop"; s.textContent=em[i%em.length];
    s.style.setProperty("--x",(Math.random()*500-250)+"px");
    s.style.setProperty("--y",(-Math.random()*420-60)+"px");
    s.style.setProperty("--r",(Math.random()*90-45)+"deg");
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),1400);
  }
}

function pick(groupId, key){
  $(groupId).addEventListener("click", e=>{
    const b=e.target.closest(".chip"); if(!b) return;
    $(groupId).querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed","false"));
    b.setAttribute("aria-pressed","true");
    st[key]=b.textContent.trim();
    check();
  });
}
function check(){
  $("n1").disabled = !($("date").value && st.slot);
  $("n2").disabled = !st.act;
}
pick("slots","slot"); pick("acts","act");
$("date").min = new Date().toISOString().slice(0,10);
$("date").addEventListener("input", check);

// Envoi : notif ntfy (téléphone) + email Web3Forms (optionnel)
async function notify(title, message){
  const jobs = [];
  if(CONFIG.NTFY_TOPIC){
    jobs.push(fetch("https://ntfy.sh/", {
      method:"POST",
      body: JSON.stringify({topic:CONFIG.NTFY_TOPIC, title, message, tags:["love_letter"]})
    }).then(r=>{ if(!r.ok) throw new Error("ntfy"); }));
  }
  if(CONFIG.DISCORD_WEBHOOK){
    jobs.push(fetch(CONFIG.DISCORD_WEBHOOK, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({content:"**"+title+"**\n"+message, allowed_mentions:{parse:[]}})
    }).then(r=>{ if(!r.ok) throw new Error("discord"); }));
  }
  if(CONFIG.W3F_KEY){
    jobs.push(fetch("https://api.web3forms.com/submit", {
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body: JSON.stringify({access_key:CONFIG.W3F_KEY, subject:title, from_name:name||"Date-moi", message})
    }).then(r=>{ if(!r.ok) throw new Error("w3f"); }));
  }
  if(!jobs.length) throw new Error("no-backend");
  await Promise.all(jobs);
}

$("yes").onclick  = ()=>{ pops(); setTimeout(()=>show("s1"),500); };
$("no").onclick   = ()=>{
  show("nope");
  if(CONFIG.NOTIFY_ON_NO) notify((name||"Quelqu’un")+" a dit non 😔", "Elle a cliqué sur Non.").catch(()=>{});
};
$("oops").onclick = ()=>show("ask");
$("n1").onclick   = ()=>show("s2");
$("n2").onclick   = ()=>show("s3");

$("n3").onclick = ()=>{
  const d = new Date($("date").value+"T12:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const extra = $("extra").value.trim();
  recapText = "Dispo : " + d + " (" + st.slot.toLowerCase() + ")\n" +
              "Idée : " + st.act +
              (extra ? "\nMessage : " + extra : "");
  $("recap").textContent = recapText;
  show("done");
};

$("send").onclick = async ()=>{
  const btn = $("send"); btn.disabled = true; btn.textContent = "Envoi…";
  try{
    await notify((name||"Quelqu’un")+" a dit OUI 💛", recapText);
    $("doneIcon").textContent = "🎉";
    $("doneTitle").textContent = "C’est envoyé !";
    $("status").textContent = CONFIG.ME ? CONFIG.ME + " va te répondre très vite." : "Il va te répondre très vite.";
    btn.hidden = true; pops();
  }catch(e){
    $("status").textContent = "L’envoi a raté. Copie ta réponse et envoie-la-moi directement.";
    btn.disabled = false; btn.textContent = "Réessayer"; $("copy").hidden = false;
  }
};
$("copy").onclick = async ()=>{
  try{ await navigator.clipboard.writeText(recapText); $("copy").textContent = "Copié ✓"; }
  catch(e){ $("copy").textContent = "Copie à la main"; }
};