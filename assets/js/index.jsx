var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

function Card(props) {
  return <main className="card">{props.children}</main>;
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
    window.location.href = "calendrier.html?t=" + encodeURIComponent(token);
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
        <p className="message">Tu as déjà répondu 💌</p>
      </Card>
    );
  }

  if (declined === true) {
    return (
      <Card>
        <p className="message">Ah... d’accord 😔</p>
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
      <p className="message">
        Coucou {name}, est-ce que ça te tenterait de sortir un de ces quatre ?
      </p>
      <div className="buttons">
        <button className="button button-yes" onClick={goToCalendar}>
          Oui 💛
        </button>
        <button className="button" onClick={sayNo}>
          Non
        </button>
      </div>
    </Card>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);