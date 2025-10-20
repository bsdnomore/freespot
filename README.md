Система для идентификации пользователей Wi-Fi по требованию российского законодательства.  
УСТАНОВКА:  
Установите: Веб-сервер Apache, PHP, MySQL, Asterisk  
Установите FreeRadius  
Импортируйте файл radius.sql  
Установите git  
Выполните: git clone https://github.com/bsdnomore/freespot.git  
Отредактируйте логин и пароль в файлах config.php, admin/config.php  
Отредактируйте SERVER_IP, PHONE_NUMBER в файле login.html (для MikroTik Hotspot)  
Загрузите файлы на MikroTik (используйте скрипт mikrotik_fetch.script)  
Купите SIP-номер и подключите его к Asterisk  
Измените конфигурацию Asterisk  
Настройте соединение между MikroTik и сервером FreeRadius  


Install Webserver Apache, PHP, MySQL, Asterisk  
Install FreeRadius  
Import radius.sql  
Install  
install git   
git clone https://github.com/bsdnomore/freespot.git  
Edit Username & Password  on config.php, admin/config.php  
Edit SERVER_IP, PHONE_NUMBER  on login.html (mikrotik hotspot)  
Upload files to mikrotik (use mikrotik_fetch.script)  
Buy a sip number and connect it to asterisk  
Change Asterisk config  
Set up a connection between mikrotik and the freeradius server 
