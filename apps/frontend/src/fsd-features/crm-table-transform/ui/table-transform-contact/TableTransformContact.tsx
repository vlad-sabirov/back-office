import { ReactNode, useCallback } from 'react';
import cn from 'classnames';
import { CrmCardTypes, useCrmCardShowDrawer } from '@fsd/entities/crm-card';
import { CrmContactConst, ICrmContactEntity } from '@fsd/entities/crm-contact';
import { CrmOrganizationIconBattery } from '@fsd/entities/crm-organization';
import { TextField, TextFiendPropsSize } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import css from './table-transform-contact.module.scss';

interface IExec {
	contact: ICrmContactEntity | null;
	size?: (typeof TextFiendPropsSize)[number];
}
type IResponse = (props: IExec) => { output: ReactNode; index: string };

export const useTableTransformContact = (): IResponse => {
	const showDrawer = useCrmCardShowDrawer();
	const { team, rolesAlias } = useUserDeprecated();

	const handleShowDrawer = useCallback(
		(id: number | string) => {
			showDrawer({ type: CrmCardTypes.Contact, id });
		},
		[showDrawer]
	);

	return ({ contact, size }: IExec) => {
		if (!contact || !rolesAlias) {
			return { output: null, index: '' };
		}
		const isAdmin = rolesAlias?.some((role) => CrmContactConst.Access.Admin.includes(role));
		const isNotMy = Boolean(contact.userId && !team?.includes(contact.userId));
		const isAccess = isAdmin || !isNotMy;
		const isShowBattery = Boolean(contact.userId && isAccess && CrmContactConst.Settings.showPower);

		const output = (
			<div className={css.wrapper}>
				{isShowBattery && <CrmOrganizationIconBattery updatedAt={contact.updatedAt} />}
				<TextField
					size={size}
					onClick={() => handleShowDrawer(contact.id)}
					className={cn(css.name, { [css.nameAccessDenied]: !isAccess })}
				>
					{contact.name}
				</TextField>
			</div>
		);

		return { output, index: contact.name };
	};
};
