import { FC } from 'react';
import { IModalProps } from './modal.types';
import { cloneDeepWith } from 'lodash';
import { useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { CrmRealizationHistoryChartFeature } from '@fsd/features/crm-realization-history-chart';
import { CrmRealizationHistoryListFeature } from '@fsd/features/crm-realization-history-list';
import { Modal as UIModal } from '@fsd/shared/ui-kit';

export const Modal: FC<IModalProps> = (props) => {
	const { data, type, userId, parentId, isOpen, setIsOpen } = props;
	const dataAll = useCrmRealizationGetDataMonthAll();

	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<UIModal
			title={`Реализация ${type === 'team' ? 'команды' : 'сотрудника'}`}
			size={920}
			opened={isOpen}
			onClose={handleClose}
		>
			<CrmRealizationHistoryChartFeature data={cloneDeepWith(data)?.reverse() ?? null} height={200} />
			<br />
			<CrmRealizationHistoryListFeature
				data={data}
				all={dataAll}
				type={type}
				userId={userId}
				parentId={parentId}
				withDiff={true}
			/>
		</UIModal>
	);
};
