import { StaffSelect } from "@fsd/entities/staff";
import { useAccess, useStateSelector } from "@fsd/shared/lib/hooks";
import { Button, Modal } from "@fsd/shared/ui-kit";
import { FC, useCallback, useEffect, useState } from "react";
import { CrmContactConst } from "../..";
import { IModalUserIdProps } from "./modal-user-id.types";

export const ModalUserId: FC<IModalUserIdProps> = (
	{ isShow, setIsShow, onSuccess, isLoading }
) => {
	const staffSales = useStateSelector((state) => state.staff.data.sales);
	const currentUserId = useStateSelector((state) => state.crm_contact.data.current?.userId);
	const team = useStateSelector((state) => state.staff.data.team);
	const isAdmin = useAccess({ access: CrmContactConst.Access.Admin });

	const [value, setValue] = useState<string>(String(currentUserId));

	useEffect(() => setValue(String(currentUserId)), [currentUserId]);

	const handleClose = useCallback(() => {
		setIsShow(false);
	}, [setIsShow]);

	const handleSave = useCallback((value: string) => {
		onSuccess(value);
	}, [onSuccess]);

	return (
		<Modal 
			title={'Сменить ответственного'} 
			opened={isShow} 
			onClose={handleClose}
			size={440}
			loading={isLoading}
		>
			<StaffSelect
				label={'Ответственный'}
				value={[value]}
				onChange={(value) => {
					setValue(value[0]);
				}}
				users={isAdmin ? staffSales : team}
				withOrphan={isAdmin}
			/>
			<Modal.Buttons>
				<Button onClick={handleClose}> Отмена </Button>

				<Button
					color={'primary'}
					variant={'hard'}
					onClick={() => handleSave(value)}
				> Сохранить </Button>
			</Modal.Buttons>
		</Modal>
	);
}
