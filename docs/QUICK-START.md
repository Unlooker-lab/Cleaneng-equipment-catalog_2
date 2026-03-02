# Быстрая инструкция: Конфигуратор в WordPress/Elementor

## Все файлы в папке `/app/docs/`:

| Файл | Описание |
|------|----------|
| `configurator-embed.html` | **Полный код** (HTML+CSS+JS) для вставки в Elementor Custom HTML |
| `wordpress-functions-snippet.php` | PHP-код для `functions.php` (AJAX обработчик + email + сохранение в БД) |
| `configurator-wordpress-guide.md` | Подробная документация |

---

## Способ 1: Быстрый (Custom HTML) — 10 минут

### Шаг 1: PHP-обработчик
1. Откройте **Внешний вид > Редактор тем > functions.php** дочерней темы
2. Скопируйте содержимое `wordpress-functions-snippet.php` и вставьте в конец файла
3. Измените email получателя (строка `$to = get_option('admin_email');`)
4. Сохраните

### Шаг 2: Добавление в Elementor
1. Откройте нужную страницу в **Elementor**
2. Найдите место **после каталога товаров** (после WooCommerce Products Grid)
3. Добавьте новую **Секцию** (один столбец)
4. Настройки секции:
   - **Layout** > Content Width: `Full Width`
   - **Style** > Background Color: `#F8FAFC`
   - **Advanced** > Padding: `60px` сверху и снизу
5. Перетащите виджет **HTML** внутрь секции
6. Скопируйте всё содержимое файла `configurator-embed.html`
7. Вставьте в поле виджета HTML
8. Нажмите **Update / Опубликовать**

### Шаг 3: Проверка
1. Откройте страницу на сайте
2. Пройдите все 6 шагов конфигуратора
3. Отправьте тестовую заявку
4. Проверьте почту и раздел "Конфигуратор" в админ-панели WordPress

---

## Способ 2: Shortcode (чище, но дольше)

### Шаг 1: Подготовка файлов
Из файла `configurator-embed.html` извлеките:
- CSS (между тегами `<style>...</style>`) → сохраните как `assets/css/configurator.css`
- JS (между тегами `<script>...</script>`) → сохраните как `assets/js/configurator.js`
- Загрузите оба файла в папку дочерней темы

### Шаг 2: PHP-код
Скопируйте содержимое `wordpress-functions-snippet.php` в `functions.php`
(этот файл уже содержит и shortcode, и AJAX-обработчик)

### Шаг 3: Elementor
1. Добавьте виджет **Shortcode** на страницу
2. Введите: `[avd_configurator]`
3. Опубликуйте

---

## Кастомизация цен

В JavaScript найдите массивы данных и измените числа:

```javascript
// Базовые цены по типу мойки (за 1 пост)
var WASH_TYPES = [
  { id:'car', label:'Легковая', base:3500 },        // ← ваша цена
  { id:'self-service', label:'Мойка СО', base:8000 }, // ← ваша цена
  ...
];

// Множители количества постов
var POST_COUNTS = [
  { id:1, label:'1 пост', mult:1.0 },   // базовая цена × 1.0
  { id:2, label:'2 поста', mult:1.85 },  // базовая цена × 1.85
  ...
];

// Множители типа оборудования
var EQUIP_TYPES = [
  { id:'manual', label:'Ручное', factor:1.0 },    // базовая × 1.0
  { id:'portal', label:'Портал', factor:2.8 },     // базовая × 2.8
  ...
];

// Стоимость подачи химии (за 1 пост)
var CHEM_TYPES = [
  { id:'foam', label:'Пенокомплект', perPost:650 },
  ...
];

// Фиксированные цены доп. опций
var EXTRA_OPTIONS = [
  { id:'boiler', label:'Бойлер', price:4500 },
  ...
];

// Услуги (фиксированные или % от стоимости оборудования)
var SERVICES = [
  { id:'install', label:'Монтаж', pct:15 },  // 15% от оборудования
  { id:'warranty', label:'Гарантия', price:1200 },
  ...
];
```

## Формула расчёта:
```
Оборудование = base × mult × factor
Химия        = perPost × кол-во_постов
Доп. опции   = сумма выбранных price
Услуги       = сумма (price или % от Оборудования)
────────────────────────────────────────
ИТОГО        = Оборудование + Химия + Опции + Услуги
```

---

## Где увидеть заявки в WordPress

После добавления PHP-кода в `functions.php`:
- В левом меню админки появится раздел **"Конфигуратор"** (иконка калькулятора)
- Все заявки сохраняются как записи с типом `avd_configurator`
- Каждая заявка содержит: имя, телефон, email, конфигурацию, стоимость
- Также копия отправляется на email администратора

---

## Интеграция с Crocoblock JetFormBuilder (опционально)

Если хотите использовать JetFormBuilder вместо встроенной формы:
1. Создайте форму в JetFormBuilder с полями: Имя, Телефон, Email + Hidden fields (config, cost)
2. В JS на шаге 6 вместо HTML-формы вставьте shortcode формы
3. Перед показом формы заполните hidden-поля через JS:
   ```javascript
   document.querySelector('input[name="config"]').value = configSummary;
   document.querySelector('input[name="cost"]').value = totalStr;
   ```
