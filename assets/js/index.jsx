var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

function Card(props) {
  return (
    <div className="page">
      <div className="cloud cloud-left"></div>
      <div className="cloud cloud-right"></div>

      <span className="star star1">✦</span>
      <span className="star star2">✧</span>

      <img className="side side-left" src="assets/img/index/MHA_turret.png" alt="" />
      <img className="side side-right" src="assets/img/index/hxh_turret.png" alt="" />

      <main className="card">{props.children}</main>
    </div>
  );
}

function Invitation(props) {
  return (
    <div>
      <img className="mascot" src="assets/img/index/squirtle_flower.png" alt="" />
      <h1 className="title">Hello {props.name} !</h1>
      <p className="message">Est-ce que tu voudrais sortir un de ces quatre ?</p>
      <div className="buttons">
        <button className="button button-yes" onClick={props.onYes}>
          Oui
        </button>
        <button className="button button-outline" onClick={props.onNo}>
          Non 
        </button>
      </div>
    </div>
  );
}

function App() {
  var [status, setStatus] = useState("loading");
  var [name, setName] = useState("");

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
          window.location.href = "none.html?t=" + encodeURIComponent(token);
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
    window.location.href = "calend.html?t=" + encodeURIComponent(token);
  }

  async function sayNo() {
    try {
      await sendNo(token);
      window.location.href = "none.html?t=" + encodeURIComponent(token);
    } catch (error) {
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
      <Invitation name={name} onYes={goToCalendar} onNo={sayNo} />
    </Card>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);