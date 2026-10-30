var useState = React.useState;
var useEffect = React.useEffect;

function Invitation(props) {
  var item = props.item;

  var status = "⏳ Pas encore ouvert";
  if (item.opened_at !== null) {
    status = "👀 Lien ouvert, pas encore de réponse";
  }

  var details = "";
  if (item.answer === "yes") {
    status = "✅ A dit OUI";
    var dateText = new Date(item.date + "T12:00").toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
    details = "Jour : " + dateText;
    if (item.time !== null) {
      details = details + " à " + item.time;
    }
    if (item.activity !== null && item.activity !== "") {
      details = details + "\nActivités : " + item.activity;
    }
    if (item.activity_message !== null && item.activity_message !== "") {
      details = details + "\nAutre idée : " + item.activity_message;
    }
    if (item.pickup === "pickup") {
      details = details + "\nTu vas la chercher : " + item.place;
    }
    if (item.pickup === "meet") {
      details = details + "\nOn se retrouve : " + item.place;
    }
    if (item.message !== null && item.message !== "") {
      details = details + "\nMessage : " + item.message;
    }
  }

    var openedText = "";
  if (item.opened_at !== null) {
    openedText = "Ouvert le " + new Date(item.opened_at).toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  var [copyLabel, setCopyLabel] = useState("Copier le lien");

  async function copy() {
    var ok = await props.onCopy(item.token);
    if (ok === true) {
      setCopyLabel("Copié ✓");
    } else {
      setCopyLabel("Copie impossible");
    }
    setTimeout(function () {
      setCopyLabel("Copier le lien");
    }, 1500);
  }

  function remove() {
    props.onDelete(item);
  }

  return (
    <div className="card">
      <h3>{item.name}</h3>
      <p>{status}</p>
      {openedText !== "" ? <p>{openedText}</p> : null}
      {details !== "" ? <p className="details">{details}</p> : null}
      <div className="card-buttons">
        <button className="button button-small" onClick={copy}>{copyLabel}</button>
        <button className="button button-small button-light" onClick={remove}>Supprimer</button>
      </div>
    </div>
  );
}

function App() {
  var [logged, setLogged] = useState(isLogged());
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [loginError, setLoginError] = useState("");
  var [newName, setNewName] = useState("");
  var [freshName, setFreshName] = useState("");
  var [freshLink, setFreshLink] = useState("");
  var [freshLabel, setFreshLabel] = useState("Copier le lien");
  var [list, setList] = useState([]);

  useEffect(function () {
    if (logged === true) {
      loadList();
    }
  }, [logged]);

  async function loadList() {
    var data = await listInvitations();
    if (data === null) {
      logout();
      setLogged(false);
      return;
    }
    setList(data);
  }

  function changeEmail(event) {
    setEmail(event.target.value);
  }

  function changePassword(event) {
    setPassword(event.target.value);
  }

  function changeNewName(event) {
    setNewName(event.target.value);
  }

  async function handleLogin() {
    setLoginError("");
    var result = await login(email, password);
    if (result === "ok") {
      setLogged(true);
    } else {
      setLoginError(result);
    }
  }

  function handleLogout() {
    logout();
    setLogged(false);
  }

  async function createLink() {
    if (newName.trim() === "") {
      return;
    }
    var created = await createInvitation(newName.trim());
    if (created === null) {
      logout();
      setLogged(false);
      return;
    }
    setFreshName(created.name);
    setFreshLink(getLink(created.token));
    setNewName("");
    loadList();
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return false;
    }
  }

  async function copyFreshLink() {
    var ok = await copyText(freshLink);
    if (ok === true) {
      setFreshLabel("Copié ✓");
    } else {
      setFreshLabel("Copie impossible");
    }
    setTimeout(function () {
      setFreshLabel("Copier le lien");
    }, 1500);
  }

  function copyLink(token) {
    return copyText(getLink(token));
  }

  async function deleteLink(item) {
    await deleteInvitation(item.token);
    loadList();
  }

  if (logged === false) {
    return (
      <main className="page">
        <h1>Admin</h1>
        <input type="email" placeholder="Email" value={email} onChange={changeEmail} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={changePassword} />
        {loginError !== "" ? <p className="error">{loginError}</p> : null}
        <button className="button" onClick={handleLogin}>Login</button>
      </main>
    );
  }

  var cards = list.map(function (item) {
    return (
      <Invitation
        key={item.token}
        item={item}
        onCopy={copyLink}
        onDelete={deleteLink}
      />
    );
  });

  return (
    <main className="page">
      <div className="top">
        <h1>Mes liens</h1>
        <button className="button button-small button-light" onClick={handleLogout}>Déconnexion</button>
      </div>

      <input type="text" placeholder="Prénom de la personne" value={newName} onChange={changeNewName} />
      <button className="button button-full" onClick={createLink}>Créer le lien</button>

      {freshLink !== "" ? (
        <div className="card new-link">
          <h3>Lien pour {freshName}</h3>
          <p className="link">{freshLink}</p>
          <button className="button button-small" onClick={copyFreshLink}>{freshLabel}</button>
        </div>
      ) : null}

      <div className="top">
        <h2>Réponses</h2>
        <button className="button button-small button-light" onClick={loadList}>Actualiser</button>
      </div>

      {list.length === 0 ? <p>Aucun lien pour l’instant.</p> : cards}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);