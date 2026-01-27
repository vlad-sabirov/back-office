import { FC, useCallback } from 'react';
import { IRequisiteItemsProps } from './requisite-items.types';
import cn from 'classnames';
import { TextField } from '@fsd/shared/ui-kit';
import { useActions } from '../../lib/use-actions';
import { IRequisiteSliceFormEntity } from '../../model/slice/requisite-slice.types';
import css from './requisite-items.module.scss';

export const RequisiteItems: FC<IRequisiteItemsProps> = (props) => {
	const { data, isEdit, isDelete } = props;

	const actions = useActions();

	const handleShowModalUpdate = useCallback(
		(current: IRequisiteSliceFormEntity) => {
			actions.setCurrent(current);
			actions.setModal(['update', true]);
		},
		[actions]
	);

	const handleShowModalDelete = useCallback(
		(current: IRequisiteSliceFormEntity) => {
			actions.setCurrent(current);
			actions.setModal(['delete', true]);
		},
		[actions]
	);

	return (
		<div className={cn(css.wrapper, { [css.wrapper__collaps]: !data.length })}>
			{data &&
				data.map((requisite) => {
					return (
						<div key={requisite.id}>
							<TextField className={css.name} size={'small'}>
								{' '}
								{requisite.name}{' '}
							</TextField>

							{Number(requisite.inn) != 0 ? (
								<TextField className={css.inn} size={'small'}>
									{' '}
									ИНН: {requisite.inn}
								</TextField>
							) : (
								<></>
							)}

							{requisite.code1c.length != 0 ? (
								<TextField className={css.inn} size={'small'}>
									{' '}
									Код 1С: {requisite.code1c}
								</TextField>
							) : (
								<></>
							)}

							{(isEdit || isDelete) && (
								<div className={css.actions}>
									{isEdit && (
										<TextField size={'small'} onClick={() => handleShowModalUpdate(requisite)}>
											{' '}
											изменить{' '}
										</TextField>
									)}

									{isDelete && (
										<TextField size={'small'} onClick={() => handleShowModalDelete(requisite)}>
											{' '}
											удалить{' '}
										</TextField>
									)}
								</div>
							)}
						</div>
					);
				})}
		</div>
	);
};
