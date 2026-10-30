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

function Option(props) {
  var className = "option";
  if (props.selected === true) {
    className = className + " selected";
  }

  function choose() {
    props.onChoose(props.value);
  }

  return (
    <button className={className} onClick={choose}>
      <span className="emoji">{props.emoji}</span>
      {props.label}
    </button>
  );
}

function App() {
  var oldChoice = sessionStorage.getItem("place");
  var start = { mode: "", home: "", meet: "", message: "" };
  if (oldChoice !== null) {
    start = JSON.parse(oldChoice);
  }

  var [status, setStatus] = useState("loading");
  var [mode, setMode] = useState(start.mode);
  var [home, setHome] = useState(start.home);
  var [meet, setMeet] = useState(start.meet);
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

  function chooseMode(value) {
    setMode(value);
  }

  function changeHome(event) {
    setHome(event.target.value);
  }

  function changeMeet(event) {
    setMeet(event.target.value);
  }

  function changeMessage(event) {
    setMessage(event.target.value);
  }

  function goBack() {
    var place = { mode: mode, home: home, meet: meet, message: message };
    sessionStorage.setItem("place", JSON.stringify(place));
    window.location.href = ACTIVITY_PAGE + "?t=" + encodeURIComponent(token);
  }

  async function sendAnswer() {
    setSending(true);
    setError("");

    var rdv = JSON.parse(sessionStorage.getItem("rdv"));
    var activities = JSON.parse(sessionStorage.getItem("activities"));

    var placeText = meet;
    if (mode === "pickup") {
      placeText = home;
    }

    var answer = {
      date: rdv.date,
      time: rdv.time,
      activities: activities.list.join(", "),
      activityMessage: activities.message,
      pickup: mode,
      place: placeText.trim(),
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

  var currentPlace = "";
  if (mode === "pickup") {
    currentPlace = home;
  }
  if (mode === "meet") {
    currentPlace = meet;
  }

  var canSend = mode !== "" && currentPlace.trim() !== "" && sending === false;

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

      <div className="options">
        <Option
          value="pickup"
          emoji="🚗"
          label="Je viens te chercher devant chez toi"
          selected={mode === "pickup"}
          onChoose={chooseMode}
        />
        <Option
          value="meet"
          emoji="📍"
          label="On se retrouve quelque part"
          selected={mode === "meet"}
          onChoose={chooseMode}
        />
      </div>

      <div className="reveal">
        {mode === "" ? (
          <p className="hint">Choisis une option ci-dessus</p>
        ) : null}

        {mode === "pickup" ? (
          <div>
            <p className="label">Quelle est ton adresse ?</p>
            <input
              className="field"
              type="text"
              maxLength="300"
              placeholder="Ex : 12 rue des Lilas, 75000 Paris"
              value={home}
              onChange={changeHome}
            />
          </div>
        ) : null}

        {mode === "meet" ? (
          <div>
            <p className="label">À quel endroit ?</p>
            <input
              className="field"
              type="text"
              maxLength="300"
              placeholder="Ex : devant le cinéma"
              value={meet}
              onChange={changeMeet}
            />
          </div>
        ) : null}
      </div>

      <div className="last">
        <p className="label">Un petit mot pour la fin ? (facultatif)</p>
        <input
          className="field"
          type="text"
          maxLength="500"
          placeholder="Écris ce que tu veux"
          value={message}
          onChange={changeMessage}
        />
      </div>

      {error !== "" ? <p className="error">{error}</p> : null}

      <button className="button" disabled={!canSend} onClick={sendAnswer}>
        {buttonText}
      </button>
    </Scene>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);