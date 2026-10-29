const $ = id => document.getElementById(id);
const st = {slot:"", act:""};
let name = "", recapText = "";
const token = new URLSearchParams(location.search).get("t");
let BASE = (CONFIG.SUPABASE_URL || "").trim();
try{ BASE = new URL(BASE).origin; }catch(e){}   
const HDR = {apikey: (CONFIG.SUPABASE_ANON_KEY || "").trim(), "Content-Type": "application/json"};
const rpc = (fn, args) =>
  fetch(BASE + "/rest/v1/rpc/" + fn, {method:"POST", headers:HDR, body:JSON.stringify(args)})
    .then(r => { if(!r.ok) throw new Error(fn); return r.json(); });

function show(id){ document.querySelectorAll("section").forEach(s => s.classList.toggle("on", s.id === id)); }

function pops(){
  const em = ["💛","✨","🎉","💌","🥰"];
  for(let i=0;i<22;i++){
    const s = document.createElement("span");
    s.className = "pop"; s.textContent = em[i % em.length];
    s.style.setProperty("--x", (Math.random()*500-250)+"px");
    s.style.setProperty("--y", (-Math.random()*420-60)+"px");
    s.style.setProperty("--r", (Math.random()*90-45)+"deg");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
}

function pick(groupId, key){
  $(groupId).addEventListener("click", e => {
    const b = e.target.closest(".chip"); if(!b) return;
    $(groupId).querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed","false"));
    b.setAttribute("aria-pressed","true");
    st[key] = b.textContent.trim();
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

if(!token){ show("invalid"); }
else rpc("open_invitation", {p_token: token}).then(inv => {
  if(!inv){ show("invalid"); return; }
  name = inv.name;
  if(inv.answered){ show("already"); return; }
  $("greet").textContent = "Coucou " + name + ",";
  show("ask");
}).catch(() => show("invalid"));

$("yes").onclick  = () => { pops(); setTimeout(() => show("s1"), 500); };
$("no").onclick   = () => show("nope");
$("oops").onclick = () => show("ask");
$("n1").onclick   = () => show("s2");
$("n2").onclick   = () => show("s3");

$("n3").onclick = () => {
  const d = new Date($("date").value + "T12:00").toLocaleDateString("fr-FR", {weekday:"long", day:"numeric", month:"long"});
  const extra = $("extra").value.trim();
  recapText = "Dispo : " + d + " (" + st.slot.toLowerCase() + ")\n" +
              "Idée : " + st.act + (extra ? "\nMessage : " + extra : "");
  $("recap").textContent = recapText;
  show("done");
};

$("send").onclick = async () => {
  const btn = $("send"); btn.disabled = true; btn.textContent = "Envoi…";
  try{
    const ok = await rpc("submit_answer", {
      p_token: token, p_answer: "yes", p_date: $("date").value,
      p_slot: st.slot, p_activity: st.act, p_extra: $("extra").value.trim()
    });
    if(!ok){ show("already"); return; }
    if(CONFIG.DISCORD_WEBHOOK){
      fetch(CONFIG.DISCORD_WEBHOOK, {method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({content:"**" + name + " a dit OUI 💛**\n" + recapText, allowed_mentions:{parse:[]}})}).catch(()=>{});
    }
    $("doneIcon").textContent = "🎉";
    $("doneTitle").textContent = "C’est envoyé !";
    $("status").textContent = (CONFIG.ME || "Je") + " " + (CONFIG.ME ? "va" : "vais") + " te répondre très vite.";
    btn.hidden = true; pops();
  }catch(e){
    $("status").textContent = "L’envoi a raté. Vérifie ta connexion et réessaie.";
    btn.disabled = false; btn.textContent = "Réessayer";
  }
};