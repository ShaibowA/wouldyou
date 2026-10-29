var baseUrl = CONFIG.SUPABASE_URL;
var apiKey = CONFIG.SUPABASE_ANON_KEY;
var jwt = sessionStorage.getItem("jwt");

if (jwt === null) {
  jwt = "";
}

var position = baseUrl.indexOf(".supabase.co");
if (position !== -1) {
  baseUrl = baseUrl.substring(0, position + 12);
}

function getHeaders() {
  var headers = {};
  headers["apikey"] = apiKey;
  headers["Content-Type"] = "application/json";
  if (jwt !== "") {
    headers["Authorization"] = "Bearer " + jwt;
  }
  return headers;
}

async function openInvitation(token) {
  var response = await fetch(baseUrl + "/rest/v1/rpc/open_invitation", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ p_token: token })
  });
  if (response.ok === false) {
    throw new Error("Erreur open_invitation");
  }
  return await response.json();
}

function isLogged() {
  return jwt !== "";
}

async function login(email, password) {
  if (baseUrl === "" || apiKey === "") {
    return "Le fichier config.js n'est pas rempli.";
  }
  var headers = {};
  headers["apikey"] = apiKey;
  headers["Content-Type"] = "application/json";
  var response;
  try {
    response = await fetch(baseUrl + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ email: email, password: password })
    });
  } catch (error) {
    return "Impossible de joindre Supabase.";
  }
  var data = await response.json();
  if (response.ok === false) {
    if (data.error_description) {
      return data.error_description;
    }
    if (data.msg) {
      return data.msg;
    }
    return "Connexion impossible.";
  }
  jwt = data.access_token;
  sessionStorage.setItem("jwt", jwt);
  return "ok";
}

function logout() {
  jwt = "";
  sessionStorage.removeItem("jwt");
}

async function listInvitations() {
  var response = await fetch(baseUrl + "/rest/v1/invitations?select=*&order=created_at.desc", {
    method: "GET",
    headers: getHeaders()
  });
  if (response.ok === false) {
    return null;
  }
  return await response.json();
}

async function createInvitation(name) {
  var headers = getHeaders();
  headers["Prefer"] = "return=representation";
  var response = await fetch(baseUrl + "/rest/v1/invitations", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ name: name })
  });
  if (response.ok === false) {
    return null;
  }
  var data = await response.json();
  return data[0];
}

async function deleteInvitation(token) {
  await fetch(baseUrl + "/rest/v1/invitations?token=eq." + encodeURIComponent(token), {
    method: "DELETE",
    headers: getHeaders()
  });
}

function getLink(token) {
  var pageUrl = window.location.href.split("admin.html")[0];
  return pageUrl + "?t=" + token;
}

