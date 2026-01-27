import { FC, useMemo, useState } from "react";
import cn from "classnames";
import { ITypeDeleteProps } from "../types/type-delete.props";
import css from "./type-delete.module.scss";
import { useStateActions, useStateSelector } from "@fsd/shared/lib/hooks";
import { CrmOrganizationTypeService, CrmOrganizationTypeActions } from "@fsd/entities/crm-organization-type";
import { FetchStatusConvert, FetchStatusIsUpdate } from "@fsd/shared/lib/fetch-status";
import { Button, Icon, Modal, TextField } from "@fsd/shared/ui-kit";
import { showNotification } from "@mantine/notifications";
import { useValidate } from "../lib/useValidate";

export const TypeDelete: FC<ITypeDeleteProps> = (
	{ className, ...props }
) => {
	const isOpen = useStateSelector((state) => state.crm_organization_type.modals.delete);
	const typeActions = useStateActions(CrmOrganizationTypeActions);
	const [isLoadingLocal, setIsLoadingLocal] = useState<boolean>(false);
	const [deleteType, { error, ...deleteProps }] = CrmOrganizationTypeService.deleteType();
	const isLoadingDelete = useMemo(() => FetchStatusIsUpdate(FetchStatusConvert(deleteProps)), [deleteProps]);
	const dataCurrent = useStateSelector((state) => state.crm_organization_type.data.current);
	const validate = useValidate();

	const handleClose = () => {
		typeActions.setModalShow({ modal: 'delete', show: false });
		setIsLoadingLocal(false);
	}

	const handleDelete = async () => {
		if (!dataCurrent) { return; }
		setIsLoadingLocal(true);
		const { id } = dataCurrent;

		if (!(await validate({ id }))) {
			setIsLoadingLocal(false);
			handleClose();
			typeActions.setModalShow({ modal: 'update', show: false });
			return;
		}

		await deleteType({ id });
		if (error) {
			showNotification({
				color: 'red',
				message: 'Неизвестная ошибка. Обратитесь за помощью в IT отдел' ,
			})
			setIsLoadingLocal(false);
			handleClose();
			typeActions.setModalShow({ modal: 'update', show: false });
			return;
		}

		handleClose();
		showNotification({
			color: 'green',
			message: `Вид деятельности удален`,
		});
		typeActions.setModalShow({ modal: 'update', show: false });
	}
	
	return (
		<Modal
			title={`Удаление вида деятельности`}
			size={600}
			opened={isOpen}
			onClose={handleClose}
			loading={isLoadingLocal || isLoadingDelete}
		>
			<div className={cn(css.wrapper, className)} {...props}>
				<TextField>
					Вы уверены что хотите удалить вид деятельности?
					После удаления, все связанные с ним организации будут перенесены в раздел Другое.
					Вернуть данные в исходный вид будет невозможно.
				</TextField>
				<TextField>
					Вы уверены что хотите удалить вид деятельности?
				</TextField>
			</div>

			<Modal.Buttons>
				<Button
					onClick={handleClose}
				> Отмена </Button>

				<Button
					color={'error'}
					variant={'hard'}
					iconLeft={<Icon name={'trash'} />}
					onClick={handleDelete}
				> Удалить безвозвратно </Button>
			</Modal.Buttons>
		</Modal>
	);
}
