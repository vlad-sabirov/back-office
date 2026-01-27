import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Button, Icon, Modal, TextField } from "@fsd/shared/ui-kit";
import { FC, useCallback } from "react";
import { useActions } from "../../lib/use-actions";
import { IDisconnectModalProps } from "./disconnect-modal.types";
import css from './disconnect-modal.module.scss';

export const DisconnectModal: FC<IDisconnectModalProps> = (props) => {
	const { onDisconnect } = props;
	const isOpen = useStateSelector((state) => state.crm_contact_card_info.modals.disconnect);
	const current = useStateSelector((state) => state.crm_contact_card_info.current);
	const actions = useActions();

	const handleClose = useCallback(() => {
		actions.setCurrent(null);
		actions.setModal(['disconnect', false]);
	}, [actions]);

	const handleDisconnect = useCallback(() => {
		if (!current) { return; }
		onDisconnect?.(current)
		handleClose();
	}, [current, handleClose, onDisconnect]);

	return (
		<>
			<Modal
				title={'Открепить контакт?'}
				opened={isOpen}
				onClose={handleClose}
				size={400}
			>
				<TextField className={css.description}>
					Контакт не будет удален и его всегда можно будет прикрепить вновь.
					Вы действительно хотите открепить контакт от организации?
				</TextField>

				<Modal.Buttons>
					<Button
						onClick={handleClose}
					> Отмена </Button>

					<Button
						color={'error'}
						variant={'hard'}
						iconLeft={<Icon name={'trash'} />}
						onClick={handleDisconnect}
					> Открепить </Button>
				</Modal.Buttons>
			</Modal>
		</>
	);
}
