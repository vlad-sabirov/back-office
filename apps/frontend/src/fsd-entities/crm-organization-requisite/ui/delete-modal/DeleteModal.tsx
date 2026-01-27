import { FC, useCallback } from "react";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Button, Icon, Modal, TextField } from "@fsd/shared/ui-kit";
import { useActions } from "../../lib/use-actions";
import { IDeleteModalProps } from "./delete-modal.types";
import css from './delete-modal.module.scss';

export const DeleteModal: FC<IDeleteModalProps> = (props) => {
	const { onDelete } = props;
	const isLoading = useStateSelector((state) => state.crm_organization_requisite.loading);
	const iShowModal = useStateSelector((state) => state.crm_organization_requisite.modals.delete);
	const current = useStateSelector((state) => state.crm_organization_requisite.current);
	const actions = useActions();

	const handleModalClose = useCallback(() => {
		actions.setModal(['delete', false]);
		actions.setCurrent(null);
	}, [actions]);

	const handleDelete = useCallback(() => {
		if (!current) { return; }
		onDelete(current);
	}, [current, onDelete]);

	return (
		<Modal
			title="Удаление реквизита"
			opened={iShowModal}
			onClose={handleModalClose}
			size={400}
			loading={isLoading}
		>
			<TextField className={css.description}>
				Вы действительно хотите удалить реквизит компании {current?.name}?
			</TextField>
			<TextField className={css.description}>
				После удаление, восстановить его будет не возможно!
			</TextField>

			<Modal.Buttons>
				<Button
					onClick={handleModalClose}
				> Отмена </Button>

				<Button
					color={'error'}
					variant={'hard'}
					iconLeft={<Icon name={'trash'} />}
					onClick={handleDelete}
				> Удалить </Button>
			</Modal.Buttons>
		</Modal>
	);
}
