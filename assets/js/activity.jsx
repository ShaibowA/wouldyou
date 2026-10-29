var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

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
          window.location.href = "calend.html?t=" + encodeURIComponent(token);
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
    window.location.href = "calend.html?t=" + encodeURIComponent(token);
  }

  function goNext() {
    saveChoice();
    window.location.href = "lieu.html?t=" + encodeURIComponent(token);
  }

  if (status === "loading") {
    return (
      <div className="page">
        <main className="card">
          <p className="title">...</p>
        </main>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="page">
        <main className="card">
          <p className="title">Ce lien ne marche pas.</p>
        </main>
      </div>
    );
  }

  if (status === "answered") {
    return (
      <div className="page">
        <main className="card">
          <p className="title">Tu as déjà répondu 💌</p>
        </main>
      </div>
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
    <div className="page">
      <main className="card">
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
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);