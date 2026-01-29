# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Back-Office ERP System — микросервисная платформа управления бизнесом на русском языке с интеграцией 1C:Enterprise.

## Build & Run Commands

```bash
# Запуск в dev-режиме (с hot reload)
make start-dev

# Запуск в prod-режиме
make start-prod

# Остановка (автоматически делает бэкап)
make stop

# Сборка образов
make build

# Восстановление БД с продакшн-сервера (192.168.25.235)
sh bin/restore/db

# Восстановление файлов uploads
sh bin/restore/files

# Локальное восстановление из бэкапа
sh bin/backup_db/restore.sh
```

### Отдельные сервисы

```bash
# Frontend (Next.js)
cd apps/frontend && npm run dev

# API (NestJS)
cd apps/api && npm run start:dev

# Account_1C (NestJS)
cd apps/account_1c && npm run start:dev

# VoIP (Go) — использует air для hot reload
cd apps/voip && air

# После изменения Prisma схемы
cd apps/api && npx prisma generate
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx (:80)                          │
│         /  →  frontend    /api  →  api    /api/voip  →  voip │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │     API      │    │    VoIP      │
│  Next.js     │    │   NestJS     │    │   Go/Gin     │
│  :3000       │    │   :3010      │    │   :3020      │
└──────────────┘    └──────┬───────┘    └──────┬───────┘
                           │                   │
                    ┌──────▼───────┐    ┌──────▼───────┐
                    │  PostgreSQL  │    │ Elasticsearch│
                    │    :5432     │    │    :3090     │
                    └──────────────┘    └──────────────┘

┌──────────────┐    ┌──────────────┐
│  Account_1C  │───▶│   MongoDB    │
│   NestJS     │    │    :27017    │
│   :3030      │    └──────────────┘
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 1C:Enterprise│
│  REST API    │
└──────────────┘
```

## Key Services

| Сервис | Стек | Порт | БД | Назначение |
|--------|------|------|-----|-----------|
| frontend | Next.js 12, React 18, Mantine | 3000 | — | Web UI (FSD архитектура) |
| api | NestJS 9, Prisma | 3010 | PostgreSQL | Основной API (CRM, Auth, Logistic) |
| account_1c | NestJS 10, Mongoose | 3030 | MongoDB | Интеграция с 1С |
| voip | Go 1.24, Gin | 3020 | Elasticsearch | Телефония, WebSocket |
| elastic | Elasticsearch 7 | 3090 | — | Полнотекстовый поиск |

## Code Structure

### Frontend (`apps/frontend/src/`)
FSD (Feature-Sliced Design) архитектура:
- `fsd-app/` — инициализация приложения
- `fsd-pages/` — страницы
- `fsd-features/` — фичи (бизнес-логика)
- `fsd-widgets/` — составные компоненты
- `fsd-entities/` — бизнес-сущности
- `fsd-shared/` — утилиты, UI-kit

### API (`apps/api/src/`)
NestJS модули:
- `auth/` — JWT аутентификация, pin-коды
- `user/` — пользователи, роли, отделы
- `crm/` — организации, контакты, телефоны
- `logistic-ved/` — документооборот ВЭД
- `notification/` — cron-уведомления (дни рождения, посещаемость)
- `search/` — Elasticsearch интеграция

**Prisma схема**: `apps/api/src/schema/schema.prisma` (30+ моделей)

### Account_1C (`apps/account_1c/src/`)
- `ms-1c/` — синхронизация с 1С
- `realization-month/` — месячная реализация
- `working-base/` — состояние клиентской базы

### VoIP (`apps/voip/`)
Go с паттерном repository:
- `controller/rest-gin/` — HTTP handlers
- `repository/elastic-crm/` — работа с Elasticsearch
- `repository/helper-events/` — WebSocket события

### Shared Go (`core/go/`)
Общие утилиты для Go сервисов: postgresql, logger, rest, errors

## Database

**PostgreSQL (API)**: CRM, Users, Auth, Logistics — через Prisma ORM
**MongoDB (Account_1C)**: realization-month, working-base — через Mongoose

Бэкапы:
- `apps/api/third_party/db/backup/last.sql`
- `apps/account_1c/third_party/db/backup/test/`

## Configuration

Все переменные окружения в `env/.env.local`

Ключевые настройки:
- `API_DB_CONNECTION_STRING` — PostgreSQL
- `ACCOUNT_1C_HOST` — URL 1С REST API (192.168.25.240)
- `VOIP_HELPER_HOST` — Asterisk helper (192.168.25.252)

## Docker

```bash
# Все сервисы на сети erp_network
docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file env/.env.local ps

# Логи конкретного сервиса
docker logs api --tail 100 -f

# Выполнить команду в контейнере
docker exec -it api sh
```

## Important Notes

- MongoDB 4.4 используется вместо 8 (требуется CPU без AVX)
- Nginx проксирует все запросы, прямой доступ к сервисам через порты
- При остановке через `make stop` автоматически создаётся бэкап
- 1С интеграция работает через REST API на внутреннем сервере
