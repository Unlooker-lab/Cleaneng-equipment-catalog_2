<?php
/**
 * AVDIRVD Конфигуратор — Shortcode для WordPress
 * 
 * Добавьте этот код в functions.php дочерней темы.
 * Затем используйте [avd_configurator] в Elementor через виджет Shortcode.
 * 
 * Предварительно загрузите файлы:
 * - /assets/css/configurator.css
 * - /assets/js/configurator.js
 * в папку дочерней темы.
 */

// === Shortcode ===
add_shortcode('avd_configurator', function() {
    // Подключение стилей и скриптов
    wp_enqueue_style(
        'avd-configurator',
        get_stylesheet_directory_uri() . '/assets/css/configurator.css',
        [],
        '1.0.0'
    );
    wp_enqueue_script(
        'avd-configurator',
        get_stylesheet_directory_uri() . '/assets/js/configurator.js',
        [],
        '1.0.0',
        true // в footer
    );
    wp_localize_script('avd-configurator', 'avdConfigAjax', [
        'url'   => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('avd_configurator_nonce'),
    ]);

    ob_start();
    ?>
    <div id="avd-cfg">
      <div class="cfg-header">
        <div class="cfg-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
          Конфигуратор
        </div>
        <h2 class="cfg-title">Подберите комплект оборудования</h2>
        <p class="cfg-subtitle">Ответьте на несколько вопросов и получите расчёт стоимости</p>
      </div>

      <div class="cfg-card">
        <div class="cfg-steps" id="cfg-steps"></div>
        <div class="cfg-step-title" id="cfg-step-title"></div>
        <div class="cfg-step-desc" id="cfg-step-desc"></div>
        <div id="cfg-content" style="min-height:200px"></div>
        <div class="cfg-estimate" id="cfg-live-estimate" style="display:none">
          <span class="cfg-estimate-label">Ориентировочная стоимость:</span>
          <span class="cfg-estimate-value" id="cfg-live-value">0 Br</span>
        </div>
        <div class="cfg-nav">
          <button class="cfg-btn cfg-btn-prev" id="cfg-prev" onclick="avdCfgPrev()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Назад
          </button>
          <div class="cfg-dots" id="cfg-dots"></div>
          <button class="cfg-btn cfg-btn-next" id="cfg-next" onclick="avdCfgNext()">
            Далее <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div class="cfg-card cfg-success" id="cfg-success" style="display:none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:56px;height:56px;color:#10B981;margin-bottom:16px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h3>Заявка на расчёт отправлена</h3>
        <p class="cfg-total-result">Ориентировочная стоимость: <strong id="cfg-final-total"></strong></p>
        <p>Наш специалист свяжется с вами для уточнения деталей<br>и подготовки коммерческого предложения</p>
        <br>
        <button class="cfg-reset-btn" onclick="avdCfgReset()">Новый расчёт</button>
      </div>
    </div>
    <?php
    return ob_get_clean();
});


// === AJAX Handler ===
add_action('wp_ajax_avd_configurator_submit', 'avd_configurator_handle_submit');
add_action('wp_ajax_nopriv_avd_configurator_submit', 'avd_configurator_handle_submit');

function avd_configurator_handle_submit() {
    if (!wp_verify_nonce($_POST['nonce'], 'avd_configurator_nonce')) {
        wp_send_json_error(['message' => 'Ошибка безопасности']);
        return;
    }

    $name    = sanitize_text_field($_POST['name'] ?? '');
    $phone   = sanitize_text_field($_POST['phone'] ?? '');
    $email   = sanitize_email($_POST['email'] ?? '');
    $config  = sanitize_textarea_field($_POST['config_summary'] ?? '');
    $cost    = sanitize_textarea_field($_POST['cost_summary'] ?? '');
    $total   = sanitize_text_field($_POST['total'] ?? '');

    if (empty($name) || empty($phone)) {
        wp_send_json_error(['message' => 'Заполните обязательные поля']);
        return;
    }

    // Email
    $to = get_option('admin_email'); // Замените на 'info@avdirvd.by'
    $subject = 'Заявка на расчёт оборудования — AVDIRVD';
    $body  = "Новая заявка на расчёт\n==================================\n\n";
    $body .= "Имя: {$name}\nТелефон: {$phone}\nEmail: {$email}\n\n";
    $body .= "Конфигурация:\n{$config}\n\nРасчёт стоимости:\n{$cost}\n";
    $body .= "ИТОГО: {$total}\n\n---\nДата: " . current_time('d.m.Y H:i') . "\n";

    $headers = ['Content-Type: text/plain; charset=UTF-8'];
    if (!empty($email)) $headers[] = "Reply-To: {$name} <{$email}>";

    wp_mail($to, $subject, $body, $headers);

    // Save to DB
    wp_insert_post([
        'post_title'   => "Конфигуратор: {$name} — {$phone}",
        'post_content' => $body,
        'post_type'    => 'avd_configurator',
        'post_status'  => 'private',
        'meta_input'   => [
            '_avd_name' => $name, '_avd_phone' => $phone,
            '_avd_email' => $email, '_avd_total' => $total,
        ],
    ]);

    wp_send_json_success(['message' => 'Заявка принята']);
}


// === Custom Post Type для хранения заявок ===
add_action('init', function() {
    register_post_type('avd_configurator', [
        'labels' => [
            'name'          => 'Заявки конфигуратора',
            'singular_name' => 'Заявка конфигуратора',
            'menu_name'     => 'Конфигуратор',
            'all_items'     => 'Все заявки',
        ],
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-calculator',
        'supports'     => ['title', 'editor', 'custom-fields'],
    ]);
});
