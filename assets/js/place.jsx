var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

var CALENDAR_PAGE = "calend.html";
var ACTIVITY_PAGE = "activity.html";

function Scene(props) {
  return (
    <div className="page">
      <div className="cloud cloud-left"></div>
      <div className="cloud cloud-right"></div>

      <span className="star star1">✦</span>
      <span className="star star2">✧</span>

      <img className="side side-left" src="assets/img/place/perso_gauche.png" alt="" />
      <img className="side side-right" src="assets/img/place/perso_droite.png" alt="" />

      <main className="card">{props.children}</main>
    </div>
  );
}

function App() {
  var oldChoice = sessionStorage.getItem("place");
  var start = { place: "", message: "" };
  if (oldChoice !== null) {
    var saved = JSON.parse(oldChoice);
    if (saved.place !== undefined) {
      start = saved;
    }
  }

  var [status, setStatus] = useState("loading");
  var [place, setPlace] = useState(start.place);
  var [message, setMessage] = useState(start.message);
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
        } else {
          setStatus("ok");
        }
      } catch (err) {
        setStatus("invalid");
      }
    }
    checkLink();
  }, []);

  function changePlace(event) {
    setPlace(event.target.value);
  }

  function changeMessage(event) {
    setMessage(event.target.value);
  }

  function goBack() {
    var choice = { place: place, message: message };
    sessionStorage.setItem("place", JSON.stringify(choice));
    window.location.href = ACTIVITY_PAGE + "?t=" + encodeURIComponent(token);
  }

  async function sendAnswer() {
    setSending(true);
    setError("");

    var rdv = JSON.parse(sessionStorage.getItem("rdv"));
    var activities = JSON.parse(sessionStorage.getItem("activities"));

    var answer = {
      date: rdv.date,
      time: rdv.time,
      activities: activities.list.join(", "),
      activityMessage: activities.message,
      pickup: "meet",
      place: place.trim(),
      message: message.trim()
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

  var canSend = place.trim() !== "" && sending === false;

  var buttonText = "Envoyer ma réponse";
  if (sending === true) {
    buttonText = "Envoi...";
  }

  return (
    <Scene>
      <div className="back-line">
        <button className="button-back" onClick={goBack}>← Retour</button>
      </div>

      <h1 className="title">Où veux-tu qu’on se retrouve ?</h1>

      <p className="text">Ecris l'endroit ci-dessous</p>

      <input
        className="field place-field"
        type="text"
        maxLength="1000"
        value={place}
        onChange={changePlace}
      />

      {error !== "" ? <p className="error">{error}</p> : null}

      <button className="button" disabled={!canSend} onClick={sendAnswer}>
        {buttonText}
      </button>
    </Scene>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);