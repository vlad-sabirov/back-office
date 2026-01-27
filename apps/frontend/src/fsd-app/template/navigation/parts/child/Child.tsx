import { FC, useContext, useMemo } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { NextLink, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { INavigationData } from '../../navigation.types';
import css from './child.module.scss';

export const Child: FC<{ data: INavigationData }> = (props) => {
	if (props.data.isModal) {
		return <ChildModal data={props.data} />;
	}
	return <ChildLink data={props.data} />;
};

const ChildLink: FC<{ data: INavigationData }> = ({ data }) => {
	const { title, route, isHide, access } = data;
	const { route: routerRoute } = useRouter();
	const isAccess = useAccess({ access });
	const isActive: boolean = useMemo(() => routerRoute.includes(route || '!!!'), [route, routerRoute]);
	const countCrmOrgUnverified = useStateSelector((state) => state.crm_organization.count.unverified);
	const isCrmAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });

	if (isHide || !isAccess) {
		return null;
	}
	return (
		<NextLink
			className={cn(css.control, css.withoutChildren, {
				[css.control__active]: isActive,
			})}
			href={route}
		>
			{title}
			{title === 'Организации' && !!countCrmOrgUnverified && isCrmAdmin && !isActive && (
				<span className={css.badgeUnverified}>{countCrmOrgUnverified}</span>
			)}
		</NextLink>
	);
};

const ChildModal: FC<{ data: INavigationData }> = ({ data }) => {
	const { title, isHide, access } = data;
	const { modalStore } = useContext(MainContext);
	const isAccess = useAccess({ access });

	const handleModalOpen = () => {
		modalStore.modalOpen(data.modalComponent as keyof typeof modalStore.modals);
	};

	if (isHide || !isAccess) {
		return null;
	}
	return (
		<TextField className={cn(css.control, css.withoutChildren)} onClick={handleModalOpen}>
			{title}
		</TextField>
	);
};
