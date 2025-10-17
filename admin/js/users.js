class UsersModule {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
    }

    initialize() {
        this.loadData();
        this.setupFilters();
    }

    setupFilters() {
        // Фильтры
        const phoneFilter = document.getElementById('phoneFilter');
        const macCountFilter = document.getElementById('macCountFilter');
        const emptyPasswordFilter = document.getElementById('emptyPasswordFilter');

        if (phoneFilter) {
            phoneFilter.addEventListener('input', this.adminPanel.debounce(() => {
                this.adminPanel.currentPageNumber = 1;
                this.loadData();
            }, 300));
        }

        if (macCountFilter) {
            macCountFilter.addEventListener('input', this.adminPanel.debounce(() => {
                this.adminPanel.currentPageNumber = 1;
                this.loadData();
            }, 300));
        }

        if (emptyPasswordFilter) {
            emptyPasswordFilter.addEventListener('change', () => {
                this.adminPanel.currentPageNumber = 1;
                this.loadData();
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

    async loadData() {
        console.log('Loading users data...', this.adminPanel.currentPageNumber);
        const filters = this.getFilters();
        const params = new URLSearchParams({
            ...filters,
            sort: this.adminPanel.currentSort.column || 'username',
            direction: this.adminPanel.currentSort.direction,
            page: this.adminPanel.currentPageNumber,
            limit: this.adminPanel.itemsPerPage
        });

        try {
            const response = await fetch(`api/users.php?${params}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            if (data.success) {
                this.adminPanel.totalRecords = data.total;
                this.adminPanel.filteredRecords = data.filtered || data.total;
                this.renderTable(data);
                this.adminPanel.updateStats('usersStats');
            } else {
                console.error('API Error:', data.error);
            }
        } catch (error) {
            console.error('Error loading users data:', error);
            this.adminPanel.showError('usersTable', 'Ошибка загрузки данных пользователей');
        }
    }

    getFilters() {
        return {
            phone: document.getElementById('phoneFilter')?.value || '',
            mac_count: document.getElementById('macCountFilter')?.value || '',
            empty_password: document.getElementById('emptyPasswordFilter')?.checked ? '1' : '0'
        };
    }


renderTable(data) {
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
                    <th data-sort="created_at">Дата добавления <i class="fas fa-sort"></i></th>
                    <th data-sort="first_session">Первая сессия <i class="fas fa-sort"></i></th>
                    <th data-sort="last_session">Последняя сессия <i class="fas fa-sort"></i></th>
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
                    <td>${this.adminPanel.escapeHtml(user.username)}</td>
                    <td>${user.value ? this.adminPanel.escapeHtml(user.value) : '<span style="color: #999;">Нет пароля</span>'}</td>
                    <td>${user.formatted_created_at || 'Нет данных'}</td>
                    <td>${user.formatted_first_session || 'Нет сессий'}</td>
                    <td>${user.formatted_last_session || 'Нет сессий'}</td>
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
    this.updateEventListeners();
}

    updateEventListeners() {
        this.adminPanel.updateTableEventListeners();

        // Удаление пользователей
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const userId = e.currentTarget.dataset.id;
                this.deleteUser(userId);
            });
        });

        // Выделение всех
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.user-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }
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
                this.loadData();
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
}