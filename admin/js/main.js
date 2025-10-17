class AdminPanel {
    constructor() {
        this.currentPage = 'users';
        this.currentSort = { column: null, direction: 'asc' };
        this.currentPageNumber = 1;
        this.itemsPerPage = 10;
        this.totalRecords = 0;
        this.filteredRecords = 0;
        
        // Инициализация модулей
        this.usersModule = new UsersModule(this);
        this.sessionReportsModule = new SessionReportsModule(this);
        this.userReportsModule = new UserReportsModule(this);
        
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
        switch (this.currentPage) {
            case 'users':
                this.usersModule.initialize();
                break;
            case 'reports':
                this.sessionReportsModule.initialize();
                break;
            case 'user-stats':
                this.userReportsModule.initialize();
                break;
        }
    }

    // Общие утилиты
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

    renderPagination(totalItems) {
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

    updateStats(statsElementId) {
        const statsElement = document.getElementById(statsElementId);
        if (statsElement) {
            const showing = Math.min(this.itemsPerPage, this.filteredRecords);
            statsElement.innerHTML = `
                Всего записей: <strong>${this.totalRecords}</strong> | 
                Отобрано: <strong>${this.filteredRecords}</strong> |
                На странице: <strong>${showing}</strong>
            `;
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

        // Обновляем иконки сортировки
        this.updateSortIcons();
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

        switch (this.currentPage) {
            case 'users':
                this.usersModule.loadData();
                break;
            case 'reports':
                this.sessionReportsModule.loadData();
                break;
            case 'user-stats':
                this.userReportsModule.loadData();
                break;
        }
    }

    handlePagination(page) {
        console.log('Handling pagination:', page);
        this.currentPageNumber = page;
        
        switch (this.currentPage) {
            case 'users':
                this.usersModule.loadData();
                break;
            case 'reports':
                this.sessionReportsModule.loadData();
                break;
            case 'user-stats':
                this.userReportsModule.loadData();
                break;
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});