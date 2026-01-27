import { FC, useContext } from 'react';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Icon, NextLink } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { Collapse, Text } from '@mantine/core';
import { ParentProps } from '.';
import { Child } from '..';
import css from './styles.module.scss';

export const Parent: FC<ParentProps> = observer(({ data }): JSX.Element => {
	const { templateStore } = useContext(MainContext);
	const countCrmOrgUnverified = useStateSelector((state) => state.crm_organization.count.unverified);
	const isCrmAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });

	const withChild = (
		<li
			className={cn(css.parentItem, {
				[css.parentItem__collapsed]: data.isActive || data.isCollapsed,
			})}
		>
			<div
				className={cn(css.parentWrapper, {
					[css.parentItem__disabled]: data.isDisabled,
				})}
				onClick={() => templateStore.toggleNavigationCollapsed(data.alias)}
			>
				<Icon
					name={data.icon}
					className={cn(css.parentIcon, {
						[css.parentIcon__active]: data.isActive,
						[css.parentIcon__disabled]: data.isDisabled,
					})}
				/>

				<Text
					className={cn(css.parentTitle, {
						[css.parentTitle__active]: data.isActive,
						[css.parentTitle__disabled]: data.isDisabled,
					})}
				>
					{data.title}
					{data.title === 'Продажи' && !!countCrmOrgUnverified && isCrmAdmin && !data.isCollapsed && (
						<span className={css.badgeUnverified}>{countCrmOrgUnverified}</span>
					)}
				</Text>

				{!data.isActive && (
					<Icon
						name="arrow-medium"
						className={cn(css.parentArrow, {
							[css.parentArrow__collapsed]: data.isCollapsed,
							[css.parentArrow__disabled]: data.isDisabled,
						})}
					/>
				)}
			</div>

			{data.children?.length && (
				<Collapse in={data.isCollapsed || false} transitionDuration={300}>
					<ul>
						{data.children?.map((secondLevel, index) => (
							<Child data={secondLevel} key={index} />
						))}
					</ul>
				</Collapse>
			)}
		</li>
	);

	const withoutChildLink = (
		<li className={cn(css.parentItem)}>
			<NextLink
				href={data.isDisabled ? '#' : data.route}
				className={cn(css.parentWrapper, {
					[css.parentItem__disabled]: data.isDisabled,
				})}
			>
				<Icon
					name={data.icon}
					className={cn(css.parentIcon, {
						[css.parentIcon__active]: data.isActive,
						[css.parentIcon__disabled]: data.isDisabled,
					})}
				/>

				<Text
					className={cn(css.parentTitle, {
						[css.parentTitle__active]: data.isActive,
						[css.parentTitle__disabled]: data.isDisabled,
					})}
				>
					{data.title}
				</Text>
			</NextLink>
		</li>
	);

	return <>{!data.isHide ? (data.children?.length ? withChild : withoutChildLink) : null}</>;
});
