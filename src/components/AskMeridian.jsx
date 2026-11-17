import { useEffect, useRef, useState } from "react";
import { requestAI } from "../services/ai";
import { buildChatContext } from "../utils/aiContext";

const SUGGESTIONS = [
  "Do I need an umbrella today?",
  "When is the best time to go out tomorrow?",
  "What should I wear this evening?",
];

function AskMeridian({ location, weather }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");
  const endRef = useRef(null);

  // Keep the newest message in view
  useEffect(() => {
    if (messages.length > 0) {
      endRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [messages, status]);

  async function send(text) {
    const question = text.trim();
    if (!question || status === "loading") return;

    const next = [...messages, { role: "user", text: question }];
    setMessages(next);
    setDraft("");
    setStatus("loading");
    setError("");

    try {
      const answer = await requestAI({
        mode: "chat",
        context: buildChatContext({ location, weather }),
        messages: next.slice(-8),
      });
      setMessages([...next, { role: "assistant", text: answer }]);
      setStatus("idle");
    } catch (err) {
      // Put the question back in the box so it can be sent again
      setMessages(messages);
      setDraft(question);
      setError(err.message);
      setStatus("error");
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
    setStatus("idle");
  }

  return (
    <section className="card ask" aria-label="Ask Meridian">
      <h3 className="sheet-title">Ask Meridian</h3>

      {messages.length === 0 && (
        <div className="ask-chips">
          {SUGGESTIONS.map((s) => (
            <button
              type="button"
              key={s}
              className="ask-chip"
              onClick={() => send(s)}
              disabled={status === "loading"}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {(messages.length > 0 || status === "loading") && (
        <ul className="chat-log" aria-live="polite">
          {messages.map((m, i) => (
            <li key={i} className={`chat-msg chat-${m.role}`}>
              {m.text}
            </li>
          ))}
          {status === "loading" && (
            <li className="chat-wait" role="status">
              <div className="spinner" />
              Checking the forecast...
            </li>
          )}
          <li ref={endRef} aria-hidden="true" />
        </ul>
      )}

      {status === "error" && <p className="ask-error">{error}</p>}

      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <input
          type="text"
          value={draft}
          maxLength={300}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Ask about the weather in ${location.name}`}
          aria-label="Your question"
        />
        <button
          type="submit"
          className="retry-btn"
          disabled={status === "loading" || !draft.trim()}
        >
          Ask
        </button>
      </form>

      <div className="ask-foot">
        <span className="muted">
          Answers come from this city's forecast and can be wrong.
        </span>
        {messages.length > 0 && (
          <button type="button" className="briefing-link" onClick={clearChat}>
            Clear chat
          </button>
        )}
      </div>
    </section>
  );
}

export default AskMeridian;