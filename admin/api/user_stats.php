<?php
include '../config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    // Получение параметров
    $period = sanitize($_GET['period'] ?? 'month');
    $start_date = sanitize($_GET['start_date'] ?? '');
    $end_date = sanitize($_GET['end_date'] ?? '');
    $phone = sanitize($_GET['phone'] ?? '');
    $min_sessions = sanitize($_GET['min_sessions'] ?? '');
    $sort = sanitize($_GET['sort'] ?? 'total_duration');
    $direction = sanitize($_GET['direction'] ?? 'desc');
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 10);
    $offset = ($page - 1) * $limit;

    // Валидация сортировки
    $allowed_sort = ['username', 'sessions_count', 'first_session', 'last_session', 'total_duration', 'total_traffic', 'avg_duration', 'unique_macs'];
    $sort = in_array($sort, $allowed_sort) ? $sort : 'total_duration';
    $direction = $direction === 'desc' ? 'DESC' : 'ASC';

    // Определение периода
    $date_condition = '';
    switch ($period) {
        case 'today':
            $date_condition = "DATE(acctstarttime) = CURDATE()";
            break;
        case 'week':
            $date_condition = "acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)";
            break;
        case 'month':
            $date_condition = "acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            break;
        case 'year':
            $date_condition = "acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
            break;
        case 'all':
            $date_condition = "1=1";
            break;
        case 'custom':
            if ($start_date && $end_date) {
                $date_condition = "acctstarttime BETWEEN '$start_date 00:00:00' AND '$end_date 23:59:59'";
            } else {
                $date_condition = "acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            }
            break;
        default:
            $date_condition = "acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
    }

    // Построение запроса для агрегированных данных
    $sql = "SELECT 
                username,
                COUNT(*) as sessions_count,
                MIN(acctstarttime) as first_session,
                MAX(acctstarttime) as last_session,
                SUM(acctsessiontime) as total_duration,
                SUM(acctinputoctets + acctoutputoctets) as total_traffic,
                AVG(acctsessiontime) as avg_duration,
                COUNT(DISTINCT callingstationid) as unique_macs
            FROM radacct 
            WHERE $date_condition";

    $count_sql = "SELECT COUNT(DISTINCT username) as total 
                  FROM radacct 
                  WHERE $date_condition";

    $params = [];
    $types = '';

    // Дополнительные фильтры
    if ($phone) {
        $sql .= " AND username LIKE ?";
        $count_sql .= " AND username LIKE ?";
        $params[] = "%$phone%";
        $types .= 's';
    }

    $sql .= " GROUP BY username";

    // Фильтр по минимальному количеству сессий
    if ($min_sessions) {
        $sql .= " HAVING sessions_count >= ?";
        $params[] = $min_sessions;
        $types .= 'i';
    }

    // Получение общего количества
    $count_stmt = $db->prepare($count_sql);
    if ($params) {
        // Для count запроса не нужны параметры HAVING
        $count_params = array_slice($params, 0, ($phone ? 1 : 0));
        $count_types = substr($types, 0, ($phone ? 1 : 0));
        if (!empty($count_params)) {
            $count_stmt->bind_param($count_types, ...$count_params);
        }
    }
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $total = $count_result->fetch_assoc()['total'];

    // Продолжаем построение основного запроса
    $sql .= " ORDER BY $sort $direction";
    $sql .= " LIMIT ? OFFSET ?";
    
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';

    // Основной запрос
    $stmt = $db->prepare($sql);
    if ($params) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $users = $result->fetch_all(MYSQLI_ASSOC);

    // Форматируем даты
    foreach ($users as &$user) {
        $user['first_session_formatted'] = formatDate($user['first_session']);
        $user['last_session_formatted'] = formatDate($user['last_session']);
        $user['avg_duration'] = round($user['avg_duration']);
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