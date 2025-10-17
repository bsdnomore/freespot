class SessionReportsModule {
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

        // Фильтры отчетов
        const reportPhoneFilter = document.getElementById('reportPhoneFilter');
        if (reportPhoneFilter) {
            reportPhoneFilter.addEventListener('input', this.adminPanel.debounce(() => {
                this.adminPanel.currentPageNumber = 1;
                this.loadData();
            }, 300));
        }

        const terminateCauseFilter = document.getElementById('terminateCauseFilter');
        if (terminateCauseFilter) {
            terminateCauseFilter.addEventListener('change', () => {
                this.adminPanel.currentPageNumber = 1;
                this.loadData();
            });
        }

        // Фильтр активных сессий
        const activeSessionsFilter = document.getElementById('activeSessionsFilter');
        if (activeSessionsFilter) {
            activeSessionsFilter.addEventListener('change', () => {
                this.adminPanel.currentPageNumber = 1;
                this.loadData();
            });
        }
    }

    async loadData() {
        console.log('Loading reports data...', {
            page: this.adminPanel.currentPageNumber,
            sort: this.adminPanel.currentSort,
            filters: this.getFilters()
        });
        
        const filters = this.getFilters();
        const params = new URLSearchParams({
            ...filters,
            sort: this.adminPanel.currentSort.column || 'acctstarttime',
            direction: this.adminPanel.currentSort.direction,
            page: this.adminPanel.currentPageNumber,
            limit: this.adminPanel.itemsPerPage
        });

        try {
            const response = await fetch(`api/reports.php?${params}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            if (data.success) {
                this.adminPanel.totalRecords = data.total;
                this.adminPanel.filteredRecords = data.filtered || data.total;
                this.renderTable(data);
                this.adminPanel.updateStats('reportsStats');
            } else {
                console.error('API Error:', data.error);
            }
        } catch (error) {
            console.error('Error loading reports data:', error);
            this.adminPanel.showError('reportsTable', 'Ошибка загрузки отчетов');
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
            phone: document.getElementById('reportPhoneFilter')?.value || '',
            terminate_cause: document.getElementById('terminateCauseFilter')?.value || '',
            active_sessions: document.getElementById('activeSessionsFilter')?.checked ? '1' : '0'
        };
    }

    renderTable(data) {
        const table = document.getElementById('reportsTable');
        if (!table) return;

        let html = `
            <div class="stats-bar">
                <div class="stats-info" id="reportsStats">
                    Загрузка статистики...
                </div>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th data-sort="username">Телефон <i class="fas fa-sort"></i></th>
                        <th data-sort="acctstarttime">Начало сессии <i class="fas fa-sort"></i></th>
                        <th data-sort="acctstoptime">Конец сессии <i class="fas fa-sort"></i></th>
                        <th data-sort="callingstationid">MAC <i class="fas fa-sort"></i></th>
                        <th data-sort="acctsessiontime">Длительность <i class="fas fa-sort"></i></th>
                        <th data-sort="acctterminatecause">Статус <i class="fas fa-sort"></i></th>
                        <th data-sort="traffic">Трафик <i class="fas fa-sort"></i></th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (data.reports && data.reports.length > 0) {
            data.reports.forEach(report => {
                const isActive = !report.acctstoptime;
                const status = isActive ? 
                    '<span style="color: #28a745; font-weight: bold;">🟢 Активна</span>' :
                    (report.acctterminatecause ? 
                        `<span style="color: #6c757d;">🔴 ${this.adminPanel.escapeHtml(report.acctterminatecause)}</span>` :
                        '<span style="color: #6c757d;">🔴 Не указана</span>');
                
                html += `
                    <tr>
                        <td>${this.adminPanel.escapeHtml(report.username)}</td>
                        <td>${report.formatted_starttime}</td>
                        <td>${report.formatted_stoptime || '-'}</td>
                        <td>${report.callingstationid ? this.adminPanel.escapeHtml(report.callingstationid) : 'Не указан'}</td>
                        <td>${this.adminPanel.formatDuration(report.acctsessiontime)}</td>
                        <td>${status}</td>
                        <td>${this.adminPanel.formatTraffic(report.traffic)}</td>
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
        
        this.adminPanel.currentPageNumber = 1;
        this.loadData();
    }
}