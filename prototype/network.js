export class GameClient {
  constructor({ code = "", token = "" } = {}) {
    this.code = code.toUpperCase();
    this.token = token;
    this.listeners = new Set();
    this.state = null;
    this.events = null;
  }

  async request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: { "content-type": "application/json", ...(this.token ? { authorization: `Bearer ${this.token}` } : {}), ...options.headers },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Request failed");
    return body;
  }

  async create(playerCount) {
    return this.request("/api/sessions", { method: "POST", body: JSON.stringify({ playerCount }) });
  }

  async join(name, role) {
    return this.request(`/api/sessions/${this.code}/join`, { method: "POST", body: JSON.stringify({ name, role }) });
  }

  async load() {
    this.state = await this.request(`/api/sessions/${this.code}/state`);
    this.emit(); return this.state;
  }

  connect() {
    this.events?.close();
    const query = this.token ? `?token=${encodeURIComponent(this.token)}` : "";
    this.events = new EventSource(`/api/sessions/${this.code}/events${query}`);
    this.events.addEventListener("state", (event) => { this.state = JSON.parse(event.data); this.emit(); });
    this.events.onerror = () => document.body.classList.add("connection-lost");
    this.events.onopen = () => document.body.classList.remove("connection-lost");
  }

  async action(type, payload = {}) {
    this.state = await this.request(`/api/sessions/${this.code}/action`, { method: "POST", body: JSON.stringify({ type, payload }) });
    this.emit(); return this.state;
  }

  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emit() { this.listeners.forEach(listener => listener(this.state)); }
}

export async function getContent() {
  const response = await fetch("/api/content");
  if (!response.ok) throw new Error("Game content unavailable");
  return response.json();
}
