import './TicketsList.css';

const STATUS_ICON = {
  open: { icon: '👤', label: 'Нужна помощь' },
  in_progress: { icon: '⏳', label: 'В процессе' },
  closed: { icon: '✅', label: 'Закрыто' },
};

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export default function TicketsList({ tickets, selectedId, onSelect }) {
  return (
    <aside className="tickets-list">
      <div className="tickets-list-header">
        <span className="tickets-list-title">Обращения</span>
        <span className="tickets-list-count">{tickets.length}</span>
      </div>
      <div className="tickets-list-body">
        {tickets.map((ticket) => {
          const status = STATUS_ICON[ticket.status] || STATUS_ICON.open;
          return (
            <div
              key={ticket.id}
              className={`ticket-card ${selectedId === ticket.id ? 'ticket-card--active' : ''}`}
              onClick={() => onSelect(ticket)}
            >
              <div className="ticket-card-main">
                <div className="ticket-card-meta">
                  <span className="ticket-card-date">{fmt(ticket.date_received)}</span>
                  <span className="ticket-card-status" title={status.label}>{status.icon}</span>
                </div>
                <div className="ticket-card-name">{ticket.full_name}</div>
                <div className="ticket-card-summary">{ticket.summary}</div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
