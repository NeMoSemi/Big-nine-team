import { useState } from 'react';
import { updateTicketResponse, sendResponse } from '../api/tickets';
import './ResponseEditor.css';

export default function ResponseEditor({ ticket }) {
  const [text, setText] = useState(ticket.ai_response || '');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  async function handleSave() {
    setSaving(true);
    await updateTicketResponse(ticket.id, text);
    setSaving(false);
    setSaveMsg('Сохранено');
    setTimeout(() => setSaveMsg(''), 2000);
  }

  async function handleSend() {
    setSending(true);
    await sendResponse(ticket.id);
    setSending(false);
    setSent(true);
  }

  return (
    <div className="response-editor">
      <div className="response-editor-label">
        Черновик ответа (сгенерирован AI)
      </div>
      <textarea
        className="response-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        disabled={sent}
      />
      {!sent ? (
        <div className="response-actions">
          <button className="btn btn-secondary" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить черновик'}
          </button>
          {saveMsg && <span className="save-msg">{saveMsg}</span>}
          <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
            {sending ? 'Отправка...' : 'Отправить ответ'}
          </button>
        </div>
      ) : (
        <div className="response-sent">Ответ отправлен клиенту</div>
      )}
    </div>
  );
}
