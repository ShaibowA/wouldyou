var useState = React.useState;
var useEffect = React.useEffect;

var token = new URLSearchParams(window.location.search).get("t");

var MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

var WEEKDAYS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

var TIMES = [];
for (var hour = 10; hour < 20; hour++) {
  TIMES.push(pad(hour) + ":00");
  TIMES.push(pad(hour) + ":30");
}

function pad(number) {
  if (number < 10) {
    return "0" + number;
  }
  return "" + number;
}

function dateToText(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

function Day(props) {
  var text = dateToText(props.date);
  var className = "day";
  if (text === props.selected) {
    className = className + " selected";
  }
  if (props.date.getTime() === props.today.getTime()) {
    className = className + " today";
  }
  var isPast = props.date < props.today;

  function pick() {
    props.onPick(text);
  }

  return (
    <button className={className} disabled={isPast} onClick={pick}>
      {props.date.getDate()}
    </button>
  );
}

function Calendar(props) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var [year, setYear] = useState(today.getFullYear());
  var [month, setMonth] = useState(today.getMonth());

  var firstDay = new Date(year, month, 1);
  var emptyBoxes = (firstDay.getDay() + 6) % 7;
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  function previousMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  var boxes = [];

  for (var i = 0; i < emptyBoxes; i++) {
    boxes.push(<span key={"empty" + i}></span>);
  }

  for (var day = 1; day <= daysInMonth; day++) {
    var date = new Date(year, month, day);
    boxes.push(
      <Day
        key={"day" + day}
        date={date}
        today={today}
        selected={props.selected}
        onPick={props.onPick}
      />
    );
  }

  var weekdayNames = WEEKDAYS.map(function (name) {
    return <span key={name} className="weekday">{name}</span>;
  });

  return (
    <div className="calendar">
      <div className="calendar-top">
        <button className="arrow" onClick={previousMonth} disabled={isCurrentMonth}>‹</button>
        <span>{MONTHS[month]} {year}</span>
        <button className="arrow" onClick={nextMonth}>›</button>
      </div>
      <div className="calendar-grid">
        {weekdayNames}
        {boxes}
      </div>
    </div>
  );
}

function Time(props) {
  var className = "time";
  if (props.time === props.selected) {
    className = className + " selected";
  }

  function pick() {
    props.onPick(props.time);
  }

  return (
    <button className={className} disabled={props.passed} onClick={pick}>
      {props.time}
    </button>
  );
}

function Times(props) {
  var now = new Date();
  var todayText = dateToText(now);
  var nowText = pad(now.getHours()) + ":" + pad(now.getMinutes());

  var buttons = TIMES.map(function (time) {
    var passed = props.date === todayText && time <= nowText;
    return (
      <Time
        key={time}
        time={time}
        selected={props.selected}
        passed={passed}
        onPick={props.onPick}
      />
    );
  });

  return <div className="times">{buttons}</div>;
}

function Scene(props) {
  return (
    <div className="page">
      <div className="cloud cloud-left"></div>
      <div className="cloud cloud-right"></div>

      <span className="star star1">✦</span>
      <span className="star star2">✧</span>

      <img className="side side-left" src="assets/img/calendar/vegeta.jpg" alt="" />
      <img className="side side-right" src="assets/img/calendar/goku_montain.jpg" alt="" />

      <main className="card">{props.children}</main>
    </div>
  );
}

function App() {
  var [status, setStatus] = useState("loading");
  var [date, setDate] = useState("");
  var [time, setTime] = useState("");

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

  function pickDate(newDate) {
    setDate(newDate);
    setTime("");
  }

  function pickTime(newTime) {
    setTime(newTime);
  }

  function goBack() {
    window.location.href = "index.html?t=" + encodeURIComponent(token);
  }

  function validateSlot() {
    var choice = { date: date, time: time };
    sessionStorage.setItem("rdv", JSON.stringify(choice));
    window.location.href = "activity.html?t=" + encodeURIComponent(token);
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

  var dateText = "";
  if (date !== "") {
    dateText = new Date(date + "T12:00").toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  var summary = "Choisis un jour puis une heure";
  if (date !== "" && time !== "") {
    summary = dateText + " à " + time;
  }

  var canValidate = date !== "" && time !== "";

  return (
    <Scene>
      <div className="back-line">
        <button className="button-back" onClick={goBack}>← Retour</button>
      </div>
      <h1 className="title">Parfait ! Quand es-tu dispo ?</h1>

      <Calendar selected={date} onPick={pickDate} />

      {date !== "" ? (
        <div>
          <h2 className="subtitle">À quelle heure ?</h2>
          <Times date={date} selected={time} onPick={pickTime} />
        </div>
      ) : null}

      <div className="bottom">
        <p className="text">{summary}</p>
        <button className="button" disabled={!canValidate} onClick={validateSlot}>
          Valider ce créneau
        </button>
      </div>
    </Scene>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);