<?php
include '../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$user_id = sanitize($data['id'] ?? '');

if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'User ID is required']);
    exit;
}

try {
    $db = getDBConnection();
    
    // Получаем username для удаления связанных записей
    $stmt = $db->prepare("SELECT username FROM radcheck WHERE id = ?");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }
    
    $username = $user['username'];
    
    // Удаляем пользователя из radcheck
    $stmt = $db->prepare("DELETE FROM radcheck WHERE id = ?");
    $stmt->bind_param('i', $user_id);
    
    if ($stmt->execute()) {
        
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to delete user']);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>