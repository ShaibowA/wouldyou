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
    if (item.slot !== null) {
      details = details + " (" + item.slot + ")";
    }
    if (item.activity !== null) {
      details = details + "\nIdée : " + item.activity;
    }
    if (item.extra !== null && item.extra !== "") {
      details = details + "\nMessage : " + item.extra;
    }
  }

  function copy() {
    props.onCopy(item.token);
  }

  function remove() {
    props.onDelete(item);
  }

  return (
    <div className="card">
      <h3>{item.name}</h3>
      <p>{status}</p>
      {details !== "" ? <p className="details">{details}</p> : null}
      <div className="card-buttons">
        <button className="button button-small" onClick={copy}>Copier le lien</button>
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
      alert("Lien copié !");
    } catch (error) {
      prompt("Copie ce lien :", text);
    }
  }

  function copyFreshLink() {
    copyText(freshLink);
  }

  function copyLink(token) {
    copyText(getLink(token));
  }

  async function deleteLink(item) {
    var sure = window.confirm("Supprimer le lien de " + item.name + " ?");
    if (sure === false) {
      return;
    }
    await deleteInvitation(item.token);
    loadList();
  }

  if (logged === false) {
    return (
      <main className="page">
        <h1>Back office</h1>
        <input type="email" placeholder="Email" value={email} onChange={changeEmail} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={changePassword} />
        {loginError !== "" ? <p className="error">{loginError}</p> : null}
        <button className="button" onClick={handleLogin}>Se connecter</button>
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
          <button className="button button-small" onClick={copyFreshLink}>Copier le lien</button>
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