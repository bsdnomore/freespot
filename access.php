
<?php
header('Content-Type: application/json');

/**
 * Скрипт access.php - веб версия
 * Логика: только обновляет пароль существующим пользователям
 * Если пользователя нет - только пишет в лог
 */
$config = include 'config.php';

// --- Получаем номер телефона из POST ---
$phone = isset($_POST['phone']) ? $_POST['phone'] : null;
$phone = preg_replace('/[^0-9]/', '', $phone);

// Проверка обязательного параметра
if (!$phone) {
    echo json_encode(['status' => 'error', 'message' => 'Phone number required']);
    exit;
}

// --- Подключение к базе ---
$db = new mysqli(
    $config['db_host'], 
    $config['db_user'], 
    $config['db_pass'], 
    $config['db_name']
);

if ($db->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

// --- Проверка существующего пользователя ---
$stmt = $db->prepare("SELECT id FROM radcheck WHERE username = ? LIMIT 1");
$stmt->bind_param('s', $phone);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // --- Генерация случайного пароля ---
    $password = substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'), 0, 4);
    
    // --- Обновляем пароль ---
    $stmt = $db->prepare("UPDATE radcheck SET value = ? WHERE username = ? AND attribute='Cleartext-Password'");
    $stmt->bind_param('ss', $password, $phone);
    
    if ($stmt->execute()) {
        // Пишем в лог
        file_put_contents('/var/log/hotspot_auth.log', date('Y-m-d H:i:s') . " - {$phone} : {$password}\n", FILE_APPEND);
        echo json_encode(['status' => 'ok', 'password' => $password]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Password update failed']);
    }
    
} else {
    // --- Пользователь не найден - только пишем в лог ---
    file_put_contents('/var/log/hotspot_auth.log', date('Y-m-d H:i:s') . " - {$phone} : unknown\n", FILE_APPEND);
    echo json_encode(['status' => 'ok', 'message' => 'User not found, logged only']);
}

$db->close();
?>