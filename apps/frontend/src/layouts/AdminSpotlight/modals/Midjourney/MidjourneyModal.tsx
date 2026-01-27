import { FC } from 'react';
import Head from 'next/head';
import { Button, Modal } from '@fsd/shared/ui-kit';
import { MidjourneyModalProps } from '.';
import css from './midjourney-modal.module.scss';

export const MidjourneyModal: FC<MidjourneyModalProps> = ({ opened, setOpened, ...props }) => {
	const handleModalClose = () => {
		setOpened(false);
	};

	return (
		<>
			{opened && (
				<Head>
					<title>Midjourney modal</title>
				</Head>
			)}

			<Modal title={'Midjourney'} size={600} opened={opened} onClose={handleModalClose}>
				<div className={css.wrapper} {...props}>
					<p>Midjourney is mounted!</p>

					<Modal.Buttons>
						<Button onClick={handleModalClose}>Отмена</Button>
						<Button color="primary" variant="hard">
							Действие
						</Button>
					</Modal.Buttons>
				</div>
			</Modal>
		</>
	);
};
