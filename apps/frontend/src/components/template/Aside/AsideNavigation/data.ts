import { ParentPropsData } from './components';

export const data: ParentPropsData[] = [
	/** Главная страница */
	{
		alias: 'dashboard',
		title: 'Обзорная панель',
		icon: 'dashboard',
		route: '/',
		access: ['user'],
	},

	/** CRM */
	{
		alias: 'crm',
		title: 'Продажи',
		icon: 'crm',
		route: '/crm',
		access: ['developer', 'boss', 'crm', 'crmAdmin'],
		children: [
			{
				title: 'Лиды',
				route: '/crm/EDIT_ME',
				isDisabled: true,
				isHide: true,
				access: ['developer', 'boss', 'crm', 'crmAdmin'],
			},
			{
				title: 'Сделки',
				route: '/crm/EDIT_ME',
				isDisabled: true,
				isHide: true,
				access: ['developer', 'boss', 'crm', 'crmAdmin'],
			},
			{
				title: 'Организации',
				route: '/crm/organization',
				isDisabled: false,
				access: ['developer', 'boss', 'crm', 'crmAdmin'],
			},
			{
				title: 'Контакты',
				route: '/crm/contacts',
				isDisabled: false,
				access: ['developer', 'boss', 'crm', 'crmAdmin'],
			},
			{
				title: 'Реализация',
				route: '/crm/reports/realization',
				access: ['boss', 'crm', 'crmAdmin'],
			}
		],
	},

	/** Логистика */
	{
		alias: 'logistics',
		title: 'Логистика',
		icon: 'logistics',
		route: '/logistic',
		access: ['developer', 'boss', 'logisticVedOrdersVed', 'logisticVedOrdersCalculate', 'logisticVedOrdersAuthor'],
		children: [
			{
				title: 'Заявки ВЭД',
				route: '/logistic/ved',
				access: [
					'developer',
					'boss',
					'logisticVedOrdersVed',
					'logisticVedOrdersCalculate',
					'logisticVedOrdersAuthor',
				],
			},
		],
	},

	/** Сотрудники */
	{
		alias: 'staff',
		title: 'Сотрудники',
		icon: 'users',
		route: '/staff',
		access: ['user'],
		children: [
			{ title: 'Список сотрудников', route: '/staff/list', access: ['user'] },
			{ title: 'Опоздания', route: '/staff/late', access: ['boss', 'developer', 'lateness'] },
			{
				title: 'Отпуска',
				route: '/staff/vacation',
				access: ['developer', 'boss', 'vacation'],
			},
			{
				title: 'Праздники',
				route: '/staff/production-calendar',
				access: ['user'],
			},
			{ title: 'Отделы', isModal: true, modalComponent: 'staffDepartmentList', access: ['user'] },
			{ title: 'Территории', isModal: true, modalComponent: 'staffTerritoryList', access: ['user'] },
		],
	},
];
