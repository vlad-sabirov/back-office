import { FC, useCallback } from 'react';
import { IOrganizationsProps } from './tab-organizations.types';
import cn from 'classnames';
import { CrmCardTypes, useCrmCardShowDrawer } from '@fsd/entities/crm-card';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { useSearchActions } from '@fsd/entities/search';
import { useAccess } from '@fsd/shared/lib/hooks';
import { SuffixFormat } from '@fsd/shared/lib/suffix-format';
import { Icon, Tabs, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import css from './tab-organizations.module.scss';

export const TabOrganizationList: FC<IOrganizationsProps> = ({ index, disabled, organizations }) => {
	return (
		<Tabs.Tab icon={<Icon name={'todo'} />} value={index} disabled={disabled}>
			{SuffixFormat(organizations?.length ?? 0, ['Организация', 'Организации', 'Организаций'])}{' '}
			{organizations?.length}
		</Tabs.Tab>
	);
};

export const TabOrganizationPanel: FC<IOrganizationsProps> = ({ organizations, index }) => {
	const showDrawer = useCrmCardShowDrawer();
	const searchActions = useSearchActions();
	const isCrmAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });
	const { team } = useUserDeprecated();

	const handleShowDrawer = useCallback(
		(id: number | string) => {
			searchActions.setIsShowModal(false);
			searchActions.setValue('');
			showDrawer({ type: CrmCardTypes.Organization, id });
		},
		[searchActions, showDrawer]
	);

	return (
		<Tabs.Panel value={index}>
			<div className={css.wrapper}>
				{organizations?.map((organization) => {
					const isAccess = isCrmAdmin || !organization.userId || team?.includes(Number(organization.userId));
					return (
						<div
							key={organization.id}
							className={cn(css.organization, {
								[css.disabled]: !isAccess,
								[css.archive]: organization.isArchive,
							})}
							onClick={() => handleShowDrawer(organization.id)}
						>
							<TextField className={css.name}>{organization.name}</TextField>

							{organization.isArchive ? (
								<TextField className={css.userId}>Удален, находится в архиве...</TextField>
							) : (
								<TextField className={css.userId}>
									Ответственный:{' '}
									<span>
										{!organization.user
											? 'Свободные'
											: organization.user.id === 1
											? 'Приоритетные'
											: `${organization.user?.lastName} ${organization.user?.firstName}`}
									</span>
								</TextField>
							)}

							{organization.requisites && organization.requisites.length > 1 && (
								<>
									<TextField
										key={`requeisite_${name}`}
										size={'small'}
										className={css.requisitesTitle}
									>
										Подразделений: {organization.requisites.length}
									</TextField>
									{organization.requisites.map((name, i) => (
										<TextField key={`requeisite_${name}`} size={'small'} className={css.requisites}>
											{`${i + 1}. ${name}`}
										</TextField>
									))}
								</>
							)}
						</div>
					);
				})}
			</div>
		</Tabs.Panel>
	);
};
