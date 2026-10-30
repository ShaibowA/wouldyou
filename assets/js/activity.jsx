var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

var PREVIOUS_PAGE = "calend.html";
var NEXT_PAGE = "place.html";

var CHOICES = [
  { emoji: "✨", label: "Shopping" },
  { emoji: "✨", label: "Patinoire" },
  { emoji: "✨", label: "Concert" },
  { emoji: "✨", label: "Arcade Games" },
  { emoji: "✨", label: "Sport" },
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
      <img className="frame frame-right" src="assets/img/activity/Yoichi.png" alt="" />
      <main className="card">{props.children}</main>
    </div>
  );
}

function Choice(props) {
  var className = "choice";
  if (props.tone !== undefined) {
    className = className + " tone-" + props.tone;
  }
  if (props.selected === true) {
    className = className + " selected";
  }

  function toggle() {
    props.onToggle(props.label);
  }

  return (
    <button className={className} disabled={props.disabled} onClick={toggle}>
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
    var isSelected = contains(chosen, label);

    if (isSelected === true) {
      var newList = [];
      for (var i = 0; i < chosen.length; i++) {
        if (chosen[i] !== label) {
          newList.push(chosen[i]);
        }
      }
      setChosen(newList);
      return;
    }

    if (label === "Autre") {
      if (chosen.length === 0) {
        setChosen(["Autre"]);
      }
      return;
    }

    if (contains(chosen, "Autre") === true) {
      return;
    }

    if (chosen.length >= 3) {
      return;
    }

    setChosen(chosen.concat([label]));
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
    var selected = contains(chosen, choice.label);
    var disabled = false;

    if (selected === false) {
      if (choice.label === "Autre") {
        disabled = chosen.length > 0;
      } else {
        disabled = otherSelected === true || chosen.length >= 3;
      }
    }

    return (
      <Choice
        key={choice.label}
        emoji={choice.emoji}
        label={choice.label}
        tone={choice.tone}
        selected={selected}
        disabled={disabled}
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
      <p className="text">Tu peux choisir jusqu'à 3 propositions ou autre</p>
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