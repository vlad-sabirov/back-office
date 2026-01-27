import { useCallback } from 'react';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import {
	CrmOrganizationRequisiteService,
	ICrmOrganizationRequisiteFormEntity,
} from '@fsd/entities/crm-organization-requisite';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';

export const useRequisiteUpdate = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const [updateRequisiteFetch] = CrmOrganizationRequisiteService.updateById();
	const [createHistoryFetch] = CrmHistoryService.create();
	const { user } = useUserDeprecated();

	return useCallback(
		async (requisite: ICrmOrganizationRequisiteFormEntity): Promise<boolean> => {
			if (!current || !user) {
				return false;
			}

			const response = await updateRequisiteFetch({
				id: requisite.id ?? 0,
				organizationId: current.id,
				name: requisite.name,
				inn: requisite.inn,
				code1c: requisite.code1c
			});
			if ('error' in response) {
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: response.error.data.message || 'Неизвестная ошибка, обратитесь в IT отдел.',
				});
				return false;
			}

			const message =
				`${user.sex === 'male' ? 'Изменил' : 'Изменила'} реквизиты на` +
				` "${requisite.name}, ИНН: ${requisite.inn}" у организации "${current.nameEn} (${current.nameRu})"`;
			const createHistoryResponse = await createHistoryFetch({
				organizationId: current.id,
				type: 'log',
				userId: user.id,
				payload: message,
				isSystem: true,
			});

			if ('error' in createHistoryResponse) {
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: createHistoryResponse.error.data.message || 'Неизвестная ошибка, обратитесь в IT отдел.',
				});
				return false;
			}

			return true;
		},
		[createHistoryFetch, updateRequisiteFetch, current, user]
	);
};
