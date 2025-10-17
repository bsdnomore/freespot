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
    $terminate_cause = sanitize($_GET['terminate_cause'] ?? '');
    $active_sessions = sanitize($_GET['active_sessions'] ?? '0');
    $sort = sanitize($_GET['sort'] ?? 'acctstarttime');
    $direction = sanitize($_GET['direction'] ?? 'desc');
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 10);
    $offset = ($page - 1) * $limit;

    // Валидация сортировки
    $allowed_sort = ['username', 'acctstarttime', 'acctstoptime', 'callingstationid', 'acctsessiontime', 'acctterminatecause', 'traffic'];
    $sort = in_array($sort, $allowed_sort) ? $sort : 'acctstarttime';
    $direction = $direction === 'desc' ? 'DESC' : 'ASC';

    // Определение периода
    $date_condition = '';
    switch ($period) {
        case 'today':
            $date_condition = "DATE(a.acctstarttime) = CURDATE()";
            break;
        case 'week':
            $date_condition = "a.acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)";
            break;
        case 'month':
            $date_condition = "a.acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            break;
        case 'year':
            $date_condition = "a.acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
            break;
        case 'all':
            $date_condition = "1=1";
            break;
        case 'custom':
            if ($start_date && $end_date) {
                $date_condition = "a.acctstarttime BETWEEN '$start_date 00:00:00' AND '$end_date 23:59:59'";
            } else {
                $date_condition = "a.acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            }
            break;
        default:
            $date_condition = "a.acctstarttime >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
    }

    // Построение запроса
    $sql = "SELECT 
                a.username,
                a.acctstarttime,
                a.acctstoptime,
                a.callingstationid,
                a.acctsessiontime,
                a.acctterminatecause,
                (a.acctinputoctets + a.acctoutputoctets) as traffic
            FROM radacct a
            WHERE $date_condition";

    $count_sql = "SELECT COUNT(*) as total 
                  FROM radacct a
                  WHERE $date_condition";

    $params = [];
    $types = '';

    // Фильтр активных сессий
    if ($active_sessions === '1') {
        $sql .= " AND a.acctstoptime IS NULL";
        $count_sql .= " AND a.acctstoptime IS NULL";
    }

    // Дополнительные фильтры
    if ($phone) {
        $sql .= " AND a.username LIKE ?";
        $count_sql .= " AND a.username LIKE ?";
        $params[] = "%$phone%";
        $types .= 's';
    }

    if ($terminate_cause) {
        $sql .= " AND a.acctterminatecause = ?";
        $count_sql .= " AND a.acctterminatecause = ?";
        $params[] = $terminate_cause;
        $types .= 's';
    }

    $sql .= " ORDER BY $sort $direction";
    $sql .= " LIMIT ? OFFSET ?";
    
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';

    // Получение общего количества
    $count_stmt = $db->prepare($count_sql);
    if ($params) {
        // Убираем параметры пагинации для count запроса
        $count_params = array_slice($params, 0, count($params) - 2);
        $count_types = substr($types, 0, -2);
        if (!empty($count_params)) {
            $count_stmt->bind_param($count_types, ...$count_params);
        }
    }
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $total = $count_result->fetch_assoc()['total'];

    // Основной запрос
    $stmt = $db->prepare($sql);
    if ($params) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $reports = $result->fetch_all(MYSQLI_ASSOC);

    // Форматируем даты
    foreach ($reports as &$report) {
        $report['formatted_starttime'] = formatDate($report['acctstarttime']);
        $report['formatted_stoptime'] = formatDate($report['acctstoptime']);
    }

    echo json_encode([
        'success' => true,
        'reports' => $reports,
        'total' => $total,
        'filtered' => count($reports)
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>