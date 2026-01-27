import { ReactNode, useCallback } from 'react';
import cn from 'classnames';
import { CrmCardTypes, useCrmCardShowDrawer } from '@fsd/entities/crm-card';
import {
	CrmOrganizationConst,
	CrmOrganizationIconBattery,
	ICrmOrganizationEntity,
} from '@fsd/entities/crm-organization';
import { TextField, TextFiendPropsSize } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import css from './table-transform-organization.module.scss';

interface IExec {
	organization: ICrmOrganizationEntity | null;
	size?: (typeof TextFiendPropsSize)[number];
}
type IResponse = (props: IExec) => { output: ReactNode; index: string };

export const useTableTransformOrganization = (): IResponse => {
	const showDrawer = useCrmCardShowDrawer();
	const { team, rolesAlias } = useUserDeprecated();

	const handleShowDrawer = useCallback(
		(id: number | string) => {
			showDrawer({ type: CrmCardTypes.Organization, id });
		},
		[showDrawer]
	);

	return ({ organization, size }: IExec) => {
		if (!organization) {
			return { output: null, index: '' };
		}
		const isAdmin = rolesAlias?.some((role) => CrmOrganizationConst.Access.Admin.includes(role));
		const isNotMy = !!organization.userId && !team?.includes(organization.userId);
		const isAccess = isAdmin || !isNotMy;
		const isShowBattery = !!organization.userId && isAccess && CrmOrganizationConst.Settings.showPower;

		const output = (
			<div className={css.wrapper}>
				{isShowBattery && <CrmOrganizationIconBattery updatedAt={organization.last1CUpdate} />}
				<TextField
					size={size}
					onClick={() => handleShowDrawer(organization.id)}
					className={cn(css.name, { [css.nameAccessDenied]: !isAccess })}
				>
					{' '}
					{organization.nameEn} ({organization.nameRu})
				</TextField>
			</div>
		);

		return { output, index: organization.nameEn };
	};
};
