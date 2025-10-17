<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$config = include 'config.php';

// Подключение к базе
$db = new mysqli(
    $config['db_host'], 
    $config['db_user'], 
    $config['db_pass'], 
    $config['db_name']
);

if ($db->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'DB connection failed']);
    exit;
}

// Получаем действие
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'check_mac':
        // Автоавторизация по MAC - отдает success с данными или waiting
        handleMacAuth($db);
        break;
        
    case 'check_phone':
        // Проверка пароля после звонка - отдает success с данными или waiting
        handlePhoneCheck($db);
        break;
        
    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
}

$db->close();

// --- ФУНКЦИЯ АВТОАВТОРИЗАЦИИ ПО MAC ---
function handleMacAuth($db) {
    if (!isset($_GET['mac'])) {
        echo json_encode(['status' => 'error', 'message' => 'MAC required']);
        return;
    }
    
    $mac = preg_replace('/[^a-fA-F0-9:]/', '', $_GET['mac']);
    
    $stmt = $db->prepare("
        SELECT rc.username, rc.value as password 
        FROM radcheck rc
        INNER JOIN radacct ra ON rc.username = ra.username 
        WHERE ra.callingstationid = ? 
        AND rc.attribute = 'Cleartext-Password'
        AND rc.value != ''
        ORDER BY ra.acctstarttime DESC 
        LIMIT 1
    ");
    $stmt->bind_param('s', $mac);
    $stmt->execute();
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'status' => 'success',
            'username' => $row['username'],
            'password' => $row['password']
        ]);
    } else {
        echo json_encode(['status' => 'waiting']);
    }
}

// --- ФУНКЦИЯ ПРОВЕРКИ ПО ТЕЛЕФОНУ ---
function handlePhoneCheck($db) {
    if (!isset($_GET['phone'])) {
        echo json_encode(['status' => 'error', 'message' => 'Phone required']);
        return;
    }
    
    $phone = preg_replace('/[^0-9]/', '', $_GET['phone']);
    
    $stmt = $db->prepare("
        SELECT username, value as password 
        FROM radcheck 
        WHERE username = ? 
        AND attribute = 'Cleartext-Password' 
        AND value != ''
        LIMIT 1
    ");
    $stmt->bind_param('s', $phone);
    $stmt->execute();
    
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'status' => 'success',
            'username' => $row['username'],
            'password' => $row['password']
        ]);
    } else {
        echo json_encode(['status' => 'waiting']);
    }
}
?>