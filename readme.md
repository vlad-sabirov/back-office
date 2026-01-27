### Запуск сервера

-  Запустить сервер можно выполнив bash скрипт `sh /app/sh/start.prod` или `sh /app/sh/start.dev`
-  Остановить сервер можно выполнив bash скрипт `sh /app/sh/stop`

<br>

### Бекапы

-  Создать сразу все бекапы `sh /app/sh/backup`
-  Сделать бекап базы данных можно выполнив bash скрипт `sh /app/sh/backup_db/backup.sh`
-  Восстановить базу из бекапа можно выполнив bash скрипт `sh /app/sh/backup_db/restore.sh`
-  Создать бекап директории uploads `sh /app/sh/backup_uploads/cron.sh`

<br>

### cron

```cron
# --------------
# [минуты] [часы] [дни-месяца] [месяцы] [дни-недели] [команда]
# --------------



# --------------
# Оповещения
# --------------

# Дни рождения сегодня
30 8 * * * /usr/bin/curl --silent http://localhost/api/notification/cron/birthday/findBirthdayToday &>/dev/null

# Дни рождения в этом месяце
45 8 1 * * /usr/bin/curl --silent http://localhost/api/notification/cron/birthday/findBirthdayThisMonth &>/dev/null

# Не отмечались сегодня
0 11 * * 1-5 /usr/bin/curl --silent http://localhost/api/notification/cron/lateness/didComeToday &>/dev/null

# Рассылка тем кто забыл отметиться
0 9 * * 1-5 /usr/bin/curl --silent http://localhost/api/notification/cron/lateness/forgotToCheckIn &>/dev/null

# Отчет руководителю о посещаемости его команды
30 9 * * 1-5 /usr/bin/curl --silent http://localhost/api/notification/cron/lateness/teamAttendanceReport &>/dev/null

# Обновление реализации из 1С
*/30 * * * * /usr/bin/curl --silent http://localhost/api/account_1c/realization/month/buildByDateToday &>/dev/null

# Дата последних изменений в 1C
0 */3 * * * /usr/bin/curl --silent http://localhost/api/account_1c/last-action/all &>/dev/null

# Состояние работоспособности базы клиентов (активные, забытые и т.д.)
*/20 * * * * /usr/bin/curl --silent http://localhost/api/account_1c/working-base/today &>/dev/null




# --------------
# Системное
# --------------

# Перезапуск VOIP сервера каждые 5 минут
*/5 7-22 * * 1-6 docker container restart voip

# Автоматические бекапы
0 1 * * 1-6 sh /app/sh/backup_uploads/cron.sh
0 2 * * 1-6 sh /app/sh/backup_db/cron.sh

# Запуск скриптов после перезагрузки системы
@reboot yandex-disk start
```
