import { FC, useState } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { RequisitesProps, FIELD_NAME_REQUISITES } from '.';
import css from './requisite.module.scss';
import cn from 'classnames';

import {
	RequisiteAddSuccessT,
	RequisiteAddModal,
	RequisiteDeleteModal,
	RequisiteEditModal
} from '@screens/crm/organization/modals';

export const Requisites: FC<RequisitesProps> = ({ form, className }) => {
	const [current, setCurrent] = useState<RequisiteAddSuccessT | null>(null);
	const [isShowModalRequisiteAdd, setIsShowModalRequisiteAdd] = useState<boolean>(false);
	const [isShowModalRequisiteEdit, setIsShowModalRequisiteEdit] = useState<boolean>(false);
	const [isShowModalRequisiteDelete, setIsShowModalRequisiteDelete] = useState<boolean>(false);

	const handleRequisiteAdd = (res: RequisiteAddSuccessT) => {
		form.setFieldError(FIELD_NAME_REQUISITES, null);
		form.setFieldValue(
			FIELD_NAME_REQUISITES, 
			[
				...form.values[FIELD_NAME_REQUISITES],
				{ ...res, index: String(form.values[FIELD_NAME_REQUISITES].length) }
			]
		);
	}

	const handleRequisiteDelete = (res: RequisiteAddSuccessT) => {
		form.setFieldValue(
			FIELD_NAME_REQUISITES, 
			form.values[FIELD_NAME_REQUISITES].filter(item => item.inn !== res.inn)
		);
	}

	const handleRequisiteEdit = (res: RequisiteAddSuccessT) => {
		form.setFieldValue(
			FIELD_NAME_REQUISITES, 
			form.values[FIELD_NAME_REQUISITES].map(item => {
				if (item.index === res.index) return res;
				return item;
			})
		);
	}

	return (
		<>
			<div className={cn(css.root, className)}>
				<div>
					<TextField
						mode={'heading'}
						size={'small'}
						className={cn(css.title, {
							[css.title__error]: form.errors[FIELD_NAME_REQUISITES],
						})}
					>
						Реквизиты <span>*</span>
					</TextField>
					{!!form.errors[FIELD_NAME_REQUISITES] && (
						<TextField className={css.error}>
							Укажите реквизиты
						</TextField>
					)}
				</div>

				{form.values[FIELD_NAME_REQUISITES].map((item, index) => {
						return (
							<div key={index}>
								<TextField className={css.name}>{item.name}</TextField>
								<TextField className={css.inn}>ИНН: <span>{item.inn}</span></TextField>
								<div className={css.actions}>
									<TextField
									onClick={() => {
										setCurrent(item);
										setIsShowModalRequisiteEdit(true);
									}}
									> изменить </TextField>

									<TextField
									onClick={() => {
										setCurrent(item);
										setIsShowModalRequisiteDelete(true);
									}}
									> удалить </TextField>
								</div>
							</div>
						)
					})}
				
				<TextField
					className={css.add}
					onClick={() => setIsShowModalRequisiteAdd(true)}
				> Добавить </TextField>
			</div>

			<RequisiteAddModal
				opened={isShowModalRequisiteAdd}
				setOpened={setIsShowModalRequisiteAdd}
				hasData={form.values[FIELD_NAME_REQUISITES]}
				onSuccess={handleRequisiteAdd}
			/>

			<RequisiteEditModal
				current={current}
				opened={isShowModalRequisiteEdit}
				hasData={form.values[FIELD_NAME_REQUISITES].filter(item => item.index !== current?.index)}
				setOpened={setIsShowModalRequisiteEdit}
				onSuccess={handleRequisiteEdit}
			/>

			<RequisiteDeleteModal
				current={current}
				opened={isShowModalRequisiteDelete}
				setOpened={setIsShowModalRequisiteDelete}
				onSuccess={handleRequisiteDelete}
			/>
		</>
	);
};
