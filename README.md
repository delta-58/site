# 58-ма Бригада - Сайт для подачі заявок

## Налаштування проекту

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Налаштування змінних оточення

Скопіюйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Потім відредагуйте `.env` файл і додайте свої ключі EmailJS:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
```

### 3. Запуск проекту

#### Режим розробки (development)

```bash
npm run dev
```

Відкрийте http://localhost:3000 у браузері

#### Збірка для продакшену (production)

```bash
npm run build
```

Збудовані файли будуть у папці `dist/`

#### Попередній перегляд збірки

```bash
npm run preview
```

## Структура проекту

```
.
├── index.html          # Головна HTML сторінка
├── script.js           # JavaScript функціонал
├── styles.css          # CSS стилі
├── photos/             # Зображення та медіа
├── .env               # Змінні оточення (не в git)
├── .env.example       # Приклад змінних оточення
├── vite.config.js     # Конфігурація Vite
└── package.json       # NPM залежності
```

## Технології

- **Vite** - build tool та dev server
- **Tailwind CSS** - CSS framework (CDN)
- **EmailJS** - сервіс для відправки email

## Безпека

⚠️ **ВАЖЛИВО**: Ніколи не комітьте `.env` файл в git! Він вже доданий до `.gitignore`.
