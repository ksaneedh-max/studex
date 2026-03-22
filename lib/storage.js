function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// 🔹 Helper: check valid session
function isValidSession(session) {
  return session && Object.keys(session).length > 0;
}

// =========================
// ✅ SESSION
// =========================

export function saveSession(session) {
  try {
    if (isValidSession(session)) {
      localStorage.setItem("session", JSON.stringify(session));
    } else {
      localStorage.removeItem("session");
    }
  } catch {}
}

export function getSession() {
  try {
    const data = localStorage.getItem("session");
    const parsed = data ? safeParse(data) : null;

    return isValidSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// =========================
// ✅ APP DATA + TIMESTAMP 🔥
// =========================

export function saveData(data) {
  try {
    localStorage.setItem("appData", JSON.stringify(data || {}));

    // 🔥 NEW: track last fetch time
    localStorage.setItem("lastFetch", Date.now().toString());
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

// 🔥 NEW: get last fetch time
export function getLastFetch() {
  try {
    const time = localStorage.getItem("lastFetch");
    return time ? Number(time) : null;
  } catch {
    return null;
  }
}

// =========================
// ✅ OPTIONAL CLASS SELECTIONS
// =========================

export function saveOptionalSelections(data) {
  try {
    localStorage.setItem(
      "optionalSlots",
      JSON.stringify(data || {})
    );
  } catch {}
}

export function getOptionalSelections() {
  try {
    const data = localStorage.getItem("optionalSlots");
    return data ? safeParse(data) || {} : {};
  } catch {
    return {};
  }
}

// =========================
// ✅ OPTIONAL OVERRIDES
// =========================

export function saveOverrides(data) {
  try {
    localStorage.setItem(
      "optionalOverrides",
      JSON.stringify(data || {})
    );
  } catch {}
}

export function getOverrides() {
  try {
    const data = localStorage.getItem("optionalOverrides");
    return data ? safeParse(data) || {} : {};
  } catch {
    return {};
  }
}

// =========================
// ✅ CLEAR STORAGE
// =========================

export function clearStorage() {
  try {
    localStorage.removeItem("session");
    localStorage.removeItem("appData");
    localStorage.removeItem("lastFetch"); // 🔥 NEW
    localStorage.removeItem("optionalSlots");
    localStorage.removeItem("optionalOverrides");
  } catch {}
}