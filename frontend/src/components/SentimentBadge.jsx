import './SentimentBadge.css';

const LABELS = {
  positive: 'Позитив',
  neutral: 'Нейтраль',
  negative: 'Негатив',
};

export default function SentimentBadge({ value }) {
  return (
    <span className={`sentiment-badge sentiment-badge--${value}`}>
      {LABELS[value] ?? value}
    </span>
  );
}
