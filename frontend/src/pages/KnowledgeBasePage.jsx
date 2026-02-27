import { useState } from 'react';
import './KnowledgeBasePage.css';

const FAQ_ITEMS = [
  {
    q: 'Где найти разрешительную документацию?',
    a: 'Техническая и разрешительная документации доступны на странице библиотеки файлов компании.',
  },
  {
    q: 'Какой срок гарантии на оборудование?',
    a: 'Гарантийный срок составляет до 3-х лет и указан в руководствах по эксплуатации соответствующих приборов.',
  },
  {
    q: 'Как отправить оборудование в ремонт?',
    a: 'Необходимо направить сопроводительное письмо с описанием неисправности, указать наименование организации и контакты специалистов. Груз отправляется на имя организации ООО «ЭРИС» (адрес: Пермский край, г. Чайковский, ул. Промышленная, д. 8/25). Контактное лицо: Брюханова Наталья Олеговна.',
  },
  {
    q: 'Как получить прайс-лист?',
    a: 'Обратитесь в отдел продаж, написав письмо на адрес info@eriskip.ru.',
  },
  {
    q: 'Способы настройки датчика ДГС ЭРИС-210?',
    a: 'Установка нуля и калибровка производятся тремя способами: магнитом, по интерфейсу RS485 и по интерфейсу HART.',
  },
  {
    q: 'Какой интервал между поверками?',
    a: 'Сведения об интервалах находятся в федеральном информационном фонде по обеспечению единства измерений.',
  },
  {
    q: 'Что входит в комплект поставки датчиков?',
    a: 'В стандартную комплектацию входят: кабельный ввод, заглушка, магнитный ключ, шестигранник, паспорт на прибор.',
  },
  {
    q: 'Максимальный диаметр кабеля для ввода?',
    a: 'Для кабельного ввода А3RCCBF/20S-2/M20 максимальный диаметр наружной оболочки составляет 11,7 мм.',
  },
  {
    q: 'Где скачать DD файлы?',
    a: 'DD файлы доступны в разделе библиотеки файлов компании.',
  },
];

const SECTIONS = [
  {
    id: 'manuals',
    title: 'Руководства по эксплуатации',
    description: 'Технические руководства и инструкции по приборам ЭРИС',
    available: false,
  },
  {
    id: 'faq',
    title: 'Часто задаваемые вопросы',
    description: 'Типовые вопросы и готовые ответы для операторов',
    available: true,
  },
  {
    id: 'solutions',
    title: 'База решений',
    description: 'История обращений и найденных решений для повторяющихся проблем',
    available: false,
  },
];

function FaqPanel({ onClose }) {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="kb-overlay" onClick={onClose}>
      <div className="kb-faq-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kb-faq-panel-header">
          <span className="kb-faq-panel-title">Часто задаваемые вопросы</span>
          <button className="kb-faq-close" onClick={onClose}>✕</button>
        </div>
        <div className="kb-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`kb-faq-item ${openIdx === i ? 'kb-faq-item--open' : ''}`}
            >
              <button
                className="kb-faq-question"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="kb-faq-q-text">{item.q}</span>
                <span className="kb-faq-chevron">{openIdx === i ? '▲' : '▼'}</span>
              </button>
              {openIdx === i && (
                <div className="kb-faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const [showFaq, setShowFaq] = useState(false);

  return (
    <div className="kb-page">
      <div className="kb-header">
        <h2 className="kb-title">База знаний</h2>
        <p className="kb-subtitle">Справочные материалы и инструкции для операторов службы поддержки</p>
      </div>

      <div className="kb-grid">
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            className={`kb-card ${section.available ? 'kb-card--active' : ''}`}
            onClick={() => section.available && section.id === 'faq' && setShowFaq(true)}
          >
            <div className="kb-card-body">
              <div className="kb-card-title">{section.title}</div>
              <div className="kb-card-desc">{section.description}</div>
            </div>
          </div>
        ))}
      </div>

      {showFaq && <FaqPanel onClose={() => setShowFaq(false)} />}
    </div>
  );
}
