var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

var PREVIOUS_PAGE = "calend.html";
var NEXT_PAGE = "lieu.html";

var CHOICES = [
  { emoji: "✨", label: "Catégorie 1" },
  { emoji: "✨", label: "Catégorie 2" },
  { emoji: "✨", label: "Catégorie 3" },
  { emoji: "✨", label: "Catégorie 4" },
  { emoji: "✨", label: "Catégorie 5" },
  { emoji: "✏️", label: "Autre" }
];

function contains(list, value) {
  for (var i = 0; i < list.length; i++) {
    if (list[i] === value) {
      return true;
    }
  }
  return false;
}

function Scene(props) {
  return (
    <div className="page">
      <div className="cloud cloud-left"></div>
      <div className="cloud cloud-right"></div>

      <span className="star star1">✦</span>
      <span className="star star2">✧</span>

      <img className="frame frame-left" src="assets/img/activity/kmny.png" alt="" />
      <img className="frame frame-right" src="assets/img/activity/kmny.png" alt="" />
      <main className="card">{props.children}</main>
    </div>
  );
}

function Choice(props) {
  var className = "choice";
  if (props.selected === true) {
    className = className + " selected";
  }

  function toggle() {
    props.onToggle(props.label);
  }

  return (
    <button className={className} onClick={toggle}>
      <span className="emoji">{props.emoji}</span>
      {props.label}
    </button>
  );
}

function App() {
  var oldChoice = sessionStorage.getItem("activities");
  var start = { list: [], message: "" };
  if (oldChoice !== null) {
    start = JSON.parse(oldChoice);
  }

  var [status, setStatus] = useState("loading");
  var [chosen, setChosen] = useState(start.list);
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
          window.location.href = PREVIOUS_PAGE + "?t=" + encodeURIComponent(token);
        } else {
          setStatus("ok");
        }
      } catch (error) {
        setStatus("invalid");
      }
    }
    checkLink();
  }, []);

  function toggleChoice(label) {
    var newList = [];
    var found = false;
    for (var i = 0; i < chosen.length; i++) {
      if (chosen[i] === label) {
        found = true;
      } else {
        newList.push(chosen[i]);
      }
    }
    if (found === false) {
      newList.push(label);
    }
    setChosen(newList);
  }

  function changeMessage(event) {
    setMessage(event.target.value);
  }

  function saveChoice() {
    var finalMessage = "";
    if (contains(chosen, "Autre")) {
      finalMessage = message;
    }
    var choice = { list: chosen, message: finalMessage };
    sessionStorage.setItem("activities", JSON.stringify(choice));
  }

  function goBack() {
    saveChoice();
    window.location.href = PREVIOUS_PAGE + "?t=" + encodeURIComponent(token);
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
        <p className="title">Tu as déjà répondu 💌</p>
      </Scene>
    );
  }

  var otherSelected = contains(chosen, "Autre");

  var canGoNext = chosen.length > 0;
  if (otherSelected === true && message.trim() === "") {
    canGoNext = false;
  }

  var boxes = CHOICES.map(function (choice) {
    return (
      <Choice
        key={choice.label}
        emoji={choice.emoji}
        label={choice.label}
        selected={contains(chosen, choice.label)}
        onToggle={toggleChoice}
      />
    );
  });

  return (
    <Scene>
      <div className="back-line">
        <button className="button-back" onClick={goBack}>← Retour</button>
      </div>

      <h1 className="title">Tu aimerais faire quoi ?</h1>
      <p className="text">Tu peux en choisir plusieurs</p>

      <div className="choices">{boxes}</div>

      {otherSelected ? (
        <div className="other">
          <p className="label">Propose-moi autre chose</p>
          <textarea
            className="field"
            rows="3"
            maxLength="500"
            placeholder="Décris-moi ton idée..."
            value={message}
            onChange={changeMessage}
          ></textarea>
        </div>
      ) : null}

      <button className="button" disabled={!canGoNext} onClick={goNext}>
        Suivant
      </button>
    </Scene>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);