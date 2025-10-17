class UserReportsModule {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
    }

    initialize() {
        this.loadData();
        this.setupFilters();
    }

    setupFilters() {
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

        // Фильтры статистики
        const userStatsPhoneFilter = document.getElementById('userStatsPhoneFilter');
        if (userStatsPhoneFilter) {
            userStatsPhoneFilter.addEventListener('input', this.adminPanel.debounce(() => {
                this.adminPanel.currentPageNumber = 1;
                this.loadData();
            }, 300));
        }

        const minSessionsFilter = document.getElementById('minSessionsFilter');
        if (minSessionsFilter) {
            minSessionsFilter.addEventListener('input', this.adminPanel.debounce(() => {
                this.adminPanel.currentPageNumber = 1;
                this.loadData();
            }, 300));
        }
    }

    async loadData() {
        console.log('Loading user stats data...', {
            page: this.adminPanel.currentPageNumber,
            sort: this.adminPanel.currentSort,
            filters: this.getFilters()
        });
        
        const filters = this.getFilters();
        const params = new URLSearchParams({
            ...filters,
            sort: this.adminPanel.currentSort.column || 'total_duration',
            direction: this.adminPanel.currentSort.direction,
            page: this.adminPanel.currentPageNumber,
            limit: this.adminPanel.itemsPerPage
        });

        try {
            const response = await fetch(`api/user_stats.php?${params}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            if (data.success) {
                this.adminPanel.totalRecords = data.total;
                this.adminPanel.filteredRecords = data.filtered || data.total;
                this.renderTable(data);
                this.adminPanel.updateStats('userStatsStats');
            } else {
                console.error('API Error:', data.error);
            }
        } catch (error) {
            console.error('Error loading user stats data:', error);
            this.adminPanel.showError('userStatsTable', 'Ошибка загрузки статистики пользователей');
        }
    }

    getFilters() {
        const activeTab = document.querySelector('.period-tab.active');
        const period = activeTab ? activeTab.dataset.period : 'month';
        const customStart = document.getElementById('customStartDate')?.value || '';
        const customEnd = document.getElementById('customEndDate')?.value || '';
        
        return {
            period: period,
            start_date: period === 'custom' ? customStart : '',
            end_date: period === 'custom' ? customEnd : '',
            phone: document.getElementById('userStatsPhoneFilter')?.value || '',
            min_sessions: document.getElementById('minSessionsFilter')?.value || ''
        };
    }

    renderTable(data) {
        const table = document.getElementById('userStatsTable');
        if (!table) return;

        let html = `
            <div class="stats-bar">
                <div class="stats-info" id="userStatsStats">
                    Загрузка статистики...
                </div>

            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th data-sort="username">Телефон <i class="fas fa-sort"></i></th>
                        <th data-sort="sessions_count">Кол-во сессий <i class="fas fa-sort"></i></th>
                        <th data-sort="first_session">Первая сессия <i class="fas fa-sort"></i></th>
                        <th data-sort="last_session">Последняя сессия <i class="fas fa-sort"></i></th>
                        <th data-sort="total_duration">Общая длительность <i class="fas fa-sort"></i></th>
                        <th data-sort="total_traffic">Общий трафик <i class="fas fa-sort"></i></th>
                        <th data-sort="avg_duration">Ср. длительность <i class="fas fa-sort"></i></th>
                        <th data-sort="unique_macs">Уникальных MAC <i class="fas fa-sort"></i></th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (data.users && data.users.length > 0) {
            data.users.forEach(user => {
                html += `
                    <tr>
                        <td>${this.adminPanel.escapeHtml(user.username)}</td>
                        <td>${user.sessions_count}</td>
                        <td>${user.first_session_formatted}</td>
                        <td>${user.last_session_formatted}</td>
                        <td>${this.adminPanel.formatDuration(user.total_duration)}</td>
                        <td>${this.adminPanel.formatTraffic(user.total_traffic)}</td>
                        <td>${this.adminPanel.formatDuration(user.avg_duration)}</td>
                        <td>${user.unique_macs}</td>
                    </tr>
                `;
            });
        } else {
            html += `
                <tr>
                    <td colspan="8" style="text-align: center; color: #999;">
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
            html += this.adminPanel.renderPagination(data.total);
        }

        table.innerHTML = html;
        
        // Обновляем обработчики событий
        this.adminPanel.updateTableEventListeners();
        

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
        
        this.adminPanel.currentPageNumber = 1;
        this.loadData();
    }

    handlePeriodChange(period) {
        console.log('User stats period changed to:', period);
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
        
        this.adminPanel.currentPageNumber = 1;
        this.loadData();
    }


}