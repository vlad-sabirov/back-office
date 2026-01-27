import { useCallback } from 'react';
import { ICreateHistoryProps, ICreateHistoryUser, IUpdateEmailsProps, IUpdatePhonesProps } from './use-update.types';
import { filterByArray } from '@dsbasko/filter-by-array';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmOrganizationService, ICrmOrganizationEntity } from '@fsd/entities/crm-organization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@helpers';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';

export const useUpdate = () => {
	const [updateOrganization] = CrmOrganizationService.updateById();
	const [createHistoryFetch] = CrmHistoryService.create();
	const { user } = useUserDeprecated();

	const staffSales = useStateSelector((state) => state.staff.data.sales);
	const organizationTypes = useStateSelector((state) => state.crm_organization_type.data.list);
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const formNameEn = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.nameEn);
	const formNameRu = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.nameRu);
	const formUserId = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.userId);
	const formTypeId = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.typeId);
	const formPhones = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.phones);
	const formEmails = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.emails);
	const formWebsite = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.website);
	const formTags = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.tags);
	const formComment = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.comment);
	const formColor = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.color);

	const createHistory = useCallback(
		async ({ oldVal, newVal, field }: ICreateHistoryProps) => {
			if (!user?.id || !current) {
				return;
			}

			let message = '';
			if (field === 'nameEn') {
				message =
					`${user.sex === 'male' ? 'Изменил' : 'Изменила'} ` +
					`название организации на латинице с "${oldVal}" на "${newVal}"`;
			}

			if (field === 'nameRu') {
				message =
					`${user.sex === 'male' ? 'Изменил' : 'Изменила'} ` +
					`название организации на кириллице с "${oldVal}" на "${newVal}"`;
			}

			if (field === 'userId') {
				const staff: ICreateHistoryUser[] = [
					...staffSales.map(({ id, lastName, firstName }) => ({ id, lastName, firstName })),
					{ id: 0, firstName: 'котел', lastName: 'Общий' },
				];

				const oldUser = staff.find(({ id }) => String(id) === oldVal);
				const newUser = staff.find(({ id }) => String(id) === newVal);
				message =
					`${user.sex === 'male' ? 'Изменил' : 'Изменила'} ` +
					`ответственного с ${oldUser?.lastName} ${oldUser?.firstName}` +
					` на ${newUser?.lastName} ${newUser?.firstName}`;
			}

			if (field === 'typeId') {
				const oldType = organizationTypes.find(({ id }) => String(id) === oldVal);
				const newType = organizationTypes.find(({ id }) => String(id) === newVal);
				message =
					`${user.sex === 'male' ? 'Изменил' : 'Изменила'} ` +
					`сферу деятельности с ${oldType?.name} на ${newType?.name}`;
			}

			if (field === 'website') {
				message = `${user.sex === 'male' ? 'Изменил' : 'Изменила'} ` + `вебсайт с "${oldVal}" на "${newVal}"`;
			}

			if (field === 'comment') {
				message =
					`${user.sex === 'male' ? 'Изменил' : 'Изменила'} ` + `комментарий с "${oldVal}" на "${newVal}"`;
			}

			await createHistoryFetch({
				userId: user.id,
				organizationId: current.id,
				type: 'log',
				isSystem: true,
				payload: message,
			});
		},
		[createHistoryFetch, current, organizationTypes, staffSales, user]
	);

	const updatePhones = useCallback(
		async ({ oldVal, newVal }: IUpdatePhonesProps) => {
			if (JSON.stringify(oldVal) === JSON.stringify(newVal) || !current) {
				return;
			}
			const newPhones = newVal.map((phone) => ({ value: phone.value, comment: phone.comment }));
			const oldPhones = oldVal.map((phone) => ({ value: phone.value, comment: phone.comment }));

			const response = await updateOrganization({
				id: current?.id || 0,
				updateDto: {},
				phonesDto: newPhones.map((phone) => ({
					organizationId: current?.id || 0,
					type: 'organization',
					value: phone.value,
					comment: phone.comment,
				})),
			});

			if ('error' in response) {
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: response.error.data.message ?? 'Не удалось обновить телефоны. Обратитесь в IT отдел',
				});
				return;
			}

			const toDelete = filterByArray(oldPhones, newPhones, (one, two) => one.value !== two.value);
			if (toDelete.length) {
				for (const phone of toDelete) {
					if (!phone.value) {
						continue;
					}
					let valueString = `Удалил${user?.sex === 'female' ? 'а' : ''}`;
					valueString += ` телефон ${parsePhoneNumber(phone.value).output}`;
					valueString += ` у организации ${current?.nameEn} (${current?.nameRu})`;

					await createHistoryFetch({
						userId: String(user?.id ?? 0),
						organizationId: current?.id || 0,
						payload: valueString,
						type: 'log',
						isSystem: true,
					});
				}
			}

			const toAdd = filterByArray(newPhones, oldPhones, (one, two) => one.value !== two.value);
			if (toAdd.length) {
				for (const phone of toAdd) {
					if (!phone.value) {
						continue;
					}
					let valueString = `Добавил${user?.sex === 'female' ? 'а' : ''}`;
					valueString += ` телефон ${parsePhoneNumber(phone.value).output}`;
					valueString += ` для организации ${current?.nameEn} (${current?.nameRu})`;

					await createHistoryFetch({
						userId: String(user?.id || 0),
						organizationId: current?.id || 0,
						payload: valueString,
						type: 'log',
						isSystem: true,
					});
				}
			}

			const toEdit = filterByArray(
				newPhones,
				oldPhones,
				(first, second) => first.value === second.value && first.comment !== second.comment
			);
			if (toEdit.length) {
				for (const phone of toEdit) {
					if (!phone.value) continue;
					let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''}`;
					valueString += ` комментарий для телефона ${parsePhoneNumber(phone.value).output}`;
					valueString += ` с "${oldPhones?.find((item) => item.value === phone.value)?.comment}"`;
					valueString += ` на "${phone.comment}"`;
					valueString += ` у организации ${current?.nameEn} (${current?.nameRu})`;

					await createHistoryFetch({
						userId: String(user?.id ?? 0),
						organizationId: current?.id || 0,
						payload: valueString,
						type: 'log',
						isSystem: true,
					});
				}
			}
		},
		[createHistoryFetch, current, updateOrganization, user]
	);

	const updateEmails = useCallback(
		async ({ oldVal, newVal }: IUpdateEmailsProps) => {
			if (JSON.stringify(oldVal) === JSON.stringify(newVal) && !current) {
				return;
			}
			const newEmails = newVal.map((email) => ({ value: email.value, comment: email.comment }));
			const oldEmails = oldVal.map((email) => ({ value: email.value, comment: email.comment }));

			const response = await updateOrganization({
				id: current?.id || 0,
				updateDto: {},
				emailsDto: newVal.map((email) => ({
					organizationId: current?.id || 0,
					type: 'organization',
					value: email.value,
					comment: email.comment,
				})),
			});

			if ('error' in response) {
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: response.error.data.message ?? 'Не удалось обновить почтовые ящики. Обратитесь в IT отдел',
				});
				return;
			}

			const toDelete = filterByArray(oldEmails, newEmails, (one, two) => one.value !== two.value);
			if (toDelete.length) {
				for (const email of toDelete) {
					if (!email.value) {
						continue;
					}
					let valueString = `Удалил${user?.sex === 'female' ? 'а' : ''}`;
					valueString += ` почтовый ящик ${email.value}`;
					valueString += ` у организации ${current?.nameEn} (${current?.nameRu})`;

					await createHistoryFetch({
						userId: String(user?.id ?? 0),
						organizationId: current?.id || 0,
						payload: valueString,
						type: 'log',
						isSystem: true,
					});
				}
			}

			const toAdd = filterByArray(newEmails, oldEmails, (one, two) => one.value !== two.value);
			if (toAdd.length) {
				for (const email of toAdd) {
					if (!email.value) {
						continue;
					}
					let valueString = `Добавил${user?.sex === 'female' ? 'а' : ''}`;
					valueString += ` почтовый ящик ${email.value}`;
					valueString += ` для организации ${current?.nameEn} (${current?.nameRu})`;

					await createHistoryFetch({
						userId: String(user?.id ?? 0),
						organizationId: current?.id || 0,
						payload: valueString,
						type: 'log',
						isSystem: true,
					});
				}
			}

			const toEdit = filterByArray(
				newEmails,
				oldEmails,
				(first, second) => first.value === second.value && first.comment !== second.comment
			);
			if (toEdit.length) {
				for (const email of toEdit) {
					if (!email.value) {
						continue;
					}
					let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''}`;
					valueString += ` комментарий для почтового ящика ${email.value}`;
					valueString += ` с "${oldEmails?.find((item) => item.value === email.value)?.comment}"`;
					valueString += ` на "${email.comment}"`;
					valueString += ` у организации ${current?.nameEn} (${current?.nameRu})`;

					await createHistoryFetch({
						userId: String(user?.id ?? 0),
						organizationId: current?.id || 0,
						payload: valueString,
						type: 'log',
						isSystem: true,
					});
				}
			}
		},
		[createHistoryFetch, current, updateOrganization, user]
	);

	return useCallback(async (): Promise<boolean> => {
		if (!current) {
			return false;
		}
		const oldCurrent: ICrmOrganizationEntity = JSON.parse(JSON.stringify(current));
		const hasChangesInNameEn = current.nameEn !== formNameEn;
		const hasChangesInNameRu = current.nameRu !== formNameRu;
		const hasChangesInUserId = String(current.userId) !== formUserId;
		const hasChangesInTypeId = String(current.typeId) !== formTypeId;
		const hasChangesInWebsite = current.website !== formWebsite;
		const hasChangesInComment = current.comment !== formComment;
		const hasChangesInColor = current.color !== formColor;

		const oldPhonesString = JSON.stringify(current.phones?.map(({ value, comment }) => ({ value, comment })));
		const newPhonesString = JSON.stringify(formPhones);
		const oldEmailsString = JSON.stringify(current.emails?.map(({ value, comment }) => ({ value, comment })));
		const newEmailsString = JSON.stringify(formEmails);
		const hasChangesInPhones = oldPhonesString !== newPhonesString;
		const hasChangesInEmails = oldEmailsString !== newEmailsString;

		const hasChangesInTags = JSON.stringify(current.tags?.map((tag) => tag.id)) !== JSON.stringify(formTags);

		if (
			hasChangesInNameEn ||
			hasChangesInNameRu ||
			hasChangesInUserId ||
			hasChangesInTypeId ||
			hasChangesInWebsite ||
			hasChangesInComment ||
			hasChangesInColor ||
			hasChangesInTags
		) {
			const response = await updateOrganization({
				id: current.id,
				updateDto: {
					nameEn: hasChangesInNameEn ? formNameEn : undefined,
					nameRu: hasChangesInNameRu ? formNameRu : undefined,
					userId: hasChangesInUserId ? formUserId : undefined,
					typeId: hasChangesInTypeId ? formTypeId : undefined,
					website: hasChangesInWebsite ? formWebsite : undefined,
					comment: hasChangesInComment ? formComment : undefined,
					color: hasChangesInColor ? formColor : undefined,
				},
				tagsDto: hasChangesInTags ? formTags : undefined,
			});

			if ('error' in response) {
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: response.error.data.message ?? 'Ошибка при обновлении организации, обратитесь в IT отдел',
				});
				return false;
			}
		}

		if (hasChangesInPhones) {
			await updatePhones({
				oldVal: oldCurrent.phones?.map(({ value, comment }) => ({ value, comment })) ?? [],
				newVal: formPhones,
			});
		}

		if (hasChangesInEmails) {
			await updateEmails({
				oldVal: oldCurrent.emails?.map(({ value, comment }) => ({ value, comment })) ?? [],
				newVal: formEmails,
			});
		}

		if (hasChangesInNameEn) {
			await createHistory({ oldVal: oldCurrent.nameEn, newVal: formNameEn, field: 'nameEn' });
		}

		if (hasChangesInNameRu) {
			await createHistory({ oldVal: oldCurrent.nameRu, newVal: formNameRu, field: 'nameRu' });
		}

		if (hasChangesInUserId) {
			await createHistory({ oldVal: String(oldCurrent.userId), newVal: formUserId, field: 'userId' });
		}

		if (hasChangesInTypeId) {
			await createHistory({ oldVal: String(oldCurrent.typeId), newVal: formTypeId, field: 'typeId' });
		}

		if (hasChangesInWebsite) {
			await createHistory({ oldVal: oldCurrent.website ?? '', newVal: formWebsite, field: 'website' });
		}

		if (hasChangesInComment) {
			await createHistory({ oldVal: oldCurrent.comment ?? '', newVal: formComment, field: 'comment' });
		}

		return true;
	}, [
		createHistory,
		current,
		formColor,
		formComment,
		formEmails,
		formNameEn,
		formNameRu,
		formPhones,
		formTags,
		formTypeId,
		formUserId,
		formWebsite,
		updateEmails,
		updateOrganization,
		updatePhones,
	]);
};
