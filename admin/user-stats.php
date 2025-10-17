<?php
include 'config.php';
?>
<div class="card">
    <div class="card-header">
        <h2 class="card-title">Статистика по пользователям</h2>
    </div>
    <div class="card-body">
        <!-- Периоды -->
        <div class="period-tabs">
            <div class="period-tab active" data-period="all">За все время</div>
            <div class="period-tab" data-period="year">За год</div>
            <div class="period-tab" data-period="month">За месяц</div>
            <div class="period-tab" data-period="week">За неделю</div>
            <div class="period-tab" data-period="today">За сегодня</div>
            <div class="period-tab" data-period="custom" id="customPeriodBtn">Выбрать период</div>
        </div>

        <!-- Форма кастомного периода -->
        <div class="custom-period-form" id="customPeriodForm">
            <div class="form-group">
                <label class="form-label" for="customStartDate">Начальная дата:</label>
                <input type="date" class="form-input" id="customStartDate">
            </div>
            <div class="form-group">
                <label class="form-label" for="customEndDate">Конечная дата:</label>
                <input type="date" class="form-input" id="customEndDate">
            </div>
            <div class="form-group">
                <button class="btn btn-primary" id="applyCustomPeriod">
                    <i class="fas fa-check"></i> Применить
                </button>
            </div>
        </div>

        <!-- Быстрые фильтры -->
        <div class="quick-filters">
            <div class="form-group">
                <label class="form-label" for="userStatsPhoneFilter">Телефон:</label>
                <input type="text" class="form-input" id="userStatsPhoneFilter" placeholder="Поиск по номеру телефона">
            </div>
            <div class="form-group">
                <label class="form-label" for="minSessionsFilter">Мин. сессий:</label>
                <input type="number" class="form-input" id="minSessionsFilter" placeholder="Минимальное количество" min="0">
            </div>
        </div>

        <!-- Таблица -->
        <div class="table-container" id="userStatsTable">
            <!-- Данные будут загружены через JavaScript -->
            <div class="loading-container">
                <div class="loading"></div> Загрузка данных...
            </div>
        </div>
    </div>
</div>