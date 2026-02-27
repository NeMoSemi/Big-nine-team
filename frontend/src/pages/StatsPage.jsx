import './StatsPage.css';

const STATUS_LABEL = { open: 'Открыто', in_progress: 'В работе', closed: 'Закрыто' };
const STATUS_COLOR = { open: '#3b82f6', in_progress: '#f59e0b', closed: '#22c55e' };
const CATEGORY_LABEL = { malfunction: 'Неисправность', calibration: 'Калибровка', documentation: 'Документация', other: 'Прочее' };
const CATEGORY_COLOR = { malfunction: '#ef4444', calibration: '#f59e0b', documentation: '#3b82f6', other: '#8b5cf6' };
const SENTIMENT_LABEL = { positive: 'Позитивный', neutral: 'Нейтральный', negative: 'Негативный' };
const SENTIMENT_COLOR = { positive: '#22c55e', neutral: '#94a3b8', negative: '#ef4444' };

function count(tickets, key) {
  return tickets.reduce((acc, t) => {
    const val = t[key] || 'other';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

function BarChart({ data, labels, colors, total }) {
  return (
    <div className="stats-bars">
      {Object.entries(data).map(([key, val]) => (
        <div key={key} className="stats-bar-row">
          <span className="stats-bar-label">{labels[key] || key}</span>
          <div className="stats-bar-track">
            <div
              className="stats-bar-fill"
              style={{ width: `${(val / total) * 100}%`, background: colors[key] || '#94a3b8' }}
            />
          </div>
          <span className="stats-bar-count">{val}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, colors, total }) {
  const segments = [];
  let offset = 0;
  const r = 40;
  const circ = 2 * Math.PI * r;

  Object.entries(data).forEach(([key, val]) => {
    const pct = val / total;
    segments.push({ key, val, pct, offset });
    offset += pct;
  });

  return (
    <svg viewBox="0 0 100 100" className="stats-donut">
      {segments.map(({ key, pct, offset }) => (
        <circle
          key={key}
          cx="50" cy="50" r={r}
          fill="none"
          stroke={colors[key] || '#94a3b8'}
          strokeWidth="18"
          strokeDasharray={`${pct * circ} ${circ}`}
          strokeDashoffset={-offset * circ}
          transform="rotate(-90 50 50)"
        />
      ))}
      <text x="50" y="54" textAnchor="middle" className="stats-donut-total">{total}</text>
    </svg>
  );
}

export default function StatsPage({ tickets }) {
  const total = tickets.length;

  if (total === 0) {
    return (
      <div className="stats-page">
        <div className="stats-header">
          <h2 className="stats-title">Статистика</h2>
        </div>
        <div className="stats-empty">Нет данных для отображения</div>
      </div>
    );
  }

  const byStatus = count(tickets, 'status');
  const byCategory = count(tickets, 'category');
  const bySentiment = count(tickets, 'sentiment');

  const closedCount = byStatus['closed'] || 0;
  const resolutionRate = total > 0 ? Math.round((closedCount / total) * 100) : 0;

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h2 className="stats-title">Статистика</h2>
        <p className="stats-subtitle">Сводная аналитика по обращениям</p>
      </div>

      <div className="stats-kpis">
        <div className="stats-kpi">
          <span className="stats-kpi-value">{total}</span>
          <span className="stats-kpi-label">Всего обращений</span>
        </div>
        <div className="stats-kpi">
          <span className="stats-kpi-value" style={{ color: '#3b82f6' }}>{byStatus['open'] || 0}</span>
          <span className="stats-kpi-label">Открытых</span>
        </div>
        <div className="stats-kpi">
          <span className="stats-kpi-value" style={{ color: '#f59e0b' }}>{byStatus['in_progress'] || 0}</span>
          <span className="stats-kpi-label">В работе</span>
        </div>
        <div className="stats-kpi">
          <span className="stats-kpi-value" style={{ color: '#22c55e' }}>{closedCount}</span>
          <span className="stats-kpi-label">Закрытых</span>
        </div>
        <div className="stats-kpi">
          <span className="stats-kpi-value">{resolutionRate}%</span>
          <span className="stats-kpi-label">Решено</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card-title">По статусу</div>
          <div className="stats-card-body stats-card-body--donut">
            <DonutChart data={byStatus} colors={STATUS_COLOR} total={total} />
            <div className="stats-legend">
              {Object.entries(byStatus).map(([key, val]) => (
                <div key={key} className="stats-legend-row">
                  <span className="stats-legend-dot" style={{ background: STATUS_COLOR[key] || '#94a3b8' }} />
                  <span className="stats-legend-label">{STATUS_LABEL[key] || key}</span>
                  <span className="stats-legend-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-title">По категории</div>
          <div className="stats-card-body">
            <BarChart data={byCategory} labels={CATEGORY_LABEL} colors={CATEGORY_COLOR} total={total} />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-title">По тональности</div>
          <div className="stats-card-body stats-card-body--donut">
            <DonutChart data={bySentiment} colors={SENTIMENT_COLOR} total={total} />
            <div className="stats-legend">
              {Object.entries(bySentiment).map(([key, val]) => (
                <div key={key} className="stats-legend-row">
                  <span className="stats-legend-dot" style={{ background: SENTIMENT_COLOR[key] || '#94a3b8' }} />
                  <span className="stats-legend-label">{SENTIMENT_LABEL[key] || key}</span>
                  <span className="stats-legend-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
