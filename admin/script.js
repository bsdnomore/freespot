class AdminPanel {
    constructor() {
        this.currentPage = 'users';
        this.currentSort = { column: null, direction: 'asc' };
        this.currentPageNumber = 1;
        this.itemsPerPage = 10;
        this.totalRecords = 0;
        this.filteredRecords = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPage('users');
    }

    setupEventListeners() {
        // Навигация по меню
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('.menu-link').dataset.page;
                this.loadPage(page);
            });
        });

        // Обработка хэша URL
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.substring(1) || 'users';
            this.loadPage(page);
        });
    }

    loadPage(page) {
        this.currentPage = page;
        
        // Обновление активного меню
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeMenu = document.querySelector(`[data-page="${page}"]`);
        if (activeMenu) {
            activeMenu.closest('.menu-item').classList.add('active');
        }

        // Загрузка контента
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '<div class="loading-container"><div class="loading"></div> Загрузка...</div>';

        fetch(`${page}.php`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                contentArea.innerHTML = html;
                this.initializePageScripts();
            })
            .catch(error => {
                console.error('Error loading page:', error);
                contentArea.innerHTML = '<div class="error">Ошибка загрузки страницы: ' + error.message + '</div>';
            });
    }

initializePageScripts() {
    if (this.currentPage === 'users') {
        this.initializeUsersPage();
    } else if (this.currentPage === 'reports') {
        this.initializeReportsPage();
    } else if (this.currentPage === 'user-stats') {
        this.initializeUserStatsPage();
    }
}
// Добавим новый метод для инициализации страницы статистики
initializeUserStatsPage() {
    this.loadUserStatsData();
    this.setupUserStatsFilters();
}

// Добавим метод для настройки фильтров статистики
setupUserStatsFilters() {
    // Периоды
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const period = e.currentTarget.dataset.period;
            this.handleUserStatsPeriodChange(period);
        });
    });

    initializeUsersPage() {
        this.loadUsersData();
        this.setupUsersFilters();
    }

    setupUsersFilters() {
        // Фильтры
        const phoneFilter = document.getElementById('phoneFilter');
        const macCountFilter = document.getElementById('macCountFilter');
        const emptyPasswordFilter = document.getElementById('emptyPasswordFilter');

        if (phoneFilter) {
            phoneFilter.addEventListener('input', this.debounce(() => {
                this.currentPageNumber = 1;
                this.loadUsersData();
            }, 300));
        }

        if (macCountFilter) {
            macCountFilter.addEventListener('input', this.debounce(() => {
                this.currentPageNumber = 1;
                this.loadUsersData();
            }, 300));
        }

        if (emptyPasswordFilter) {
            emptyPasswordFilter.addEventListener('change', () => {
                this.currentPageNumber = 1;
                this.loadUsersData();
            });
        }

        // Массовое удаление
        const massDeleteBtn = document.getElementById('massDeleteBtn');
        if (massDeleteBtn) {
            massDeleteBtn.addEventListener('click', () => {
                this.massDeleteUsers();
            });
        }
    }

    initializeReportsPage() {
        this.loadReportsData();
        this.setupReportsFilters();
    }

    setupReportsFilters() {
        // Периоды
        document.querySelectorAll('.period-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const period = e.currentTarget.dataset.period;
                this.handlePeriodChange(period);
            });
        });

        // Кастомный период
        const customPeriodBtn = document.getElementById('customPeriodBtn');
        if (customPeriodBtn) {
            customPeriodBtn.addEventListener('click', () => {
                this.toggleCustomPeriodForm();
            });
        }

        const applyCustomPeriod = document.getElementById('applyCustomPeriod');
        if (applyCustomPeriod) {
            applyCustomPeriod.addEventListener('click', () => {
                this.applyCustomPeriod();
            });
        }

        // Фильтры отчетов
        const reportPhoneFilter = document.getElementById('reportPhoneFilter');
        if (reportPhoneFilter) {
            reportPhoneFilter.addEventListener('input', this.debounce(() => {
                this.currentPageNumber = 1;
                this.loadReportsData();
            }, 300));
        }

        const terminateCauseFilter = document.getElementById('terminateCauseFilter');
        if (terminateCauseFilter) {
            terminateCauseFilter.addEventListener('change', () => {
                this.currentPageNumber = 1;
                this.loadReportsData();
            });
        }
    }

    async loadUsersData() {
        console.log('Loading users data...', this.currentPageNumber);
        const filters = this.getUsersFilters();
        const params = new URLSearchParams({
            ...filters,
            sort: this.currentSort.column || 'username',
            direction: this.currentSort.direction,
            page: this.currentPageNumber,
            limit: this.itemsPerPage
        });

        try {
            const response = await fetch(`api/users.php?${params}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            if (data.success) {
                this.totalRecords = data.total;
                this.filteredRecords = data.filtered || data.total;
                this.renderUsersTable(data);
                this.updateUsersStats();
            } else {
                console.error('API Error:', data.error);
            }
        } catch (error) {
            console.error('Error loading users data:', error);
            this.showError('usersTable', 'Ошибка загрузки данных пользователей');
        }
    }

    async loadReportsData() {
        console.log('Loading reports data...', {
            page: this.currentPageNumber,
            sort: this.currentSort,
            filters: this.getReportsFilters()
        });
        
        const filters = this.getReportsFilters();
        const params = new URLSearchParams({
            ...filters,
            sort: this.currentSort.column || 'acctstarttime',
            direction: this.currentSort.direction,
            page: this.currentPageNumber,
            limit: this.itemsPerPage
        });

        try {
            const response = await fetch(`api/reports.php?${params}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            if (data.success) {
                this.totalRecords = data.total;
                this.filteredRecords = data.filtered || data.total;
                this.renderReportsTable(data);
                this.updateReportsStats();
            } else {
                console.error('API Error:', data.error);
            }
        } catch (error) {
            console.error('Error loading reports data:', error);
            this.showError('reportsTable', 'Ошибка загрузки отчетов');
        }
    }

    getUsersFilters() {
        return {
            phone: document.getElementById('phoneFilter')?.value || '',
            mac_count: document.getElementById('macCountFilter')?.value || '',
            empty_password: document.getElementById('emptyPasswordFilter')?.checked ? '1' : '0'
        };
    }

    getReportsFilters() {
        const activeTab = document.querySelector('.period-tab.active');
        const period = activeTab ? activeTab.dataset.period : 'month';
        const customStart = document.getElementById('customStartDate')?.value || '';
        const customEnd = document.getElementById('customEndDate')?.value || '';
        
        return {
            period: period,
            start_date: period === 'custom' ? customStart : '',
            end_date: period === 'custom' ? customEnd : '',
            phone: document.getElementById('reportPhoneFilter')?.value || '',
            terminate_cause: document.getElementById('terminateCauseFilter')?.value || ''
        };
    }

    renderUsersTable(data) {
        const table = document.getElementById('usersTable');
        if (!table) return;

        let html = `
            <div class="stats-bar">
                <div class="stats-info" id="usersStats">
                    Загрузка статистики...
                </div>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="selectAll"></th>
                        <th data-sort="username">Телефон <i class="fas fa-sort"></i></th>
                        <th data-sort="value">Пароль <i class="fas fa-sort"></i></th>
                        <th data-sort="acctstarttime">Дата начала <i class="fas fa-sort"></i></th>
                        <th data-sort="mac_count">MAC-адреса <i class="fas fa-sort"></i></th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (data.users && data.users.length > 0) {
            data.users.forEach(user => {
                html += `
                    <tr>
                        <td><input type="checkbox" class="user-checkbox" value="${user.id}"></td>
                        <td>${this.escapeHtml(user.username)}</td>
                        <td>${user.value ? this.escapeHtml(user.value) : '<span style="color: #999;">Нет пароля</span>'}</td>
                        <td>${user.formatted_starttime || 'Нет данных'}</td>
                        <td>${user.mac_count || 0}</td>
                        <td>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">
                                <i class="fas fa-trash"></i> Удалить
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html += `
                <tr>
                    <td colspan="6" style="text-align: center; color: #999;">
                        Нет данных для отображения
                    </td>
                </tr>
            `;
        }

        html += `
                </tbody>
            </table>
        `;

        // Добавляем пагинацию
        if (data.users && data.users.length > 0) {
            html += this.renderPagination(data.total, 'users');
        }

        table.innerHTML = html;
        
        // Обновляем обработчики событий для пользователей
        this.updateTableEventListeners();
    }

    renderReportsTable(data) {
        const table = document.getElementById('reportsTable');
        if (!table) return;

        let html = `
            <div class="stats-bar">
                <div class="stats-info" id="reportsStats">
                    Загрузка статистики...
                </div>
                <button class="btn export-btn" id="exportBtn">
                    <i class="fas fa-download"></i> Экспорт
                </button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th data-sort="username">Телефон <i class="fas fa-sort"></i></th>
                        <th data-sort="acctstarttime">Начало сессии <i class="fas fa-sort"></i></th>
                        <th data-sort="acctstoptime">Конец сессии <i class="fas fa-sort"></i></th>
                        <th data-sort="callingstationid">MAC <i class="fas fa-sort"></i></th>
                        <th data-sort="acctsessiontime">Длительность <i class="fas fa-sort"></i></th>
                        <th data-sort="acctterminatecause">Причина отключения <i class="fas fa-sort"></i></th>
                        <th data-sort="traffic">Трафик <i class="fas fa-sort"></i></th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (data.reports && data.reports.length > 0) {
            data.reports.forEach(report => {
                html += `
                    <tr>
                        <td>${this.escapeHtml(report.username)}</td>
                        <td>${report.formatted_starttime}</td>
                        <td>${report.formatted_stoptime || '<span style="color: #28a745;">Активна</span>'}</td>
                        <td>${report.callingstationid ? this.escapeHtml(report.callingstationid) : 'Не указан'}</td>
                        <td>${this.formatDuration(report.acctsessiontime)}</td>
                        <td>${report.acctterminatecause ? this.escapeHtml(report.acctterminatecause) : 'Не указана'}</td>
                        <td>${this.formatTraffic(report.traffic)}</td>
                    </tr>
                `;
            });
        } else {
            html += `
                <tr>
                    <td colspan="7" style="text-align: center; color: #999;">
                        Нет данных для отображения
                    </td>
                </tr>
            `;
        }

        html += `
                </tbody>
            </table>
        `;

        // Добавляем пагинацию
        if (data.reports && data.reports.length > 0) {
            html += this.renderPagination(data.total, 'reports');
        }

        table.innerHTML = html;
        
        // Обновляем обработчики событий для отчетов
        this.updateTableEventListeners();
        
        // Добавляем обработчик для кнопки экспорта
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReports();
            });
        }
    }

    updateTableEventListeners() {
        // Сортировка для всех таблиц
        document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
            th.addEventListener('click', (e) => {
                const column = e.currentTarget.dataset.sort;
                console.log('Sort clicked:', column);
                this.handleSort(column);
            });
        });

        // Пагинация для всех таблиц
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.dataset.page);
                console.log('Page clicked:', page);
                if (page && !isNaN(page)) {
                    this.handlePagination(page);
                }
            });
        });

        // Удаление пользователей (только для страницы пользователей)
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const userId = e.currentTarget.dataset.id;
                this.deleteUser(userId);
            });
        });

        // Выделение всех (только для страницы пользователей)
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.user-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }

        // Обновляем иконки сортировки
        this.updateSortIcons();
    }

    renderPagination(totalItems, type) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        if (totalPages <= 1) return '';
        
        let paginationHtml = `
            <div class="pagination">
                <div class="pagination-info">
                    Показано ${((this.currentPageNumber - 1) * this.itemsPerPage) + 1}-${Math.min(this.currentPageNumber * this.itemsPerPage, totalItems)} из ${totalItems}
                </div>
                <div class="pagination-controls">
        `;

        // Кнопка "Назад"
        if (this.currentPageNumber > 1) {
            paginationHtml += `
                <button class="page-btn" data-page="${this.currentPageNumber - 1}">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPageNumber - 2 && i <= this.currentPageNumber + 2)) {
                paginationHtml += `
                    <button class="page-btn ${i === this.currentPageNumber ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPageNumber - 3 || i === this.currentPageNumber + 3) {
                paginationHtml += `<span class="page-dots">...</span>`;
            }
        }

        // Кнопка "Вперед"
        if (this.currentPageNumber < totalPages) {
            paginationHtml += `
                <button class="page-btn" data-page="${this.currentPageNumber + 1}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationHtml += `
                </div>
            </div>
        `;

        return paginationHtml;
    }

    updateUsersStats() {
        const statsElement = document.getElementById('usersStats');
        if (statsElement) {
            const showing = Math.min(this.itemsPerPage, this.filteredRecords);
            statsElement.innerHTML = `
                Всего записей: <strong>${this.totalRecords}</strong> | 
                Отобрано: <strong>${this.filteredRecords}</strong> |
                На странице: <strong>${showing}</strong>
            `;
        }
    }

    updateReportsStats() {
        const statsElement = document.getElementById('reportsStats');
        if (statsElement) {
            const showing = Math.min(this.itemsPerPage, this.filteredRecords);
            statsElement.innerHTML = `
                Всего записей: <strong>${this.totalRecords}</strong> | 
                Отобрано: <strong>${this.filteredRecords}</strong> |
                На странице: <strong>${showing}</strong>
            `;
        }
    }

    toggleCustomPeriodForm() {
        const form = document.getElementById('customPeriodForm');
        const tabs = document.querySelectorAll('.period-tab');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        if (form) {
            form.classList.toggle('active');
        }
        
        // Добавляем активный класс для кастомного периода
        if (form && form.classList.contains('active')) {
            const customTab = document.querySelector('[data-period="custom"]');
            if (customTab) customTab.classList.add('active');
        }
    }

    applyCustomPeriod() {
        const startDate = document.getElementById('customStartDate')?.value;
        const endDate = document.getElementById('customEndDate')?.value;
        
        if (!startDate || !endDate) {
            alert('Пожалуйста, выберите начальную и конечную даты');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('Начальная дата не может быть больше конечной');
            return;
        }
        
        this.currentPageNumber = 1;
        this.loadReportsData();
    }

    handlePeriodChange(period) {
        console.log('Period changed to:', period);
        document.querySelectorAll('.period-tab').forEach(tab => tab.classList.remove('active'));
        const activeTab = document.querySelector(`[data-period="${period}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Скрываем форму кастомного периода если выбран другой период
        if (period !== 'custom') {
            const customForm = document.getElementById('customPeriodForm');
            if (customForm) {
                customForm.classList.remove('active');
            }
        }
        
        this.currentPageNumber = 1;
        this.loadReportsData();
    }

    handleSort(column) {
        console.log('Handling sort:', column, 'current:', this.currentSort);
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        console.log('New sort:', this.currentSort);
        this.currentPageNumber = 1;

        if (this.currentPage === 'users') {
            this.loadUsersData();
        } else {
            this.loadReportsData();
        }
    }

    handlePagination(page) {
        console.log('Handling pagination:', page);
        this.currentPageNumber = page;
        if (this.currentPage === 'users') {
            this.loadUsersData();
        } else {
            this.loadReportsData();
        }
    }

    updateSortIcons() {
        const table = document.querySelector('.data-table');
        if (!table) return;

        table.querySelectorAll('th[data-sort]').forEach(th => {
            const icon = th.querySelector('i');
            if (!icon) return;
            
            if (th.dataset.sort === this.currentSort.column) {
                icon.className = this.currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
                th.classList.add('sort-asc');
                th.classList.remove('sort-desc');
            } else {
                icon.className = 'fas fa-sort';
                th.classList.remove('sort-asc', 'sort-desc');
            }
        });
    }

    async deleteUser(userId) {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }

        try {
            const response = await fetch('api/delete_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: userId })
            });

            const result = await response.json();
            
            if (result.success) {
                this.loadUsersData();
            } else {
                alert('Ошибка при удалении пользователя: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Ошибка при удалении пользователя');
        }
    }

    massDeleteUsers() {
        const selectedUsers = Array.from(document.querySelectorAll('.user-checkbox:checked'))
            .map(checkbox => checkbox.value);

        if (selectedUsers.length === 0) {
            alert('Выберите пользователей для удаления');
            return;
        }

        if (!confirm(`Вы уверены, что хотите удалить ${selectedUsers.length} пользователей?`)) {
            return;
        }

        // Реализация массового удаления
        selectedUsers.forEach(userId => {
            this.deleteUser(userId);
        });
    }

    exportReports() {
        const filters = this.getReportsFilters();
        const params = new URLSearchParams(filters);
        
        // Открываем в новом окне для скачивания
        window.open(`api/export_reports.php?${params}`, '_blank');
    }

    formatDuration(seconds) {
        if (!seconds) return '0 сек';
        
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (days > 0) parts.push(`${days} д`);
        if (hours > 0) parts.push(`${hours} ч`);
        if (minutes > 0) parts.push(`${minutes} м`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs} с`);

        return parts.join(' ');
    }

    formatTraffic(bytes) {
        if (!bytes) return '0 Б';
        
        const gb = bytes / (1024 * 1024 * 1024);
        if (gb >= 1) return `${gb.toFixed(2)} ГБ`;

        const mb = bytes / (1024 * 1024);
        if (mb >= 1) return `${mb.toFixed(2)} МБ`;

        const kb = bytes / 1024;
        return `${kb.toFixed(2)} КБ`;
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});