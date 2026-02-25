/**
 * Конфигурация иерархии ролей (зеркало бэкенда)
 *
 * Главная роль → дочерняя роль
 */
export const ROLE_HIERARCHY: Record<string, string> = {
	salesHead: 'salesEmployee',
	accountingHeadImex: 'accountingEmployeeImex',
	accountingHeadVdg: 'accountingEmployeeVdg',
	accountingHeadHpt: 'accountingEmployeeHpt',
	vedHead: 'vedEmployee',
	itHead: 'itEmployee',
};

/** Обратная связь: дочерняя роль → главная роль */
export const CHILD_TO_HEAD: Record<string, string> = Object.fromEntries(
	Object.entries(ROLE_HIERARCHY).map(([head, child]) => [child, head]),
);

/** Все главные роли */
export const HEAD_ROLES = Object.keys(ROLE_HIERARCHY);

/** Все дочерние роли */
export const CHILD_ROLES = Object.values(ROLE_HIERARCHY);

/** Суперроли */
export const SUPER_ADMIN_ROLES = ['admin', 'developer'];

/** Роли с полным доступом (включая boss и crmAdmin) */
export const FULL_ACCESS_ROLES = ['admin', 'developer', 'boss', 'crmAdmin'];

/**
 * Получить дочерние роли для массива ролей пользователя
 */
export const getChildRolesForUser = (userRoles: string[]): string[] => {
	const childRoles: string[] = [];
	for (const role of userRoles) {
		if (ROLE_HIERARCHY[role]) {
			childRoles.push(ROLE_HIERARCHY[role]);
		}
	}
	return childRoles;
};

/**
 * Проверить, является ли пользователь начальником для целевого пользователя
 * по иерархии ролей (head → child)
 */
export const isHeadForUser = (currentUserRoles: string[], targetUserRoles: string[]): boolean => {
	for (const headRole of currentUserRoles) {
		const childRole = ROLE_HIERARCHY[headRole];
		if (childRole && targetUserRoles.includes(childRole)) {
			return true;
		}
	}
	return false;
};
