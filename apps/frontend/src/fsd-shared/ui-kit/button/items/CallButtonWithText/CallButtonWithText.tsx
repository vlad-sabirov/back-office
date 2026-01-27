import { FC, useState } from 'react';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import { useUserDeprecated } from '@hooks';
import { Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { CallButtonWithTextProps } from '.';
import css from './call-button-with-text.module.scss';

export const CallButtonWithText: FC<CallButtonWithTextProps> = (props) => {
	const { phone, whoDescription, size = 'medium', disabled } = props;
	const { user } = useUserDeprecated();
	const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

	let value = phone?.replace(/\D/g, '') || '';
	if (value.length === 12) value = value.slice(3);

	const formattedValue = parsePhoneNumber(value);

	const handleCall = async () => {
		if (value.length !== 3 && !formattedValue.valid) {
			showNotification({ color: 'red', message: 'Номер введен неверно' });
			return;
		}

		if (!user) return;
	};

	const handleCloseModal = () => {
		setModalIsOpen(false);
		return;
	};

	return (
		<>
			<Tooltip label={'Позвонить'} openDelay={300} transitionDuration={300} withArrow disabled={disabled}>
				<button
					onClick={() => (whoDescription?.length ? setModalIsOpen(true) : handleCall())}
					className={css.button}
				>
					<TextField size={size}>{formattedValue.output}</TextField>
				</button>
			</Tooltip>

			<Modal opened={modalIsOpen} onClose={handleCloseModal} title={'Позвонить?'} size={360}>
				<TextField className={css.modal__text}>Вы пытаетесь совершить звонок</TextField>
				<TextField className={css.modal__info}>
					<span>{whoDescription}</span>
				</TextField>
				<TextField className={css.modal__info}>
					Номер: <span>{formattedValue.output}</span>
				</TextField>

				<Modal.Buttons>
					<Button onClick={handleCloseModal}>Отмена</Button>

					<Button
						color={'primary'}
						variant={'hard'}
						iconLeft={<Icon name={'call-phone'} />}
						onClick={() => {
							handleCall().then();
							handleCloseModal();
						}}
					>
						Позвонить
					</Button>
				</Modal.Buttons>
			</Modal>
		</>
	);
};
