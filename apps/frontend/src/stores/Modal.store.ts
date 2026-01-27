import { makeAutoObservable } from 'mobx';
import { CrmReportRealizationModals } from '@screens/crm/reports/realization';

interface IModals {
	staffUserRegister: boolean;
	staffUserEdit: boolean;
	staffUserChangePassword: boolean;
	staffUserFired: boolean;
	staffUserHire: boolean;
	staffUserDelete: boolean;
	staffCardPersonalInfoEdit: boolean;
	staffCardContactInfoEdit: boolean;

	staffDepartmentList: boolean;
	staffDepartmentAdd: boolean;
	staffDepartmentEdit: boolean;
	staffDepartmentChangeToUser: boolean;
	staffDepartmentDelete: boolean;

	staffTerritoryList: boolean;
	staffTerritoryAdd: boolean;
	staffTerritoryEdit: boolean;
	staffTerritoryChangeToUser: boolean;
	staffTerritoryDelete: boolean;

	logisticVedOrderCard: boolean;
	logisticVedOrderAdd: boolean;
	logisticStagesVedAdd: boolean;
	logisticStagesVedList: boolean;
	logisticStagesVedEdit: boolean;
	logisticStagesVedDelete: boolean;
	logisticCommentVedEdit: boolean;
	logisticCommentVedDelete: boolean;

	userRoleList: boolean;
	userRoleAdd: boolean;
	userRoleEdit: boolean;
	userRoleDelete: boolean;
	userRoleStaff: boolean;

	crmReportRealizationAdd: boolean;
	crmReportRealizationEdit: boolean;
	crmReportRealizationPlanList: boolean;
	crmReportRealizationPlanAdd: boolean;
	crmReportRealizationPlanEdit: boolean;
	crmReportRealizationAddDev: boolean;
}

export default class ModalStore {
	modals: IModals = {
		staffUserRegister: false,
		staffUserEdit: false,
		staffUserChangePassword: false,
		staffUserFired: false,
		staffUserHire: false,
		staffUserDelete: false,
		staffCardPersonalInfoEdit: false,
		staffCardContactInfoEdit: false,

		staffDepartmentList: false,
		staffDepartmentAdd: false,
		staffDepartmentEdit: false,
		staffDepartmentChangeToUser: false,
		staffDepartmentDelete: false,

		staffTerritoryList: false,
		staffTerritoryAdd: false,
		staffTerritoryEdit: false,
		staffTerritoryChangeToUser: false,
		staffTerritoryDelete: false,

		logisticVedOrderCard: false,
		logisticVedOrderAdd: false,
		logisticStagesVedAdd: false,
		logisticStagesVedList: false,
		logisticStagesVedEdit: false,
		logisticStagesVedDelete: false,
		logisticCommentVedEdit: false,
		logisticCommentVedDelete: false,

		userRoleList: false,
		userRoleAdd: false,
		userRoleEdit: false,
		userRoleDelete: false,
		userRoleStaff: false,

		...CrmReportRealizationModals,
	};

	constructor() {
		makeAutoObservable(this);
	}

	modalOpen(modalState: keyof IModals, value?: boolean): void {
		this.modals[modalState] = typeof value !== 'undefined' ? value : !this.modals[modalState];
	}
}
