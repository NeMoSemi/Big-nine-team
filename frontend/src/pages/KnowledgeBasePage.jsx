import './KnowledgeBasePage.css';

const SECTIONS = [
  {
    id: 'manuals',
    title: 'Руководства по эксплуатации',
    description: 'Технические руководства и инструкции по приборам ЭРИС',
  },
  {
    id: 'faq',
    title: 'Часто задаваемые вопросы (FAQ)',
    description: 'Типовые вопросы и готовые ответы для операторов',
  },
  {
    id: 'solutions',
    title: 'База решений',
    description: 'История обращений и найденных решений для повторяющихся проблем',
  },
  {
    id: 'templates',
    title: 'Шаблоны ответов',
    description: 'Готовые шаблоны писем для типовых ситуаций',
  },
  {
    id: 'regulations',
    title: 'Нормативные документы',
    description: 'ГОСТы, регламенты и стандарты технического обслуживания',
  },
  {
    id: 'contacts',
    title: 'Контакты сервисных центров',
    description: 'Список авторизованных сервисных центров по регионам',
  },
];

export default function KnowledgeBasePage() {
  return (
    <div className="kb-page">
      <div className="kb-header">
        <h2 className="kb-title">База знаний</h2>
        <p className="kb-subtitle">Справочные материалы и инструкции для операторов службы поддержки</p>
      </div>

      <div className="kb-grid">
        {SECTIONS.map((section) => (
          <div key={section.id} className="kb-card">
            <div className="kb-card-body">
              <div className="kb-card-title">{section.title}</div>
              <div className="kb-card-desc">{section.description}</div>
            </div>
            <div className="kb-card-badge">Скоро</div>
          </div>
        ))}
      </div>
    </div>
  );
}
