import { FC, useMemo } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Icon, NextLink } from '@fsd/shared/ui-kit';
import { Accordion } from '@mantine/core';
import { INavigationData } from '../../navigation.types';
import { Child } from '../child/Child';
import css from './parent.module.scss';

export const Parent: FC<{ data: INavigationData; active: string | null }> = (props) => {
	if (!props.data.children?.length) {
		return <ParentWithoutChildren data={props.data} active={props.active} />;
	}
	return <ParentWithChildren data={props.data} active={props.active} />;
};

const ParentWithoutChildren: FC<{ data: INavigationData; active: string | null }> = ({ data }) => {
	const { title, route, isHide, access } = data;
	const router = useRouter();
	const isAccess = useAccess({ access });

	if (isHide || !isAccess) {
		return null;
	}
	return (
		<NextLink
			className={cn(css.control, css.withoutChildren, {
				[css.control__active]: route === router.route,
			})}
			href={route}
		>
			{!!data.icon && <Icon name={data.icon} />}
			{title}
		</NextLink>
	);
};

const ParentWithChildren: FC<{ data: INavigationData; active: string | null }> = ({ data, active }) => {
	const { title, alias, icon, children, route, isHide, access } = data;
	const { route: routerRoute } = useRouter();
	const isAccess = useAccess({ access });
	const isActive: boolean = useMemo(() => routerRoute.includes(route || '!!!'), [route, routerRoute]);
	const countCrmOrgUnverified = useStateSelector((state) => state.crm_organization.count.unverified);
	const isCrmAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });

	if (isHide || !isAccess) {
		return null;
	}
	return (
		<Accordion.Item value={alias} className={css.wrapper}>
			<Accordion.Control
				icon={icon ? <Icon name={icon} /> : undefined}
				className={cn(css.control, { [css.control__active]: isActive })}
				disabled={!children?.length}
			>
				{title}
				{title === 'Продажи' && !!countCrmOrgUnverified && isCrmAdmin && !isActive && active != alias && (
					<span className={css.badgeUnverified}>{countCrmOrgUnverified}</span>
				)}
			</Accordion.Control>
			<Accordion.Panel className={css.panel}>
				{children?.map((child) => (
					<Child data={child} key={child.alias} />
				))}
			</Accordion.Panel>
		</Accordion.Item>
	);
};
