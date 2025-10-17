<?php
include 'config.php';
?>
<div class="card">
    <div class="card-header">
        <h2 class="card-title">Отчеты по сессиям</h2>
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
                <label class="form-label" for="reportPhoneFilter">Телефон:</label>
                <input type="text" class="form-input" id="reportPhoneFilter" placeholder="Поиск по номеру телефона">
            </div>
            <div class="form-group">
                <label class="form-label" for="terminateCauseFilter">Причина отключения:</label>
                <select class="form-select" id="terminateCauseFilter">
                    <option value="">Все причины</option>
                    <option value="Lost-Service">Потеря сервиса</option>
                    <option value="Lost-Carrier">Потеря связи</option>
                    <option value="Session-Timeout">Таймаут сессии</option>
                    <option value="Admin-Reset">Сброс администратором</option>
                    <option value="NAS-Reboot">Перезагрузка NAS</option>
                </select>
            </div>
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="activeSessionsFilter">
                    <label class="form-label" for="activeSessionsFilter">Только активные сессии</label>
                </div>
            </div>
        </div>

        <!-- Таблица -->
        <div class="table-container" id="reportsTable">
            <!-- Данные будут загружены через JavaScript -->
            <div class="loading-container">
                <div class="loading"></div> Загрузка данных...
            </div>
        </div>
    </div>
</div>