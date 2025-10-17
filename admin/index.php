<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php include 'config.php'; echo $config['site_name']; ?></title>
    <link rel="stylesheet" href="style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="admin-container">
        <!-- Шапка -->
        <header class="admin-header">
            <div class="header-content">
                <h1 id="site-name"><?php include 'config.php'; echo $config['site_name']; ?></h1>
                <div class="user-info">
                    <span>Администратор</span>
                    <i class="fas fa-user-circle"></i>
                </div>
            </div>
        </header>

        <!-- Основной контент -->
        <div class="admin-main">
            <!-- Боковое меню -->
            <nav class="admin-sidebar">
                <ul class="sidebar-menu">
                    <li class="menu-item active">
                        <a href="#users" class="menu-link" data-page="users">
                            <i class="fas fa-users"></i>
                            <span>Управление пользователями</span>
                        </a>
                    </li>
                    <li class="menu-item">
                        <a href="#reports" class="menu-link" data-page="reports">
                            <i class="fas fa-chart-bar"></i>
                            <span>Отчеты по сессиям</span>
                        </a>
                    </li>
                    <li class="menu-item">
                        <a href="#user-stats" class="menu-link" data-page="user-stats">
                            <i class="fas fa-chart-pie"></i>
                            <span>Статистика пользователей</span>
                        </a>
                    </li>
                </ul>
            </nav>

            <!-- Область контента -->
            <main class="admin-content">
                <div id="content-area">
                    <!-- Контент будет загружаться динамически -->
                </div>
            </main>
        </div>
    </div>

    <!-- Подключаем модули -->
    <script src="js/main.js"></script>
    <script src="js/users.js"></script>
    <script src="js/session-reports.js"></script>
    <script src="js/user-reports.js"></script>
</body>
</html>