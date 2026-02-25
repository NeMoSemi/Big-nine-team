import { useState } from 'react';
import SentimentBadge from './SentimentBadge';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';
import ResponseEditor from './ResponseEditor';
import './TicketDetail.css';

export default function TicketDetail({ ticket, onClose }) {
  const [tab, setTab] = useState('info');

  if (!ticket) return null;

  return (
    <div className="ticket-detail-overlay" onClick={onClose}>
      <div className="ticket-detail" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-detail-header">
          <div className="ticket-detail-title">
            <span>Заявка #{ticket.id}</span>
            <div className="ticket-detail-badges">
              <SentimentBadge value={ticket.sentiment} />
              <CategoryBadge value={ticket.category} />
              <StatusBadge value={ticket.status} />
            </div>
          </div>
          <button className="ticket-detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="ticket-detail-tabs">
          <button
            className={`tab ${tab === 'info' ? 'active' : ''}`}
            onClick={() => setTab('info')}
          >
            Информация
          </button>
          <button
            className={`tab ${tab === 'email' ? 'active' : ''}`}
            onClick={() => setTab('email')}
          >
            Письмо
          </button>
          <button
            className={`tab ${tab === 'response' ? 'active' : ''}`}
            onClick={() => setTab('response')}
          >
            Ответ AI
          </button>
        </div>

        <div className="ticket-detail-body">
          {tab === 'info' && (
            <div className="ticket-info-grid">
              <InfoRow label="Дата поступления" value={new Date(ticket.date_received).toLocaleString('ru-RU')} />
              <InfoRow label="ФИО" value={ticket.full_name} />
              <InfoRow label="Объект / предприятие" value={ticket.company} />
              <InfoRow label="Телефон" value={ticket.phone} />
              <InfoRow label="Email" value={ticket.email} />
              <InfoRow label="Зав. номера приборов" value={ticket.device_serials.join(', ')} />
              <InfoRow label="Тип приборов" value={ticket.device_type} />
              <InfoRow label="Суть вопроса" value={ticket.summary} />
            </div>
          )}

          {tab === 'email' && (
            <div className="ticket-email">
              <p className="ticket-email-text">{ticket.original_email}</p>
            </div>
          )}

          {tab === 'response' && (
            <ResponseEditor ticket={ticket} />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
