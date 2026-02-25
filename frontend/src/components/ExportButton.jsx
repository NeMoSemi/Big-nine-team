import * as XLSX from 'xlsx';
import './ExportButton.css';

const HEADERS = [
  'ID', 'Дата', 'ФИО', 'Объект', 'Телефон', 'Email',
  'Зав. номера', 'Тип прибора', 'Тональность', 'Категория', 'Суть вопроса', 'Статус',
];

function toRows(tickets) {
  return tickets.map((t) => [
    t.id,
    new Date(t.date_received).toLocaleString('ru-RU'),
    t.full_name,
    t.company,
    t.phone,
    t.email,
    t.device_serials.join('; '),
    t.device_type,
    t.sentiment,
    t.category,
    t.summary,
    t.status,
  ]);
}

function exportCSV(tickets) {
  const rows = [HEADERS, ...toRows(tickets)];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  download(blob, `tickets_${today()}.csv`);
}

function exportXLSX(tickets) {
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...toRows(tickets)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Заявки');
  XLSX.writeFile(wb, `tickets_${today()}.xlsx`);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButton({ tickets }) {
  return (
    <div className="export-group">
      <button className="export-btn export-btn--csv" onClick={() => exportCSV(tickets)}>
        CSV
      </button>
      <button className="export-btn export-btn--xlsx" onClick={() => exportXLSX(tickets)}>
        XLSX
      </button>
    </div>
  );
}
