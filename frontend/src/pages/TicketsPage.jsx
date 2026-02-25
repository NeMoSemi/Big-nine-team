import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTickets } from '../api/tickets';
import TicketsList from '../components/TicketsList';
import TicketForm from '../components/TicketForm';
import ChatWindow from '../components/ChatWindow';
import ExportButton from '../components/ExportButton';
import KnowledgeBasePage from './KnowledgeBasePage';
import './TicketsPage.css';

const NAV_TABS = ['Запросы', 'База знаний', 'Статистика'];
const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 520;

export default function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('Запросы');
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  useEffect(() => {
    if (!localStorage.getItem('auth')) navigate('/');
  }, [navigate]);

  useEffect(() => {
    fetchTickets().then((data) => {
      setTickets(data);
      setSelected(data[0] || null);
      setLoading(false);
    });
  }, []);

  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  useEffect(() => {
    function onMove(e) {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      const next = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startW.current + delta));
      setSidebarWidth(next);
    }
    function onUp() {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem('auth');
    navigate('/');
  }

  return (
    <div className="crm-layout">
      <header className="crm-header">
        <div className="crm-header-left">
          <span className="crm-logo">ЭРИС</span>
          <nav className="crm-nav">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                className={`crm-nav-tab ${activeTab === tab ? 'crm-nav-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="crm-header-right">
          {activeTab === 'Запросы' && <ExportButton tickets={tickets} />}
          <button className="crm-logout-btn" onClick={handleLogout}>Выйти</button>
        </div>
      </header>

      {activeTab === 'База знаний' && <KnowledgeBasePage />}

      {activeTab === 'Статистика' && (
        <div className="crm-placeholder">
          <span className="crm-placeholder-icon">📊</span>
          <span>Раздел «Статистика» будет доступен после интеграции с бэкендом</span>
        </div>
      )}

      {activeTab === 'Запросы' && (
        loading ? (
          <div className="crm-loading">
            <span className="crm-loading-dot" />
            Загрузка заявок...
          </div>
        ) : (
          <div className="crm-body">
            <div className="crm-sidebar" style={{ width: sidebarWidth }}>
              <TicketsList tickets={tickets} selectedId={selected?.id} onSelect={setSelected} />
            </div>
            <div className="crm-resize-handle" onMouseDown={onMouseDown} />
            <div className="crm-detail">
              <TicketForm ticket={selected} />
              <ChatWindow ticket={selected} />
            </div>
          </div>
        )
      )}
    </div>
  );
}
