var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

var CALENDAR_PAGE = "calend.html";
var NONE_PAGE = "none.html";

var LEFT_IMAGE = "assets/img/index/MHA_turret.png";
var RIGHT_IMAGE = "assets/img/index/hxh_turret.png";
var MASCOT_IMAGE = "assets/img/index/squirtle_flower.png";

function Card(props) {
  return (
    <div className="page">
      <div className="cloud cloud-left"></div>
      <div className="cloud cloud-right"></div>

      <span className="star star1">✦</span>
      <span className="star star2">✧</span>

      <img className="side side-left" src={LEFT_IMAGE} alt="" />
      <img className="side side-right" src={RIGHT_IMAGE} alt="" />

      <main className="card">{props.children}</main>
    </div>
  );
}

function Invitation(props) {
  return (
    <div>
      <img className="mascot" src={MASCOT_IMAGE} alt="" />
      <h1 className="title">Coucou {props.name} !</h1>
      <p className="message">Est-ce que tu voudrais sortir un de ces quatre ?</p>
      <div className="buttons">
        <button className="button button-yes" onClick={props.onYes}>
          Avec plaisir ! ♥
        </button>
        <button className="button button-outline" disabled={props.sending} onClick={props.onNo}>
          Une autre fois
        </button>
      </div>
    </div>
  );
}

function App() {
  var [status, setStatus] = useState("loading");
  var [name, setName] = useState("");
  var [sending, setSending] = useState(false);

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
        } else if (invitation.answered === true && invitation.answer === "no") {
          window.location.href = NONE_PAGE + "?t=" + encodeURIComponent(token);
        } else if (invitation.answered === true) {
          setStatus("answered");
        } else {
          setName(invitation.name);
          setStatus("ok");
        }
      } catch (error) {
        setStatus("invalid");
      }
    }
    checkLink();
  }, []);

  function goToCalendar() {
    window.location.href = CALENDAR_PAGE + "?t=" + encodeURIComponent(token);
  }

  async function sayNo() {
    if (sending === true) {
      return;
    }
    setSending(true);
    try {
      await sendNo(token);
      window.location.href = NONE_PAGE + "?t=" + encodeURIComponent(token);
    } catch (error) {
      setSending(false);
      alert("Oups, réessaie dans un instant.");
    }
  }

  if (status === "loading") {
    return (
      <Card>
        <p className="message">...</p>
      </Card>
    );
  }

  if (status === "invalid") {
    return (
      <Card>
        <p className="message">Ce lien ne marche pas.</p>
      </Card>
    );
  }

  if (status === "answered") {
    return (
      <Card>
        <p className="message">Tu as déjà répondu au formulaire, si jamais tu as une question tu peux directement m’écrire sur mon numéro</p>
      </Card>
    );
  }

  return (
    <Card>
      <Invitation name={name} sending={sending} onYes={goToCalendar} onNo={sayNo} />
    </Card>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);