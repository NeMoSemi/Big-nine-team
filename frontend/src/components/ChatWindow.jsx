import { useState, useEffect, useRef } from 'react';
import { fetchChat, postChatMessage } from '../api/tickets';
import './ChatWindow.css';

export default function ChatWindow({ ticket }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!ticket) { setMessages([]); return; }
    fetchChat(ticket.id)
      .then(setMessages)
      .catch(() => setMessages([]));
    setInput('');
  }, [ticket?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const saved = await postChatMessage(ticket.id, 'user', text);
    setMessages((prev) => [...prev, saved]);
    // Имитация ответа бота
    setTimeout(async () => {
      const botMsg = await postChatMessage(ticket.id, 'bot', 'Понял вас. Обрабатываю запрос, скоро отвечу.');
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!ticket) {
    return (
      <div className="chat-window chat-window--empty">
        <span className="chat-empty-text">Выберите обращение для просмотра чата</span>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span className="chat-title">Чат с AI-ассистентом</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble chat-bubble--${msg.role}`}>
            {msg.role === 'bot' && <span className="chat-avatar">🤖</span>}
            <div className="chat-text">{msg.text}</div>
            {msg.role === 'user' && <span className="chat-avatar">👤</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder="Введите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim()}>
          Отправить
        </button>
      </div>
    </div>
  );
}
