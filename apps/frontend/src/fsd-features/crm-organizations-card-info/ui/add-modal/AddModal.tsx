import { FC, useCallback } from "react";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Modal } from "@fsd/shared/ui-kit";
import { useActions } from "../../lib/useActions/useActions";
import { Connect } from "../connect/Connect";
import { FindForm } from "../find-form/FindForm";
import { IAddModalProps } from "./add-modal.types";

export const AddModal: FC<IAddModalProps> = (props) => {
	const isLoading = useStateSelector((state) => state.crm_organizations_card_info.isLoading);
	const isShow = useStateSelector((state) => state.crm_organizations_card_info.isShowModals.add);
	const findStatus = useStateSelector((state) => state.crm_organizations_card_info.find.status);
	const actions = useActions();

	const handleClose = useCallback(() => { actions.setShowModal(['add', false]); }, [actions]);

	return (
		<Modal 
			title={'Поиск организации'} 
			opened={isShow} 
			onClose={handleClose}
			size={600}
			loading={isLoading}
		>
			{findStatus === 'form' && <FindForm {...props} />}
			{findStatus === 'connect' && <Connect {...props} />}
		</Modal>
	);
}
