import { FC, useMemo, useState } from "react";
import cn from "classnames";
import { showNotification } from "@mantine/notifications";
import { CrmOrganizationTagService, useCrmOrganizationTagActions } from "@fsd/entities/crm-organization-tag";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { FetchStatusConvert, FetchStatusIsUpdate } from "@fsd/shared/lib/fetch-status";
import { Button, Icon, Modal, TextField } from "@fsd/shared/ui-kit";
import { ITagDeleteProps } from "../types/tag-delete.props";
import css from "./tag-delete.module.scss";
import { useValidate } from "../lib/useValidate";

export const TagDelete: FC<ITagDeleteProps> = (
	{ className, ...props }
) => {
	const isOpen = useStateSelector((state) => state.crm_organization_tag.modals.delete);
	const tagActions = useCrmOrganizationTagActions();
	const [isLoadingLocal, setIsLoadingLocal] = useState<boolean>(false);
	const [deleteTag, { error, ...deleteProps }] = CrmOrganizationTagService.delete();
	const isLoadingDelete = useMemo(() => FetchStatusIsUpdate(FetchStatusConvert(deleteProps)), [deleteProps]);
	const dataCurrent = useStateSelector((state) => state.crm_organization_tag.data.current);
	const validate = useValidate();

	const handleClose = () => {
		tagActions.setModalShow({ modal: 'delete', show: false });
		setIsLoadingLocal(false);
	}

	const handleDelete = async () => {
		if (!dataCurrent) { return; }
		setIsLoadingLocal(true);
		const { id } = dataCurrent;

		if (!(await validate({ id }))) {
			setIsLoadingLocal(false);
			handleClose();
			tagActions.setModalShow({ modal: 'update', show: false });
			return;
		}

		await deleteTag({ id });
		if (error) {
			showNotification({
				color: 'red',
				message: 'Неизвестная ошибка. Обратитесь за помощью в IT отдел' ,
			})
			setIsLoadingLocal(false);
			handleClose();
			tagActions.setModalShow({ modal: 'update', show: false });
			return;
		}

		handleClose();
		showNotification({
			color: 'green',
			message: `Тег удален`,
		});
		tagActions.setModalShow({ modal: 'update', show: false });
	}
	
	return (
		<Modal
			title={`Удаление тега`}
			size={600}
			opened={isOpen}
			onClose={handleClose}
			loading={isLoadingLocal || isLoadingDelete}
		>
			<div className={cn(css.wrapper, className)} {...props}>
				<TextField>
					Вы уверены что хотите удалить тег?
					После удаления, тег автоматически исчезнет из всех сущностей, где он был применен.
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
