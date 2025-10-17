<?php
include_once '../config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    // Получение параметров
    $phone = sanitize($_GET['phone'] ?? '');
    $mac_count = sanitize($_GET['mac_count'] ?? '');
    $empty_password = sanitize($_GET['empty_password'] ?? '0');
    $sort = sanitize($_GET['sort'] ?? 'username');
    $direction = sanitize($_GET['direction'] ?? 'asc');
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 10);
    $offset = ($page - 1) * $limit;

    // Валидация сортировки
    $allowed_sort = ['username', 'value', 'created_at', 'first_session', 'last_session', 'mac_count'];
    $sort = in_array($sort, $allowed_sort) ? $sort : 'username';
    $direction = $direction === 'desc' ? 'DESC' : 'ASC';

    // Построение базового запроса
    $sql = "SELECT 
                r.id,
                r.username,
                r.value,
                r.created_at,
                MIN(a.acctstarttime) as first_session,
                MAX(a.acctstarttime) as last_session,
                COUNT(DISTINCT a.callingstationid) as mac_count
            FROM radcheck r
            LEFT JOIN radacct a ON r.username = a.username
            WHERE 1=1";

    $count_sql = "SELECT COUNT(DISTINCT r.id) as total 
                  FROM radcheck r
                  LEFT JOIN radacct a ON r.username = a.username
                  WHERE 1=1";

    $params = [];
    $types = '';
    $where_conditions = [];

    // Условия фильтрации
    if ($phone) {
        $where_conditions[] = "r.username LIKE ?";
        $params[] = "%$phone%";
        $types .= 's';
    }

    if ($empty_password === '1') {
        $where_conditions[] = "(r.value IS NULL OR r.value = '')";
    }

    // Добавляем условия в запросы
    if (!empty($where_conditions)) {
        $where_sql = " AND " . implode(" AND ", $where_conditions);
        $sql .= $where_sql;
        $count_sql .= $where_sql;
    }

    $sql .= " GROUP BY r.id, r.username, r.value, r.created_at";

    // Условие HAVING для количества MAC-адресов
    if ($mac_count) {
        $sql .= " HAVING mac_count >= ?";
        $params[] = $mac_count;
        $types .= 'i';
    }

    // Получаем общее количество до применения HAVING
    $count_result = $db->prepare($count_sql);
    if ($params) {
        $count_result->bind_param($types, ...$params);
    }
    $count_result->execute();
    $total_result = $count_result->get_result();
    $total = $total_result->fetch_assoc()['total'];

    // Продолжаем построение основного запроса
    $sql .= " ORDER BY $sort $direction";
    $sql .= " LIMIT ? OFFSET ?";
    
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';

    // Подготовка и выполнение запроса
    $stmt = $db->prepare($sql);
    if ($params) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $users = $result->fetch_all(MYSQLI_ASSOC);

    // Форматируем даты
    foreach ($users as &$user) {
        $user['formatted_created_at'] = formatDate($user['created_at']);
        $user['formatted_first_session'] = formatDate($user['first_session']);
        $user['formatted_last_session'] = formatDate($user['last_session']);
    }

    echo json_encode([
        'success' => true,
        'users' => $users,
        'total' => $total,
        'filtered' => count($users)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>