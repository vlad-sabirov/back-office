export const Const = {
	State: {
		ReducerName: 'crmOrganizationCardInfo',
	},
	Access: {
		ChangeUserId: ['admin', 'developer', 'boss', 'crmAdmin'],
		ToArchive: ['developer', 'boss', 'crmAdmin'],
	},
	Validation: {
		ChangeUserId: {
			UserIdNotFound: 'Укажите ответственного',
		}
	}
}
