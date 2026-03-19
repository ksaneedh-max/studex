function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem("session", JSON.stringify(session || {}));
  } catch {}
}

export function getSession() {
  try {
    const data = localStorage.getItem("session");
    return data ? safeParse(data) || {} : {};
  } catch {
    return {};
  }
}

export function saveData(data) {
  try {
    localStorage.setItem("appData", JSON.stringify(data || {}));
  } catch {}
}

export function getData() {
  try {
    const data = localStorage.getItem("appData");
    return data ? safeParse(data) : null;
  } catch {
    return null;
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem("session");
    localStorage.removeItem("appData");
  } catch {}
}