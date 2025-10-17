<?php
if (!defined('CONFIG_LOADED')) {
    define('CONFIG_LOADED', true);
    
    // Конфигурация приложения
    $config = [
        'db_host' => 'localhost',
        'db_user' => 'dbuser',
        'db_pass' => 'pass',
        'db_name' => 'radius',
        'site_name' => 'Тестовая Админ-панель Radius'
    ];

    // Подключение к базе данных
    function getDBConnection() {
        global $config;
        $conn = new mysqli($config['db_host'], $config['db_user'], $config['db_pass'], $config['db_name']);
        
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }
        
        $conn->set_charset("utf8");
        return $conn;
    }

    // Защита от SQL-инъекций
    function sanitize($input) {
        if (is_array($input)) {
            return array_map('sanitize', $input);
        }
        return htmlspecialchars(strip_tags(trim($input)));
    }

    // Форматирование даты
    function formatDate($dateString) {
        if (empty($dateString) || $dateString == '0000-00-00 00:00:00') {
            return 'Нет данных';
        }
        return date('d.m.Y H:i:s', strtotime($dateString));
    }
}
?>