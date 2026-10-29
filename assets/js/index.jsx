var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

function Card(props) {
  return (
    <div className="scene">
      <img className="deco deco1" src="assets/img/index/six_sponge.jpg" alt="poke"/>
      {/* <img className="deco deco2" src="assets/img/perso2.png" alt="" />
      <img className="deco deco3" src="assets/img/perso3.png" alt="" />
      <img className="deco deco4" src="assets/img/perso4.png" alt="" />
      <img className="deco deco5" src="assets/img/perso5.png" alt="" />
      <img className="deco deco6" src="assets/img/perso6.png" alt="" /> */}
      <main className="card">{props.children}</main>
    </div>
  );
}

function App() {
  var [status, setStatus] = useState("loading");
  var [name, setName] = useState("");
  var [declined, setDeclined] = useState(false);

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

  function sayNo() {
    setDeclined(true);
  }

  function sayOops() {
    setDeclined(false);
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
        <p className="message">Tu as déjà répondu au formulaire, si jamais tu as une question tu peux directement m'écrire sur mon numéro</p>
      </Card>
    );
  }

  if (declined === true) {
    return (
      <Card>
        <p className="message">Bon c'est pas grave, j'aurais tenté, tant pis </p>
        <div className="buttons">
          <button className="button button-outline" onClick={sayOops}>
            Oups, j’ai cliqué trop vite
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <img className="ronflex" src="assets/img/index/squirtle_flower.jpg"/>
      <p className="message">
        Coucou {name}, est-ce que tu voudrais sortir un de ces quatres ? 
      </p>
      <div className="buttons">
        <button className="button button-yes" onClick={goToCalendar}>
          Oui
        </button>
        <button className="button" onClick={sayNo}>
          Non
        </button>
      </div>
    </Card>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);