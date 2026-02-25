import { useState } from 'react';
import SentimentBadge from './SentimentBadge';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';
import './TicketsTable.css';

const COLUMNS = [
  { key: 'date_received', label: 'Дата' },
  { key: 'full_name', label: 'ФИО' },
  { key: 'company', label: 'Объект' },
  { key: 'phone', label: 'Телефон' },
  { key: 'email', label: 'Email' },
  { key: 'device_serials', label: 'Зав. номера' },
  { key: 'device_type', label: 'Тип прибора' },
  { key: 'sentiment', label: 'Тональность' },
  { key: 'category', label: 'Категория' },
  { key: 'summary', label: 'Суть вопроса' },
  { key: 'status', label: 'Статус' },
];

export default function TicketsTable({ tickets, onSelect }) {
  const [sortKey, setSortKey] = useState('date_received');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = tickets.filter((t) =>
    [t.full_name, t.company, t.email, t.summary, t.device_type]
      .join(' ')
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (Array.isArray(va)) va = va.join();
    if (Array.isArray(vb)) vb = vb.join();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="tickets-table-wrapper">
      <div className="tickets-table-toolbar">
        <input
          className="tickets-search"
          placeholder="Поиск по ФИО, объекту, email, сути..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <span className="tickets-count">{sorted.length} заявок</span>
      </div>

      <div className="tickets-table-scroll">
        <table className="tickets-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={sortKey === col.key ? 'sorted' : ''}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((ticket) => (
              <tr key={ticket.id} onClick={() => onSelect(ticket)} className="ticket-row">
                <td>{new Date(ticket.date_received).toLocaleString('ru-RU')}</td>
                <td>{ticket.full_name}</td>
                <td>{ticket.company}</td>
                <td>{ticket.phone}</td>
                <td>{ticket.email}</td>
                <td>{ticket.device_serials.join(', ')}</td>
                <td>{ticket.device_type}</td>
                <td><SentimentBadge value={ticket.sentiment} /></td>
                <td><CategoryBadge value={ticket.category} /></td>
                <td className="summary-cell">{ticket.summary}</td>
                <td><StatusBadge value={ticket.status} /></td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="no-data">Заявок не найдено</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
