import { LatenessAccess } from '@fsd/entities/lateness';
import { VacationAccess } from '@fsd/entities/vacation';
import { INavigationData } from '../template/navigation/navigation.types';

export const data: INavigationData[] = [
	/** Главная страница */
	{
		alias: 'dashboard',
		title: 'Обзорная панель',
		icon: 'dashboard',
		route: '/',
		access: ['user'],
	},

	/** Ежедневник */
	{
		alias: 'calendar',
		title: 'Ежедневник',
		icon: 'calendar',
		route: '/calendar',
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
				alias: 'lead',
				route: '/crm/EDIT_ME',
				isDisabled: true,
				isHide: true,
				access: ['developer', 'boss', 'crm', 'crmAdmin'],
			},
			{
				title: 'Сделки',
				alias: 'deal',
				route: '/crm/EDIT_ME',
				isDisabled: true,
				isHide: true,
				access: ['developer', 'boss', 'crm', 'crmAdmin'],
			},
			{
				title: 'Организации',
				alias: 'organizations',
				route: '/crm/organization',
				isDisabled: false,
				access: ['developer', 'boss', 'crm', 'crmAdmin'],
			},
			{
				title: 'Контакты',
				alias: 'contacts',
				route: '/crm/contacts',
				isDisabled: false,
				access: ['developer', 'boss', 'crm', 'crmAdmin'],
			},
			{
				title: 'Реализация',
				alias: 'realization',
				route: '/crm/reports/realization',
				access: ['developer', 'boss', 'crm', 'crmAdmin'],
			},
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
				alias: 'report_ved',
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

	/** Телефония */
	{
		alias: 'voip',
		title: 'Телефония',
		icon: 'call-phone',
		route: '/voip',
		access: ['developer', 'crmAdmin', 'boss'],
		children: [
			{
				title: 'Входящие',
				alias: 'incoming',
				route: '/voip/incoming',
				access: ['developer', 'crmAdmin', 'boss'],
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
			{ title: 'Список сотрудников', alias: 'staff_list', route: '/staff/list', access: ['user'] },
			{
				title: 'Опоздания',
				alias: 'attendance',
				route: '/staff/late',
				access: LatenessAccess.lateness,
			},
			{
				title: 'Отпуска',
				alias: 'vacation',
				route: '/staff/vacation',
				access: VacationAccess.vacation,
			},
			{
				title: 'Праздники',
				alias: 'production-calendar',
				route: '/staff/production-calendar',
				access: ['user'],
			},
			{
				title: 'Отделы',
				alias: 'departments',
				isModal: true,
				modalComponent: 'staffDepartmentList',
				access: ['user'],
			},
			{
				title: 'Территории',
				alias: 'territories',
				isModal: true,
				modalComponent: 'staffTerritoryList',
				access: ['user'],
			},
		],
	},
];
