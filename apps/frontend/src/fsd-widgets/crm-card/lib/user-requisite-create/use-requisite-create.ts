import { useCallback } from 'react';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import {
	CrmOrganizationRequisiteService,
	ICrmOrganizationRequisiteFormEntity,
} from '@fsd/entities/crm-organization-requisite';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';

export const useRequisiteCreate = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const [createRequisiteFetch] = CrmOrganizationRequisiteService.create();
	const [createHistoryFetch] = CrmHistoryService.create();
	const { user } = useUserDeprecated();

	return useCallback(
		async (requisite: ICrmOrganizationRequisiteFormEntity): Promise<boolean> => {
			if (!current || !user) {
				return false;
			}

			const response = await createRequisiteFetch({
				organizationId: current.id,
				name: requisite.name,
				inn: requisite.inn,
				code1c: requisite.code1c,
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
				`${user.sex === 'male' ? 'Добавил' : 'Добавила'} реквизиты` +
				` "${requisite.name}, ИНН: ${requisite.inn}" к организации "${current.nameEn} (${current.nameRu})"`;
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
		[createHistoryFetch, createRequisiteFetch, current, user]
	);
};
