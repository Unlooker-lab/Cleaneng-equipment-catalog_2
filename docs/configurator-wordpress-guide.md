# Конфигуратор оборудования AVDIRVD — WordPress / Elementor + Crocoblock

## Содержание
1. [Обзор и архитектура](#обзор)
2. [Способ 1: Elementor Custom HTML (рекомендуется)](#способ-1)
3. [Способ 2: Shortcode + отдельные файлы](#способ-2)
4. [PHP-обработчик формы (functions.php)](#php-обработчик)
5. [Размещение в Elementor](#размещение)
6. [Настройка и кастомизация](#настройка)
7. [Альтернатива: Crocoblock JetFormBuilder](#crocoblock)

---

## Обзор

Конфигуратор — это 6-шаговый визард на чистом HTML/CSS/JavaScript (без React).
Он полностью автономен и не зависит от внешних библиотек.

**Что нужно сделать:**
1. Вставить HTML/CSS/JS код в Elementor через виджет **Custom HTML**
2. Добавить PHP-обработчик в `functions.php` вашей дочерней темы
3. Настроить email для получения заявок

---

## Способ 1: Elementor Custom HTML

### Шаг 1. Откройте страницу в Elementor
### Шаг 2. Добавьте виджет "HTML" (Custom HTML) в нужное место
### Шаг 3. Вставьте код из файла `configurator-embed.html` (см. ниже)
### Шаг 4. Добавьте PHP-обработчик в functions.php

---

## Способ 2: WordPress Shortcode

Если хотите более чистую интеграцию:

1. Загрузите CSS-файл в `/wp-content/themes/your-child-theme/assets/css/configurator.css`
2. Загрузите JS-файл в `/wp-content/themes/your-child-theme/assets/js/configurator.js`
3. Добавьте shortcode в functions.php (код ниже)
4. Используйте `[avd_configurator]` в Elementor через виджет Shortcode

---

## PHP-обработчик формы

Добавьте в `functions.php` дочерней темы:

```php
// ============================================
// AVDIRVD Конфигуратор — AJAX обработчик
// ============================================

add_action('wp_ajax_avd_configurator_submit', 'avd_configurator_handle_submit');
add_action('wp_ajax_nopriv_avd_configurator_submit', 'avd_configurator_handle_submit');

function avd_configurator_handle_submit() {
    // Проверка nonce
    if (!wp_verify_nonce($_POST['nonce'], 'avd_configurator_nonce')) {
        wp_send_json_error(['message' => 'Ошибка безопасности']);
        return;
    }

    // Получение данных
    $name    = sanitize_text_field($_POST['name'] ?? '');
    $phone   = sanitize_text_field($_POST['phone'] ?? '');
    $email   = sanitize_email($_POST['email'] ?? '');
    $config  = sanitize_text_field($_POST['config_summary'] ?? '');
    $cost    = sanitize_text_field($_POST['cost_summary'] ?? '');
    $total   = sanitize_text_field($_POST['total'] ?? '');

    if (empty($name) || empty($phone)) {
        wp_send_json_error(['message' => 'Заполните обязательные поля']);
        return;
    }

    // Формирование письма
    $to = get_option('admin_email'); // или укажите конкретный email: 'info@avdirvd.by'
    $subject = 'Новая заявка на расчёт оборудования — AVDIRVD';

    $body  = "Новая заявка на расчёт оборудования\n";
    $body .= "==================================\n\n";
    $body .= "Имя: {$name}\n";
    $body .= "Телефон: {$phone}\n";
    $body .= "Email: {$email}\n\n";
    $body .= "Конфигурация:\n{$config}\n\n";
    $body .= "Расчёт стоимости:\n{$cost}\n\n";
    $body .= "ИТОГО (ориентировочно): {$total}\n\n";
    $body .= "---\n";
    $body .= "Заявка отправлена: " . current_time('d.m.Y H:i') . "\n";
    $body .= "Источник: " . home_url() . "\n";

    $headers = ['Content-Type: text/plain; charset=UTF-8'];
    if (!empty($email)) {
        $headers[] = "Reply-To: {$name} <{$email}>";
    }

    $sent = wp_mail($to, $subject, $body, $headers);

    // Опционально: сохранение в БД WordPress
    $post_data = [
        'post_title'   => "Заявка: {$name} — {$phone}",
        'post_content' => $body,
        'post_type'    => 'avd_configurator',
        'post_status'  => 'private',
        'meta_input'   => [
            '_avd_name'   => $name,
            '_avd_phone'  => $phone,
            '_avd_email'  => $email,
            '_avd_total'  => $total,
            '_avd_config' => $config,
        ],
    ];
    wp_insert_post($post_data);

    if ($sent) {
        wp_send_json_success(['message' => 'Заявка отправлена']);
    } else {
        // Даже если email не отправился, заявка сохранена в БД
        wp_send_json_success(['message' => 'Заявка принята']);
    }
}

// Регистрация типа записи для хранения заявок
add_action('init', function() {
    register_post_type('avd_configurator', [
        'labels' => [
            'name'          => 'Заявки конфигуратора',
            'singular_name' => 'Заявка',
        ],
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-calculator',
        'supports'     => ['title', 'editor', 'custom-fields'],
    ]);
});

// Передача AJAX URL и nonce в скрипт
add_action('wp_footer', function() {
    echo '<script>
        var avdConfigAjax = {
            url: "' . admin_url('admin-ajax.php') . '",
            nonce: "' . wp_create_nonce('avd_configurator_nonce') . '"
        };
    </script>';
});
```

---

## Размещение в Elementor

### Рекомендуемое расположение:
**Между каталогом товаров (WooCommerce) и блоком "Новинки" или "Партнёры"**

### Пошаговая инструкция:
1. Откройте нужную страницу в **Elementor**
2. Найдите место после блока с товарами (после JetSmartFilters/WooCommerce Products Grid)
3. Добавьте новую **Секцию** → **Один столбец**
4. Настройте секцию:
   - **Layout** → Content Width: Full Width
   - **Style** → Background: `#F8FAFC` (светло-серый)
   - **Advanced** → Padding: 60px сверху, 60px снизу
5. Внутрь секции перетащите виджет **HTML** (Custom HTML)
6. Вставьте код из файла `configurator-embed.html`
7. Нажмите **Publish / Update**

---

## Настройка

### Изменение цвета
В начале CSS найдите блок `:root` и измените переменные:
```css
--avd-primary: #1D5EBC;       /* основной синий */
--avd-primary-hover: #164B96; /* при наведении */
--avd-primary-light: #EBF1FA; /* фон выделения */
```

### Изменение цен
В начале JavaScript найдите массивы `WASH_TYPES`, `POST_COUNTS`, `EQUIP_TYPES` и т.д.
Каждый элемент имеет поле `base`, `mult`, `factor`, `perPost` или `price` — измените числа.

### Изменение email получателя
В PHP-обработчике замените:
```php
$to = get_option('admin_email');
```
на:
```php
$to = 'ваш-email@avdirvd.by';
```

---

## Альтернатива: Crocoblock JetFormBuilder

Если хотите использовать JetFormBuilder для последнего шага (отправка формы):

1. Создайте форму в **JetFormBuilder** с полями:
   - Имя (Text, required)
   - Телефон (Text, required)
   - Email (Text)
   - Конфигурация (Hidden field)
   - Стоимость (Hidden field)
2. Настройте действие **Send Email** в форме
3. В конфигураторе на шаге 6 замените HTML-форму на shortcode JetFormBuilder:
   ```
   [jet_fb_form form_id="ID_ФОРМЫ"]
   ```
4. Перед показом формы заполняйте hidden-поля через JavaScript

Преимущество: интеграция с CRM, уведомления, условная логика JetEngine.

---

## Файлы
- `configurator-embed.html` — полный код для Elementor Custom HTML
- `configurator.css` — CSS отдельно (для способа 2)
- `configurator.js` — JavaScript отдельно (для способа 2)
- Код для `functions.php` — PHP обработчик (выше в этом документе)
