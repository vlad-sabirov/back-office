import { FC, useCallback } from 'react';
import { CrmOrganizationsCardInfo, ICrmOrganizationsCardInfo } from 'fsd-features/crm-organizations-card-info';
import { useCrmCardActions } from '@fsd/entities/crm-card';
import { CrmContactService, useCrmContactGetCurrent } from '@fsd/entities/crm-contact';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmContactCardInfo } from '@fsd/features/crm-contact-card-info';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useUserDeprecated } from '@hooks';

export const Contact: FC = () => {
	const current = useStateSelector((state) => state.crm_contact.data.current);
	const [connectOrganizations] = CrmContactService.connectOrganizations();
	const [createHistory] = CrmHistoryService.create();
	const actions = useCrmCardActions();
	const { user } = useUserDeprecated();
	const [getCurrentFetch] = useCrmContactGetCurrent();

	const handleChangeOrganization = useCallback(
		async ({ value }: { value?: ICrmOrganizationsCardInfo['value'] }) => {
			if (!user || !current) {
				return;
			}
			actions.setIsUpdate(true);
			connectOrganizations({
				contactId: current.id || 0,
				organizationIds: value?.map((item) => Number(item.id)) || [],
			});

			const oldOrganizations = current.organizations?.map((item) => item.id) || [];
			const newOrganizations = value?.map((item) => Number(item.id)) || [];
			const addedOrganizations = newOrganizations.filter((item) => !oldOrganizations.includes(item));
			const removedOrganizations = oldOrganizations.filter((item) => !newOrganizations.includes(item));

			if (addedOrganizations.length) {
				const organization = value?.find((item) => Number(item.id) === addedOrganizations[0]);
				if (!organization) {
					return;
				}
				let valueString = `Прикрепил${user.sex === 'female' ? 'а' : ''} организацию: ${organization.nameEn} (${
					organization.nameEn
				})`;
				valueString += `, к контакту: ${current.name}`;
				createHistory({
					userId: String(user.id),
					contactId: current.id || 0,
					payload: valueString,
					type: 'log',
					isSystem: true,
				});
			}

			if (removedOrganizations.length) {
				const organization = current.organizations?.find((item) => item.id === removedOrganizations[0]);
				if (!organization) {
					return;
				}
				let valueString = `Отменил${user.sex === 'female' ? 'а' : ''} связь организации: ${
					organization.nameEn
				} (${organization.nameRu})`;
				valueString += `, с контактом: ${current.name}`;
				createHistory({
					userId: String(user.id),
					contactId: current.id || 0,
					payload: valueString,
					type: 'log',
					isSystem: true,
				});
			}

			await getCurrentFetch({ id: current.id });
			actions.setIsUpdate(false);
		},
		[actions, connectOrganizations, createHistory, current, getCurrentFetch, user]
	);

	if (!current) {
		return null;
	}
	return (
		<>
			<CrmContactCardInfo />
			<CrmOrganizationsCardInfo
				value={current.organizations?.map((item) => ({
					type: 'connected',
					id: String(item.id),
					nameEn: item.nameEn,
					nameRu: item.nameRu,
					website: item.website,
					comment: item.comment,
					userId: String(item.userId),
					typeId: String(item.typeId),
					phones: item.phones?.map(({ value, comment }) => ({ value, comment: comment || '' })),
					emails: item.emails?.map(({ value, comment }) => ({ value, comment: comment || '' })),
					requisites: item.requisites?.map(({ id, name, inn, code1c }) => ({
						id: String(id),
						name,
						inn: String(inn),
						code1c: String(code1c),
						type: 'connected',
					})),
				}))}
				onChange={handleChangeOrganization}
				isDisplayEmails
				isDisplayPhones
				isDisplayInn
				isConnect
				isActions
				isAdd
			/>
		</>
	);
};
