/**
 * Конфигурация иерархии ролей для задач и событий.
 *
 * Главная роль (head) может: создавать, просматривать, редактировать, удалять задачи/события дочерней роли (child).
 * Дочерняя роль (child) может: просматривать, редактировать, удалять свои задачи/события,
 *   НО НЕ может редактировать/удалять задачи, созданные главной ролью.
 *   Может менять статус (Готово/Отмена) даже на задачах от главной роли.
 *   Может управлять задачами/событиями своих подчинённых (через _user_child).
 *
 * Boss: полный доступ ко всем, кроме других Boss.
 * Admin/Developer: полный доступ ко всему.
 */

/** Связь "главная роль → дочерняя роль" */
export const ROLE_HIERARCHY: Record<string, string> = {
	salesHead: 'salesEmployee',
	accountingHeadImex: 'accountingEmployeeImex',
	accountingHeadVdg: 'accountingEmployeeVdg',
	accountingHeadHpt: 'accountingEmployeeHpt',
	vedHead: 'vedEmployee',
	itHead: 'itEmployee',
};

/** Обратная связь "дочерняя роль → главная роль" */
export const CHILD_TO_HEAD: Record<string, string> = Object.fromEntries(
	Object.entries(ROLE_HIERARCHY).map(([head, child]) => [child, head]),
);

/** Все главные роли */
export const HEAD_ROLES = Object.keys(ROLE_HIERARCHY);

/** Все дочерние роли */
export const CHILD_ROLES = Object.values(ROLE_HIERARCHY);

/** Суперроли с полным доступом */
export const SUPER_ADMIN_ROLES = ['admin', 'developer'];

/** Роль Boss — полный доступ кроме других Boss */
export const BOSS_ROLE = 'boss';

/** Роли с расширенным доступом к CRM */
export const CRM_ADMIN_ROLE = 'crmAdmin';
