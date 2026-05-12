import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;

// ─── helpers ────────────────────────────────────────────────────────────────
function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("bb_token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bb_user")); } catch { return null; }
  });
  const login = (tok, u) => {
    localStorage.setItem("bb_token", tok);
    localStorage.setItem("bb_user", JSON.stringify(u));
    setToken(tok); setUser(u);
  };
  const logout = () => {
    localStorage.removeItem("bb_token"); localStorage.removeItem("bb_user");
    setToken(null); setUser(null);
  };
  return { token, user, login, logout };
}

async function apiFetch(path, { token, method = "GET", body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── tiny design tokens ──────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0e0f11;
    --surface: #16181c;
    --border: #272b33;
    --accent: #7c6af7;
    --accent-dim: #4a40a8;
    --text: #e8e9ec;
    --muted: #7a7f8a;
    --green: #3dd68c;
    --red: #f0605d;
    --yellow: #f5c542;
    --radius: 10px;
    --font: 'Syne', sans-serif;
    --mono: 'DM Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; }

  /* layout */
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 210px; background: var(--surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 24px 16px; gap: 4px; flex-shrink: 0; }
  .main { flex: 1; overflow-y: auto; padding: 32px; max-width: 900px; }

  /* logo */
  .logo { font-size: 18px; font-weight: 800; color: var(--accent); margin-bottom: 28px; letter-spacing: -0.5px; }
  .logo span { color: var(--text); }

  /* nav */
  .nav-btn { background: none; border: none; color: var(--muted); font-family: var(--font);
    font-size: 14px; font-weight: 600; padding: 9px 12px; border-radius: 8px; cursor: pointer;
    text-align: left; width: 100%; transition: all .15s; display: flex; align-items: center; gap: 8px; }
  .nav-btn:hover { background: var(--border); color: var(--text); }
  .nav-btn.active { background: var(--accent-dim); color: #fff; }

  /* cards */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 20px; margin-bottom: 14px; transition: border-color .15s; }
  .card:hover { border-color: var(--accent-dim); }
  .card-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .card-meta { font-size: 12px; color: var(--muted); font-family: var(--mono); }
  .card-body { font-size: 13px; color: var(--muted); margin-top: 8px; line-height: 1.6; }

  /* badges */
  .badge { display: inline-block; font-family: var(--mono); font-size: 11px; padding: 2px 8px;
    border-radius: 99px; font-weight: 500; }
  .badge-easy { background: #1a3d2b; color: var(--green); }
  .badge-medium { background: #3a2e0a; color: var(--yellow); }
  .badge-hard { background: #3a1010; color: var(--red); }
  .badge-lang { background: #1e1f2e; color: var(--accent); }
  .badge-tag { background: var(--border); color: var(--muted); margin-right: 4px; }

  /* forms */
  .form-group { margin-bottom: 16px; }
  label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; letter-spacing: .05em; text-transform: uppercase; }
  input, textarea, select {
    width: 100%; background: var(--bg); border: 1px solid var(--border);
    color: var(--text); font-family: var(--font); font-size: 14px; padding: 10px 14px;
    border-radius: 8px; outline: none; transition: border-color .15s; }
  input:focus, textarea:focus, select:focus { border-color: var(--accent); }
  textarea { resize: vertical; min-height: 90px; font-family: var(--mono); }

  /* buttons */
  .btn { cursor: pointer; font-family: var(--font); font-weight: 700; font-size: 13px;
    padding: 10px 18px; border-radius: 8px; border: none; transition: all .15s; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #9085fa; }
  .btn-ghost { background: var(--border); color: var(--text); }
  .btn-ghost:hover { background: #303540; }
  .btn-danger { background: #3a1010; color: var(--red); }
  .btn-sm { padding: 6px 12px; font-size: 12px; }

  /* misc */
  .page-title { font-size: 24px; font-weight: 800; margin-bottom: 24px; }
  .error { color: var(--red); font-size: 13px; margin-top: 8px; }
  .success { color: var(--green); font-size: 13px; margin-top: 8px; }
  .empty { color: var(--muted); font-size: 14px; text-align: center; padding: 60px 0; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; }
  .spacer { flex: 1; }
  .code-block { background: #0a0b0d; border: 1px solid var(--border); border-radius: 8px;
    padding: 14px; font-family: var(--mono); font-size: 12px; white-space: pre-wrap;
    overflow-x: auto; color: #a8d4f5; margin-top: 10px; }
  .answer { background: #12141a; border-left: 3px solid var(--border); padding: 12px 16px;
    border-radius: 0 8px 8px 0; margin-top: 10px; }
  .answer.accepted { border-color: var(--green); }
  .user-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); font-family: var(--mono); }
  .sidebar-footer { margin-top: auto; }
  .loading { color: var(--muted); font-size: 14px; padding: 40px 0; text-align: center; }
  .filter-row { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  select { width: auto; }
  .stat { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--muted); font-family: var(--mono); }
`;

// ─── Auth Page ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "learner" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const data = await apiFetch(path, { method: "POST", body });
      onLogin(data.token, data.user);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ width: 380 }}>
        <div className="logo" style={{ textAlign: "center", marginBottom: 32, fontSize: 26 }}>
          Brain<span>Bytes</span>
        </div>
        <div className="card">
          <div className="row" style={{ marginBottom: 20 }}>
            <button className={`btn ${mode === "login" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("login")}>Login</button>
            <button className={`btn ${mode === "register" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("register")}>Register</button>
          </div>
          {mode === "register" && (
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={set("username")} placeholder="johndoe" />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />
          </div>
          {mode === "register" && (
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={set("role")}>
                <option value="learner">Learner</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
          )}
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={submit} disabled={loading}>
            {loading ? "..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Problems ────────────────────────────────────────────────────────────────
function ProblemsPage({ token, user }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", difficulty: "easy", examples: "" });
  const [submission, setSubmission] = useState({ code: "", language: "javascript", explanation: "" });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter ? `/problems?difficulty=${filter}` : "/problems";
      setProblems(await apiFetch(url, { token }));
    } catch {}
    setLoading(false);
  }, [token, filter]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    try {
      await apiFetch("/problems", { token, method: "POST", body: form });
      setShowNew(false); load();
    } catch (e) { setMsg(e.message); }
  };

  const submit = async () => {
    try {
      await apiFetch(`/problems/${selected._id}/submit`, { token, method: "POST", body: submission });
      setMsg("Solution submitted!"); setSubmission({ code: "", language: "javascript", explanation: "" });
    } catch (e) { setMsg(e.message); }
  };

  if (selected) {
    return (
      <div>
        <div className="row">
          <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setMsg(""); }}>← Back</button>
          <h2 className="page-title" style={{ margin: 0 }}>{selected.title}</h2>
          <span className={`badge badge-${selected.difficulty}`}>{selected.difficulty}</span>
        </div>
        <div className="card">
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>{selected.description}</div>
          {selected.examples?.length > 0 && (
            <div className="code-block">{selected.examples.join("\n")}</div>
          )}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Submit Solution</h3>
        <div className="card">
          <div className="form-group">
            <label>Language</label>
            <select value={submission.language} onChange={e => setSubmission(s => ({ ...s, language: e.target.value }))}>
              {["javascript", "python", "java", "cpp", "typescript"].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Code</label>
            <textarea value={submission.code} onChange={e => setSubmission(s => ({ ...s, code: e.target.value }))} rows={8} />
          </div>
          <div className="form-group">
            <label>Explanation</label>
            <textarea value={submission.explanation} onChange={e => setSubmission(s => ({ ...s, explanation: e.target.value }))} rows={3} />
          </div>
          {msg && <div className={msg.includes("!") ? "success" : "error"}>{msg}</div>}
          <button className="btn btn-primary" onClick={submit}>Submit</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <h1 className="page-title" style={{ margin: 0 }}>Problems</h1>
        <div className="spacer" />
        {user?.role === "mentor" && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowNew(!showNew)}>+ New Problem</button>
        )}
      </div>

      {showNew && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="form-group">
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>
          {msg && <div className="error">{msg}</div>}
          <button className="btn btn-primary btn-sm" onClick={create}>Create</button>
        </div>
      )}

      <div className="filter-row">
        {["", "easy", "medium", "hard"].map(d => (
          <button key={d} className={`btn btn-sm ${filter === d ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(d)}>
            {d || "All"}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : problems.length === 0 ? <div className="empty">No problems yet.</div> :
        problems.map(p => (
          <div className="card" key={p._id} style={{ cursor: "pointer" }} onClick={() => setSelected(p)}>
            <div className="row" style={{ marginBottom: 0 }}>
              <span className="card-title">{p.title}</span>
              <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
            </div>
            <div className="card-meta" style={{ marginTop: 6 }}>by {p.author?.username || "unknown"}</div>
          </div>
        ))
      }
    </div>
  );
}

// ─── Forum ───────────────────────────────────────────────────────────────────
function ForumPage({ token, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", tags: "" });
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setPosts(await apiFetch("/forum", { token })); } catch {}
    setLoading(false);
  }, [token]);

  const loadPost = async (id) => {
    try { setSelected(await apiFetch(`/forum/${id}`, { token })); } catch {}
  };

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    try {
      await apiFetch("/forum", { token, method: "POST", body: { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) } });
      setShowNew(false); setForm({ title: "", body: "", tags: "" }); load();
    } catch (e) { setMsg(e.message); }
  };

  const postAnswer = async () => {
    try {
      await apiFetch(`/forum/${selected._id}/answers`, { token, method: "POST", body: { body: answer } });
      setAnswer(""); loadPost(selected._id);
    } catch (e) { setMsg(e.message); }
  };

  const vote = async (answerId, direction) => {
    try {
      await apiFetch(`/forum/${selected._id}/answers/${answerId}/vote`, { token, method: "POST", body: { direction } });
      loadPost(selected._id);
    } catch {}
  };

  if (selected) return (
    <div>
      <div className="row">
        <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setMsg(""); }}>← Back</button>
        {selected.solved && <span className="badge badge-easy">✓ Solved</span>}
      </div>
      <div className="card">
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{selected.title}</h2>
        <div className="user-chip">by {selected.author?.username} · {selected.views} views</div>
        <div style={{ fontSize: 14, lineHeight: 1.8, marginTop: 12 }}>{selected.body}</div>
        <div style={{ marginTop: 10 }}>
          {selected.tags?.map(t => <span key={t} className="badge badge-tag">#{t}</span>)}
        </div>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "20px 0 12px" }}>{selected.answers?.length || 0} Answers</h3>
      {selected.answers?.map(a => (
        <div key={a._id} className={`answer ${a.isAccepted ? "accepted" : ""}`}>
          <div style={{ fontSize: 14, lineHeight: 1.7 }}>{a.body}</div>
          <div className="row" style={{ marginTop: 10, marginBottom: 0 }}>
            <span className="user-chip">{a.user?.username}</span>
            <div className="spacer" />
            <button className="btn btn-ghost btn-sm" onClick={() => vote(a._id, "up")}>▲ {a.votes || 0}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => vote(a._id, "down")}>▼</button>
          </div>
        </div>
      ))}

      <div className="card" style={{ marginTop: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Your Answer</label>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4} />
        {msg && <div className="error">{msg}</div>}
        <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={postAnswer}>Post Answer</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="row">
        <h1 className="page-title" style={{ margin: 0 }}>Forum</h1>
        <div className="spacer" />
        <button className="btn btn-primary btn-sm" onClick={() => setShowNew(!showNew)}>+ New Post</button>
      </div>

      {showNew && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label>Body</label><textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} /></div>
          <div className="form-group"><label>Tags (comma separated)</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="javascript, react, css" /></div>
          {msg && <div className="error">{msg}</div>}
          <button className="btn btn-primary btn-sm" onClick={create}>Post</button>
        </div>
      )}

      {loading ? <div className="loading">Loading...</div> : posts.length === 0 ? <div className="empty">No posts yet.</div> :
        posts.map(p => (
          <div className="card" key={p._id} style={{ cursor: "pointer" }} onClick={() => loadPost(p._id)}>
            <div className="row" style={{ marginBottom: 4 }}>
              <span className="card-title">{p.title}</span>
              {p.solved && <span className="badge badge-easy">✓</span>}
            </div>
            <div className="card-meta">
              by {p.author?.username} · {p.answers?.length || 0} answers · {p.views || 0} views
            </div>
            <div style={{ marginTop: 8 }}>
              {p.tags?.map(t => <span key={t} className="badge badge-tag">#{t}</span>)}
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ─── Snippets ────────────────────────────────────────────────────────────────
function SnippetsPage({ token, user }) {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", code: "", language: "javascript", description: "" });
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter ? `/snippets?language=${filter}` : "/snippets";
      setSnippets(await apiFetch(url, { token }));
    } catch {}
    setLoading(false);
  }, [token, filter]);

  useEffect(() => { load(); }, [load]);

  const loadSnippet = async (id) => {
    try { setSelected(await apiFetch(`/snippets/${id}`, { token })); } catch {}
  };

  const create = async () => {
    try {
      await apiFetch("/snippets", { token, method: "POST", body: form });
      setShowNew(false); load();
    } catch (e) { setMsg(e.message); }
  };

  const like = async () => {
    try {
      await apiFetch(`/snippets/${selected._id}/like`, { token, method: "POST" });
      loadSnippet(selected._id);
    } catch {}
  };

  const postComment = async () => {
    try {
      await apiFetch(`/snippets/${selected._id}/comments`, { token, method: "POST", body: { text: comment } });
      setComment(""); loadSnippet(selected._id);
    } catch (e) { setMsg(e.message); }
  };

  const deleteSnippet = async () => {
    if (!confirm("Delete this snippet?")) return;
    try {
      await apiFetch(`/snippets/${selected._id}`, { token, method: "DELETE" });
      setSelected(null); load();
    } catch (e) { setMsg(e.message); }
  };

  const langs = ["javascript", "python", "typescript", "java", "cpp", "go", "rust"];

  if (selected) return (
    <div>
      <div className="row">
        <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setMsg(""); }}>← Back</button>
        <span className={`badge badge-lang`}>{selected.language}</span>
        <div className="spacer" />
        {selected.author?._id === user?.id && (
          <button className="btn btn-danger btn-sm" onClick={deleteSnippet}>Delete</button>
        )}
      </div>
      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{selected.title}</h2>
        <div className="user-chip">by {selected.author?.username}</div>
        {selected.description && <div className="card-body">{selected.description}</div>}
        <div className="code-block">{selected.code}</div>
        <div className="row" style={{ marginTop: 14, marginBottom: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={like}>♥ {selected.likes?.length || 0} Likes</button>
          <span className="stat">💬 {selected.comments?.length || 0} comments</span>
        </div>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "20px 0 12px" }}>Comments</h3>
      {selected.comments?.map(c => (
        <div key={c._id} className="answer">
          <div style={{ fontSize: 13 }}>{c.text}</div>
          <div className="user-chip" style={{ marginTop: 6 }}>{c.user?.username}</div>
        </div>
      ))}
      <div className="card" style={{ marginTop: 14 }}>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Add a comment..." />
        {msg && <div className="error">{msg}</div>}
        <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={postComment}>Comment</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="row">
        <h1 className="page-title" style={{ margin: 0 }}>Snippets</h1>
        <div className="spacer" />
        <button className="btn btn-primary btn-sm" onClick={() => setShowNew(!showNew)}>+ New Snippet</button>
      </div>

      {showNew && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group">
            <label>Language</label>
            <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
              {langs.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Code</label><textarea value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} rows={6} /></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
          {msg && <div className="error">{msg}</div>}
          <button className="btn btn-primary btn-sm" onClick={create}>Save Snippet</button>
        </div>
      )}

      <div className="filter-row">
        <button className={`btn btn-sm ${filter === "" ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter("")}>All</button>
        {langs.map(l => (
          <button key={l} className={`btn btn-sm ${filter === l ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(l)}>{l}</button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : snippets.length === 0 ? <div className="empty">No snippets yet.</div> :
        snippets.map(s => (
          <div className="card" key={s._id} style={{ cursor: "pointer" }} onClick={() => loadSnippet(s._id)}>
            <div className="row" style={{ marginBottom: 4 }}>
              <span className="card-title">{s.title}</span>
              <span className="badge badge-lang">{s.language}</span>
            </div>
            <div className="card-meta">by {s.author?.username} · ♥ {s.likes?.length || 0}</div>
            {s.description && <div className="card-body">{s.description}</div>}
          </div>
        ))
      }
    </div>
  );
}

// ─── Projects ────────────────────────────────────────────────────────────────
function ProjectsPage({ token, user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", techStack: "", githubLink: "" });
  const [invite, setInvite] = useState("");
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setProjects(await apiFetch("/projects", { token })); } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const loadProject = async (id) => {
    try { setSelected(await apiFetch(`/projects/${id}`, { token })); } catch {}
  };

  const create = async () => {
    try {
      const body = { ...form, techStack: form.techStack.split(",").map(t => t.trim()).filter(Boolean) };
      await apiFetch("/projects", { token, method: "POST", body });
      setShowNew(false); load();
    } catch (e) { setMsg(e.message); }
  };

  const sendInvite = async () => {
    try {
      const res = await apiFetch(`/projects/${selected._id}/invite`, { token, method: "POST", body: { username: invite } });
      setMsg(res.message); setInvite(""); loadProject(selected._id);
    } catch (e) { setMsg(e.message); }
  };

  const postComment = async () => {
    try {
      await apiFetch(`/projects/${selected._id}/discussion`, { token, method: "POST", body: { text: comment } });
      setComment(""); loadProject(selected._id);
    } catch (e) { setMsg(e.message); }
  };

  if (selected) return (
    <div>
      <div className="row">
        <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setMsg(""); }}>← Back</button>
        <span className="badge badge-lang">{selected.status}</span>
      </div>
      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{selected.title}</h2>
        <div className="user-chip">by {selected.owner?.username}</div>
        <div className="card-body">{selected.description}</div>
        {selected.techStack?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {selected.techStack.map(t => <span key={t} className="badge badge-tag">{t}</span>)}
          </div>
        )}
        {selected.githubLink && (
          <a href={selected.githubLink} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)" }}>
            → GitHub
          </a>
        )}
        <div style={{ marginTop: 14 }}>
          <span className="card-meta">Members: {selected.members?.map(m => m.username).join(", ")}</span>
        </div>
      </div>

      {selected.owner?._id === user?.id && (
        <div className="card" style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>Invite Member</label>
          <div className="row" style={{ marginBottom: 0 }}>
            <input value={invite} onChange={e => setInvite(e.target.value)} placeholder="username" style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" onClick={sendInvite}>Invite</button>
          </div>
          {msg && <div className={msg.includes("added") ? "success" : "error"} style={{ marginTop: 8 }}>{msg}</div>}
        </div>
      )}

      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "20px 0 12px" }}>Discussion</h3>
      {selected.discussion?.map(d => (
        <div key={d._id} className="answer">
          <div style={{ fontSize: 13 }}>{d.text}</div>
          <div className="user-chip" style={{ marginTop: 6 }}>{d.user?.username}</div>
        </div>
      ))}
      <div className="card" style={{ marginTop: 14 }}>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Add to discussion..." />
        <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={postComment}>Post</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="row">
        <h1 className="page-title" style={{ margin: 0 }}>Projects</h1>
        <div className="spacer" />
        <button className="btn btn-primary btn-sm" onClick={() => setShowNew(!showNew)}>+ New Project</button>
      </div>

      {showNew && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="form-group"><label>Tech Stack (comma separated)</label><input value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} /></div>
          <div className="form-group"><label>GitHub Link</label><input value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))} /></div>
          {msg && <div className="error">{msg}</div>}
          <button className="btn btn-primary btn-sm" onClick={create}>Create Project</button>
        </div>
      )}

      {loading ? <div className="loading">Loading...</div> : projects.length === 0 ? <div className="empty">No projects yet.</div> :
        projects.map(p => (
          <div className="card" key={p._id} style={{ cursor: "pointer" }} onClick={() => loadProject(p._id)}>
            <div className="row" style={{ marginBottom: 4 }}>
              <span className="card-title">{p.title}</span>
              <span className="badge badge-lang">{p.status}</span>
            </div>
            <div className="card-meta">by {p.owner?.username} · {p.members?.length || 0} members</div>
            <div className="card-body">{p.description}</div>
          </div>
        ))
      }
    </div>
  );
}

// ─── App shell ───────────────────────────────────────────────────────────────
const PAGES = [
  { id: "problems", label: "🧩 Problems" },
  { id: "forum",    label: "💬 Forum" },
  { id: "snippets", label: "📋 Snippets" },
  { id: "projects", label: "🚀 Projects" },
];

export default function App() {
  const { token, user, login, logout } = useAuth();
  const [page, setPage] = useState("problems");

  if (!token) return (
    <>
      <style>{styles}</style>
      <AuthPage onLogin={login} />
    </>
  );

  const renderPage = () => {
    const props = { token, user };
    switch (page) {
      case "problems": return <ProblemsPage {...props} />;
      case "forum":    return <ForumPage {...props} />;
      case "snippets": return <SnippetsPage {...props} />;
      case "projects": return <ProjectsPage {...props} />;
      default:         return null;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">Brain<span>Bytes</span></div>
          {PAGES.map(p => (
            <button
              key={p.id}
              className={`nav-btn ${page === p.id ? "active" : ""}`}
              onClick={() => setPage(p.id)}
            >
              {p.label}
            </button>
          ))}
          <div className="sidebar-footer">
            <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 10 }}>
              {user?.username}<br />
              <span style={{ opacity: 0.6 }}>{user?.role}</span>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={logout}>Logout</button>
          </div>
        </aside>
        <main className="main">
          {renderPage()}
        </main>
      </div>
    </>
  );
}     