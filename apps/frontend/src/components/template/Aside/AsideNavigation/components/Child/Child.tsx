import { FC, useContext } from 'react';
import cn from 'classnames';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Icon, NextLink } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { Text } from '@mantine/core';
import { ChildProps } from '.';
import css from './styles.module.scss';

export const Child: FC<ChildProps> = ({ data }): JSX.Element => {
	const { modalStore } = useContext(MainContext);
	const countCrmOrgUnverified = useStateSelector((state) => state.crm_organization.count.unverified);
	const isCrmAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });

	const displayLink = (
		<NextLink
			href={data.route}
			className={cn(css.childWrapper, {
				[css.childWrapper__disabled]: data.isDisabled,
			})}
		>
			{data.isActive && <Icon name="arrow-large" className={cn(css.childActiveArrow)} />}

			<Text
				className={cn(css.childTitle, {
					[css.childTitle__active]: data.isActive,
					[css.childTitle__disabled]: data.isDisabled,
				})}
				size="sm"
			>
				{data.title}
				{data.title === 'Организации' && !!countCrmOrgUnverified && isCrmAdmin && !data.isActive && (
					<span className={css.badgeUnverified}>{countCrmOrgUnverified}</span>
				)}
			</Text>
		</NextLink>
	);

	const displayModal = (
		<div
			onClick={() => modalStore.modalOpen(data.modalComponent as keyof typeof modalStore.modals)}
			className={cn(css.childWrapper, {
				[css.childWrapper__disabled]: data.isDisabled,
			})}
		>
			{data.isActive && <Icon name="arrow-large" className={cn(css.childActiveArrow)} />}

			<Text
				className={cn(css.childTitle, {
					[css.childTitle__active]: data.isActive,
					[css.childTitle__disabled]: data.isDisabled,
				})}
				size="sm"
			>
				{data.title}
			</Text>
		</div>
	);

	return (
		<>{!data.isHide ? <li className={cn(css.childItem)}>{data.isModal ? displayModal : displayLink}</li> : null}</>
	);
};
