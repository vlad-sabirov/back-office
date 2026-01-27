import { FC, useCallback } from "react";
import { TextField } from "@fsd/shared/ui-kit";
import { DeleteModal } from "../delete-modal/DeleteModal";
import { RequisiteItems } from "../requisite-items/RequisiteItems";
import { UpdateModal } from "../update-modal/UpdateModal";
import { IRequisiteCardProps } from "./requisite-card.types";
import { IRequisiteSliceFormEntity } from "../../model/slice/requisite-slice.types";
import { useActions } from "../../lib/use-actions";
import { CreateModal } from "../create-modal/CreateModal";
import css from "./requisite-card.module.scss";

export const RequisiteCard: FC<IRequisiteCardProps> = (props) => {
	const {
		data,
		onCreate,
		onDelete,
		onUpdate,
		required,
	} = props;

	const actions = useActions();

	const handleShowModalAdd = useCallback(() => {
		actions.setModal(['create', true]);
		actions.setClearFormCreate();
	}, [actions]);

	const handleAdd = useCallback((value: IRequisiteSliceFormEntity) => {
		onCreate?.(value);
		actions.setModal(['create', false]);
		actions.setClearFormCreate();
	}, [actions, onCreate]);

	const handleUpdate = useCallback((value: IRequisiteSliceFormEntity) => {
		onUpdate?.(value);
		actions.setModal(['update', false]);
		actions.setClearFormUpdate();
	}, [actions, onUpdate]);

	const handleDelete = useCallback((value: IRequisiteSliceFormEntity) => {
		onDelete?.(value);
		actions.setModal(['delete', false]);
	}, [actions, onDelete]);

	return (
		<div className={css.wrapper}>
			<TextField
				size={'large'}
				className={css.heading}
			> Реквизиты {required && <span className={css.required}>*</span>} </TextField>

			<RequisiteItems
				data={data}
				isEdit={!!onUpdate ?? false}
				isDelete={!!onDelete ?? false}
			/>

			{!!onCreate && (
				<TextField
					className={css.add}
					onClick={handleShowModalAdd}
				> Добавить </TextField>
			)}

			<CreateModal data={data} onCreate={handleAdd} />
			<UpdateModal data={data} onUpdate={handleUpdate} />
			<DeleteModal onDelete={handleDelete} />
		</div>
	);
}
