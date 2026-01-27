import { FC, useState } from 'react';
import { Button, Icon } from '@fsd/shared/ui-kit';
import { VacationAddModal } from '../../modals';
import { RightSectionProps } from '.';
import css from './right-section.module.scss';

export const RightSection: FC<RightSectionProps> = ({ ...props }) => {
	const [modalOpen, setModalOpen] = useState<boolean>(false);

	const handleModalOpen = () => {
		setModalOpen(true);
	};

	return (
		<div className={css.wrapper} {...props}>
			<Button
				color={'info'}
				onClick={handleModalOpen}
				iconLeft={<Icon name={'plus-medium'} />}
				className={css.add}
			>
				Отпуск
			</Button>

			<VacationAddModal opened={modalOpen} setOpened={setModalOpen} />
		</div>
	);
};
