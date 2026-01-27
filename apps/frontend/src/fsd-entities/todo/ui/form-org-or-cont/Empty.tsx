import { FC, useCallback, useState } from 'react';
import { IFormOrgOrContProps, IFormOrgOrContSearchResponse } from './form-org-or-cont.types';
import TailwindColors from '@config/tailwind/color';
import { CrmContactService } from '@fsd/entities/crm-contact';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import css from '@fsd/entities/todo/ui/form-org-or-cont/form-org-or-cont.module.scss';
import { useDebounce, useUser } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Icon, Input, TextField } from '@fsd/shared/ui-kit';
import { Loader } from '@mantine/core';

export const Empty: FC<IFormOrgOrContProps & { setIsShowModal: (val: boolean) => void }> = (props) => {
	const { getTeam } = useUser();
	const { onChange, setIsShowModal } = props;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [organization, setOrganization] = useState<string>('');
	const [contact, setContact] = useState<string>('');
	const [searchResponse, setSearchResponse] = useState<IFormOrgOrContSearchResponse[]>([]);

	const [fetchSearchOrg] = CrmOrganizationService.search();
	const [fetchSearchCont] = CrmContactService.search();

	const handleChangeOrganization = useDebounce(async (search: string) => {
		const team = getTeam();
		if (!search || !team) {
			setSearchResponse([]);
			setIsLoading(false);
			return;
		}

		const response = await fetchSearchOrg({ search, where: { userIds: team } });
		if ('error' in response || !response?.data?.data) {
			setSearchResponse([]);
			setIsLoading(false);
			return;
		}
		const data: IFormOrgOrContSearchResponse[] = response.data.data.map((org) => {
			const description: string[] = [];
			if (org.type?.name) description.push(org.type.name);
			return {
				id: org.id,
				type: 'organization',
				name: `${org.nameEn} (${org.nameRu})`,
				description,
				phones: org.phones?.map((phone) => phone.value) ?? [],
			};
		});
		setIsLoading(false);
		setSearchResponse(data);
	}, 300);

	const handleChangeContact = useDebounce(async (search: string) => {
		const team = getTeam();
		if (!search || !team) {
			setSearchResponse([]);
			setIsLoading(false);
			return;
		}
		const response = await fetchSearchCont({ search, where: { userIds: team } });
		if ('error' in response || !response?.data?.data) {
			setIsLoading(false);
			return;
		}
		const data: IFormOrgOrContSearchResponse[] = response.data.data.map((cont) => {
			const description: string[] = [cont.workPosition];
			if (cont.organizations && cont.organizations.length) {
				cont.organizations.forEach((org) => {
					description.push(`${org.nameEn} (${org.nameRu})`);
				});
			}
			return {
				id: Number(cont.id),
				type: 'contact',
				name: cont.name,
				description,
				phones: cont.phones?.map((phone) => phone.value) ?? [],
			};
		});
		setIsLoading(false);
		setSearchResponse(data);
	}, 300);

	const handleOnChange = useCallback(
		(value: IFormOrgOrContSearchResponse) => {
			setIsShowModal(false);
			onChange(value);
		},
		[onChange, setIsShowModal]
	);

	return (
		<div className={css.form}>
			<Input
				label={'Название организации'}
				value={organization}
				onChange={(e) => {
					setIsLoading(true);
					setOrganization(e.currentTarget.value);
					handleChangeOrganization(e.currentTarget.value);
				}}
				disabled={!!contact}
			/>
			<Input
				label={'ФИО контакта'}
				value={contact}
				onChange={(e) => {
					setIsLoading(true);
					setContact(e.currentTarget.value);
					handleChangeContact(e.currentTarget.value);
				}}
				disabled={!!organization}
			/>

			{isLoading ? (
				<Loader color={TailwindColors.primary.main} variant={'dots'} className={css.loader} />
			) : (
				<div className={css.searchResult}>
					{searchResponse.map((res) => {
						return (
							<div
								key={res.id}
								className={css.searchResult__item}
								onClick={() => {
									handleOnChange(res);
								}}
							>
								<div className={css.searchResult__itemLeft}>
									<TextField className={css.searchResult__name} size={'small'}>
										{res.name}
									</TextField>

									{res.description.map((desc) => {
										return (
											<TextField
												key={desc}
												className={css.searchResult__description}
												size={'small'}
											>
												{desc}
											</TextField>
										);
									})}

									<div className={css.searchResult__phones}>
										{res.phones.map((phone) => {
											return (
												<TextField
													key={phone}
													className={css.searchResult__phone}
													size={'small'}
												>
													<Icon name={'phone-f'} />
													{parsePhoneNumber(phone).output}
												</TextField>
											);
										})}
									</div>
								</div>
								<div className={css.searchResult__link}>
									<Icon name={'link'} />
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
