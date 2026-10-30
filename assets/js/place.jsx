var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

var CALENDAR_PAGE = "calend.html";
var ACTIVITY_PAGE = "activity.html";
var NEXT_PAGE = "recap.html";

var LEFT_IMAGE = "assets/img/place/perso_gauche.png";
var RIGHT_IMAGE = "assets/img/place/perso_droite.png";
var PERCH_IMAGE = "assets/img/place/gojo.png";

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
      } catch (error) {
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

  function saveChoice() {
    var choice = { place: place.trim(), message: message.trim() };
    sessionStorage.setItem("place", JSON.stringify(choice));
  }

  function goBack() {
    saveChoice();
    window.location.href = ACTIVITY_PAGE + "?t=" + encodeURIComponent(token);
  }

  function goNext() {
    saveChoice();
    window.location.href = NEXT_PAGE + "?t=" + encodeURIComponent(token);
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
        <p className="title">Tu as déjà répondu </p>
      </Scene>
    );
  }

  var canGoNext = place.trim() !== "";

  return (
    <Scene>
      <div className="back-line">
        <button className="button-back" onClick={goBack}>← Retour</button>
      </div>

      <p className="badge">📍 Presque fini</p>
      <h1 className="title">Où veux-tu qu’on se retrouve ?</h1>

      <p className="text">Une adresse, un lieu... comme tu préfères</p>

      <input
        className="field place-field"
        type="text"
        maxLength="300"
        placeholder="Sinon tu me laisses choisir"
        value={place}
        onChange={changePlace}
      />

      <button className="button" disabled={!canGoNext} onClick={goNext}>
        Suivant
      </button>
    </Scene>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);