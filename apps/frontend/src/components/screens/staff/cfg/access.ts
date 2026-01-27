export const Access = {
	userAdd: ['developer', 'boss', 'editUser'],
	userEdit: ['developer', 'boss', 'editUser'],
	userHire: ['developer', 'boss', 'editUser'],
	userFire: ['developer', 'boss', 'editUser'],
	departmentEdit: ['developer', 'boss', 'editUser'],
	territoryEdit: ['developer', 'boss', 'editUser'],
	editPasswordSimple: ['developer', 'boss', 'editUser'],

	cabinetDisplayRealizationRoles: 'crmReportRealizationAdd',
	cabinetDisplayRealization: ['boss', 'crmReportRealizationEdit'],

	cabinetDisplayAttendance: ['developer', 'boss', 'lateness'],
	cabinetDisplayAttendanceAction: ['developer', 'boss', 'lateness'],
};
