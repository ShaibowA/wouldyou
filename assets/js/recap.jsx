var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

var CALENDAR_PAGE = "calend.html";
var ACTIVITY_PAGE = "activity.html";
var PLACE_PAGE = "place.html";

var LEFT_IMAGE = "assets/img/recap/perso_gauche.png";
var RIGHT_IMAGE = "assets/img/recap/perso_droite.png";
var PERCH_IMAGE = "assets/img/recap/perso_cadre.png";

function Scene(props) {
  return (
    <div className="page">
      <div className="cloud cloud-left"></div>
      <div className="cloud cloud-right"></div>

      <span className="star star1">✦</span>
      <span className="star star2">✧</span>

      <img className="side side-left" src={LEFT_IMAGE} alt="" />
      <img className="side side-right" src={RIGHT_IMAGE} alt="" />

      <main className="card">
        <img className="perch" src={PERCH_IMAGE} alt="" />
        {props.children}
      </main>
    </div>
  );
}

function Row(props) {
  function edit() {
    window.location.href = props.page + "?t=" + encodeURIComponent(token);
  }

  return (
    <div className="row">
      <div className="row-text">
        <p className="row-label">{props.emoji} {props.label}</p>
        <p className="row-value">{props.value}</p>
      </div>
      <button className="row-edit" onClick={edit}>Modifier</button>
    </div>
  );
}

function App() {
  var [status, setStatus] = useState("loading");
  var [sending, setSending] = useState(false);
  var [error, setError] = useState("");

  useEffect(function () {
    async function checkLink() {
      if (token === null) {
        setStatus("invalid");
        return;
      }
      try {
        var invitation = await openInvitation(token);
        if (invitation === null) {
          setStatus("invalid");
        } else if (invitation.answered === true) {
          setStatus("answered");
        } else if (sessionStorage.getItem("rdv") === null) {
          window.location.href = CALENDAR_PAGE + "?t=" + encodeURIComponent(token);
        } else if (sessionStorage.getItem("activities") === null) {
          window.location.href = ACTIVITY_PAGE + "?t=" + encodeURIComponent(token);
        } else if (sessionStorage.getItem("place") === null) {
          window.location.href = PLACE_PAGE + "?t=" + encodeURIComponent(token);
        } else {
          setStatus("ok");
        }
      } catch (err) {
        setStatus("invalid");
      }
    }
    checkLink();
  }, []);

  function goBack() {
    window.location.href = PLACE_PAGE + "?t=" + encodeURIComponent(token);
  }

  async function sendAnswer() {
    setSending(true);
    setError("");

    var rdv = JSON.parse(sessionStorage.getItem("rdv"));
    var activities = JSON.parse(sessionStorage.getItem("activities"));
    var place = JSON.parse(sessionStorage.getItem("place"));

    var answer = {
      date: rdv.date,
      time: rdv.time,
      activities: activities.list.join(", "),
      activityMessage: activities.message,
      pickup: "meet",
      place: place.place,
      message: place.message
    };

    try {
      var ok = await submitAnswer(token, answer);
      sessionStorage.removeItem("rdv");
      sessionStorage.removeItem("activities");
      sessionStorage.removeItem("place");
      if (ok === true) {
        setStatus("sent");
      } else {
        setStatus("answered");
      }
    } catch (err) {
      setError("L’envoi a raté, réessaie dans un instant.");
      setSending(false);
    }
  }

  if (status === "loading") {
    return (
      <Scene>
        <p className="title">...</p>
      </Scene>
    );
  }

  if (status === "invalid") {
    return (
      <Scene>
        <p className="title">Ce lien ne marche pas.</p>
      </Scene>
    );
  }

  if (status === "answered") {
    return (
      <Scene>
        <p className="title">Tu as déjà répondu 💌</p>
      </Scene>
    );
  }

  if (status === "sent") {
    return (
      <Scene>
        <p className="title">C’est envoyé ! 🎉</p>
        <p className="text">Merci, je te réponds très vite 💛</p>
      </Scene>
    );
  }

  var rdv = JSON.parse(sessionStorage.getItem("rdv"));
  var activities = JSON.parse(sessionStorage.getItem("activities"));
  var place = JSON.parse(sessionStorage.getItem("place"));

  var dateText = new Date(rdv.date + "T12:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  var activitiesText = activities.list.join(", ");
  if (activities.message !== "") {
    activitiesText = activitiesText + " (" + activities.message + ")";
  }

  var buttonText = "Envoyer ma réponse";
  if (sending === true) {
    buttonText = "Envoi...";
  }

  return (
    <Scene>
      <div className="back-line">
        <button className="button-back" onClick={goBack}>← Retour</button>
      </div>

      <p className="badge">✨ Dernière étape</p>
      <h1 className="title">Ton récap</h1>

      <Row emoji="📅" label="Quand" value={dateText + " à " + rdv.time} page={CALENDAR_PAGE} />
      <Row emoji="🎯" label="Quoi" value={activitiesText} page={ACTIVITY_PAGE} />
      <Row emoji="📍" label="Où" value={place.place} page={PLACE_PAGE} />
      {place.message !== "" ? (
        <Row emoji="💬" label="Ton petit mot" value={place.message} page={PLACE_PAGE} />
      ) : null}

      <p className="text">Tout est bon ? Je reçois ta réponse dès que tu envoies.</p>

      {error !== "" ? <p className="error">{error}</p> : null}

      <button className="button" disabled={sending} onClick={sendAnswer}>
        {buttonText}
      </button>
    </Scene>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);