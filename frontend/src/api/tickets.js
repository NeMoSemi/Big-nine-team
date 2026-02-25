const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MOCK_TICKETS = [
  {
    id: 1,
    date_received: '2026-02-20T09:14:00',
    full_name: 'Иванов Сергей Петрович',
    company: 'ООО "Газпром нефть"',
    phone: '+7 (495) 123-45-67',
    email: 'ivanov@gazprom.ru',
    device_serials: ['ГА-2024-001', 'ГА-2024-002'],
    device_type: 'Газоанализатор СИГМА-01',
    sentiment: 'negative',
    category: 'malfunction',
    summary: 'Прибор выдаёт ошибку E04 при включении, не проходит самодиагностику.',
    original_email: 'Здравствуйте! Обращаюсь по поводу неисправности газоанализатора СИГМА-01 зав. №ГА-2024-001. При включении прибор выдаёт ошибку E04 и не проходит самодиагностику. Просим оказать техническую помощь.',
    ai_response: 'Здравствуйте, Сергей Петрович!\n\nОшибка E04 свидетельствует о неисправности датчика. Рекомендуем:\n1. Выполнить сброс настроек (удержание кнопки RESET 5 сек).\n2. Проверить состояние сенсора согласно разделу 4.3 руководства.\n3. При повторении — отправить прибор на сервисное обслуживание.\n\nС уважением, Служба технической поддержки ЭРИС',
    status: 'open',
    chat_history: [
      { role: 'bot', text: 'Здравствуйте! Я AI-ассистент службы поддержки ЭРИС. Чем могу помочь по заявке?' },
      { role: 'user', text: 'Можете уточнить, нужно ли отправлять прибор на завод или можно починить на месте?' },
      { role: 'bot', text: 'Если сброс настроек не помог — рекомендую отправить прибор в ближайший авторизованный сервисный центр. Список центров есть на сайте eris.ru/service.' },
    ],
  },
  {
    id: 2,
    date_received: '2026-02-21T11:30:00',
    full_name: 'Петрова Анна Викторовна',
    company: 'АО "Химзавод"',
    phone: '+7 (812) 987-65-43',
    email: 'petrova@himzavod.ru',
    device_serials: ['ГА-2023-115'],
    device_type: 'Газоанализатор АЛЬФА-03',
    sentiment: 'neutral',
    category: 'calibration',
    summary: 'Запрос на плановую калибровку прибора, истёк срок поверки.',
    original_email: 'Добрый день. Сообщаем, что у газоанализатора АЛЬФА-03 зав. №ГА-2023-115 истёк срок поверки. Просим сообщить порядок проведения калибровки.',
    ai_response: 'Здравствуйте, Анна Викторовна!\n\nДля проведения калибровки необходимо:\n1. Заполнить заявку на сервисное обслуживание.\n2. Доставить прибор в сервисный центр или вызвать специалиста.\n\nСрок выполнения: 3-5 рабочих дней.\n\nС уважением, Служба технической поддержки ЭРИС',
    status: 'in_progress',
    chat_history: [
      { role: 'bot', text: 'Здравствуйте! Заявка на калибровку принята. Уточните удобный способ доставки прибора.' },
      { role: 'user', text: 'Предпочитаем вызов выездного специалиста.' },
    ],
  },
  {
    id: 3,
    date_received: '2026-02-22T14:05:00',
    full_name: 'Сидоров Михаил Андреевич',
    company: 'МУП "Водоканал"',
    phone: '+7 (343) 456-78-90',
    email: 'sidorov@vodokanal.ru',
    device_serials: ['ГА-2025-007', 'ГА-2025-008', 'ГА-2025-009'],
    device_type: 'Газоанализатор БЕТА-05',
    sentiment: 'positive',
    category: 'documentation',
    summary: 'Запрос технической документации и руководства по эксплуатации.',
    original_email: 'Добрый день! Нам необходимо получить руководство по эксплуатации на газоанализаторы БЕТА-05 (3 шт., зав. №№ГА-2025-007, 008, 009). Заранее благодарим.',
    ai_response: 'Здравствуйте, Михаил Андреевич!\n\nНаправляем ссылку для скачивания руководства по эксплуатации БЕТА-05 (актуальная версия 2.1).',
    status: 'closed',
    chat_history: [
      { role: 'bot', text: 'Здравствуйте! Документация отправлена на email sidorov@vodokanal.ru. Заявка закрыта.' },
      { role: 'user', text: 'Спасибо, документы получили!' },
      { role: 'bot', text: 'Рады помочь! Если появятся вопросы — обращайтесь.' },
    ],
  },
];

export async function fetchTickets() {
  try {
    const res = await fetch(`${API_BASE}/api/tickets`);
    if (!res.ok) throw new Error('Server error');
    return await res.json();
  } catch {
    return MOCK_TICKETS;
  }
}

export async function fetchTicket(id) {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/${id}`);
    if (!res.ok) throw new Error('Server error');
    return await res.json();
  } catch {
    return MOCK_TICKETS.find((t) => t.id === Number(id)) || null;
  }
}

export async function sendResponse(id) {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/${id}/send`, { method: 'POST' });
    if (!res.ok) throw new Error('Server error');
    return await res.json();
  } catch {
    return { success: true };
  }
}
