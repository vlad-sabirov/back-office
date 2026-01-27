import { FC, useMemo, useEffect } from "react";
import cn from "classnames";
import { CrmOrganizationTypeService, CrmOrganizationTypeActions } from "@fsd/entities/crm-organization-type";
import { useStateActions, useStateSelector } from "@fsd/shared/lib/hooks";
import { Button, Icon, Modal, TextField } from "@fsd/shared/ui-kit";
import { ITypeListProps } from "../types/type-list.props";
import css from "./type-list.module.scss";
import { FetchStatusConvert, FetchStatusIsLoading } from "@fsd/shared/lib/fetch-status";
import { capitalize } from "lodash";

export const TypeList: FC<ITypeListProps> = (
	{ className, ...props }
) => {
	const data = useStateSelector((state) => state.crm_organization_type.data.list);
	const isOpen = useStateSelector((state) => state.crm_organization_type.modals.list)
	const typeActions = useStateActions(CrmOrganizationTypeActions);
	const status = useStateSelector((state) => state.crm_organization_type.status.list);
	const isLoading = useMemo(() => FetchStatusIsLoading(status), [status]);
	const [fetchCurrent, {data: fetchCurrentData, ...fetchCurrentProps}] = CrmOrganizationTypeService.getById();

	const handleClose = () => {
		typeActions.setModalShow({ modal: 'list', show: false })
	}

	const handleAdd = () => {
		typeActions.setModalShow({ modal: 'create', show: true })
	}

	const handleUpdate = (id: number) => {
		fetchCurrent(id);
		typeActions.setModalShow({ modal: 'update', show: true })
	}
	
	useEffect(() => {
		if (fetchCurrentData) { typeActions.setDataCurrent(fetchCurrentData); }
		typeActions.setStatusCurrent(FetchStatusConvert(fetchCurrentProps));
	}, [fetchCurrentProps, fetchCurrentData, typeActions])

	return (
		<Modal
			title={'Виды деятельности'}
			size={400}
			opened={isOpen}
			onClose={handleClose}
			loading={isLoading}
		>
			<div className={cn(css.wrapper, className)} {...props}>
				<TextField size={'small'} className={css.description}>
					Ниже выведен список видов деятельностей зарегистрированных в системе.
				</TextField>

				<TextField size={'small'} className={css.description}>
					Всего видов деятельности: {data.length}.
				</TextField>

				<div className={css.list}>
					{data.map((item) => {
						return (
						<Button
							key={item.id}
							color={'transparent'}
							onClick={() => handleUpdate(item.id)}
						> {capitalize(item.name)} </Button>
						);
					})}
				</div>

				<Modal.Buttons>
					<Button
						onClick={handleClose}
					> Отмена </Button>

					<Button
						color={'success'}
						variant={'hard'}
						iconLeft={<Icon name={'plus-medium'} style={{ width: 12 }} />}
						onClick={handleAdd}
					> Добавить </Button>
				</Modal.Buttons>
			</div>
		</Modal>
	);
}
