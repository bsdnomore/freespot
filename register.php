<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
$config = include 'config.php';
$phone = $_POST['phone'];
$phone = preg_replace('/[^0-9]/', '', $phone);

$db = new mysqli(
    $config['db_host'], 
    $config['db_user'], 
    $config['db_pass'], 
    $config['db_name']
);

// Проверяем есть ли уже такой пользователь
$stmt = $db->prepare("SELECT id FROM radcheck WHERE username = ?");
$stmt->bind_param('s', $phone);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    // Добавляем нового с пустым паролем
    $stmt = $db->prepare("
        INSERT INTO radcheck (username, attribute, op, value)
        VALUES (?, 'Cleartext-Password', ':=', '')
    ");
    $stmt->bind_param('s', $phone);
    $stmt->execute();


}

echo json_encode(['status' => 'ok']);
