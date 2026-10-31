var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

var INDEX_PAGE = "index.html";

var LEFT_IMAGE = "assets/img/none/chicken_cry.png";
var RIGHT_IMAGE = "assets/img/none/computer.png";
var PERCH_IMAGE = "assets/img/none/perso_cadre.png";

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
          setStatus("answered");
        } else {
          setStatus("ok");
        }
      } catch (error) {
        setStatus("invalid");
      }
    }
    checkLink();
  }, []);

  function goBack() {
    window.location.href = INDEX_PAGE + "?t=" + encodeURIComponent(token);
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
      <p className="big-emoji">😔</p>
      <h1 className="title">Ah... d’accord.</h1>
      <p className="text">Merci d’avoir été honnête, pas de souci.</p>
    </Scene>
  );
}
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);