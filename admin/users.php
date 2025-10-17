<?php
include 'config.php';
?>
<div class="card">
    <div class="card-header">
        <h2 class="card-title">Управление пользователями</h2>
    </div>
    <div class="card-body">
        <!-- Фильтры -->
        <div class="filters">
            <div class="form-group">
                <label class="form-label" for="phoneFilter">Телефон:</label>
                <input type="text" class="form-input" id="phoneFilter" placeholder="Фильтр по телефону">
            </div>
            <div class="form-group">
                <label class="form-label" for="macCountFilter">MAC-адресов (мин):</label>
                <input type="number" class="form-input" id="macCountFilter" placeholder="Минимальное количество" min="0">
            </div>
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="emptyPasswordFilter">
                    <label class="form-label" for="emptyPasswordFilter">Только с пустым паролем</label>
                </div>
            </div>
        </div>

        <!-- Кнопка массового удаления -->
        <div style="margin-bottom: 1rem;">
            <button class="btn btn-danger" id="massDeleteBtn">
                <i class="fas fa-trash"></i> Удалить выбранных
            </button>
        </div>

        <!-- Таблица -->
        <div class="table-container" id="usersTable">
            <!-- Данные будут загружены через JavaScript -->
            <div class="loading-container">
                <div class="loading"></div> Загрузка данных...
            </div>
        </div>
    </div>
</div>