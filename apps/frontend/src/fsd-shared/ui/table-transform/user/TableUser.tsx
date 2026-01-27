import { ReactNode } from 'react';
import { IStaffEntity, StaffMenu } from '@fsd/entities/staff';
import { TextField, TextFiendPropsSize } from '@fsd/shared/ui-kit';
import css from './table-user.module.scss';

interface IExec {
	user: IStaffEntity | undefined;
	isArchive?: boolean;
	size?: (typeof TextFiendPropsSize)[number];
}
// eslint-disable-next-line no-unused-vars
type IResponse = (props: IExec) => { output: ReactNode; index: string };

export const useTableUser = (): IResponse => {
	return ({ user, isArchive, size }: IExec) => {
		const index = !user ? 'Свободные' : user.id === 1 ? 'Приоритетные' : `${user.lastName}${user.firstName}`;

		const output = isArchive ? (
			<TextField size={size} className={css.notFoundString}>
				Удален в архив...
			</TextField>
		) : !user ? (
			<TextField size={size} className={css.notFoundString}>
				Свободные
			</TextField>
		) : user.id === 1 ? (
			<TextField size={size} className={css.notFoundString}>
				Приоритетные
			</TextField>
		) : (
			<StaffMenu user={user}>
				<TextField size={size} className={css.value}>
					{user.lastName} {user.firstName}
				</TextField>
			</StaffMenu>
		);

		return { output, index: index || '' };
	};
};
