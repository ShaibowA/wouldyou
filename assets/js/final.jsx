var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

var INDEX_PAGE = "index.html";

var LEFT_IMAGE = "assets/img/final/megumin.png";
var RIGHT_IMAGE = "assets/img/final/ichigo.png";
var PERCH_IMAGE = "assets/img/final/perso_cadre.png";

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
  var [status, setStatus] = useState("loading");

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
          setStatus("done");
        } else {
          window.location.href = INDEX_PAGE + "?t=" + encodeURIComponent(token);
        }
      } catch (error) {
        setStatus("invalid");
      }
    }
    checkLink();
  }, []);

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

  return (
    <Scene>
      <h1 className="title">Réponse envoyée ✓</h1>
      <p className="text">Merci beaucoup 🐥</p>
    </Scene>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);