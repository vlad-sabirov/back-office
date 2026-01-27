import { FC, useState } from 'react';
import { Conference } from './ui/conference/Conference';
import { P2P } from './ui/p2p/P2P';
import { SegmentedControl } from '@fsd/shared/ui-kit';
import css from './dialpad.module.scss';

export const Dialpad: FC = () => {
	const [dialpadType, setDialpadType] = useState<'p2p' | 'conference'>('p2p');

	return (
		<div className={css.root}>
			<SegmentedControl
				data={[
					{ value: 'p2p', label: 'Звонок' },
					{ value: 'conference', label: ' Конференция' },
				]}
				onChange={(val) => setDialpadType(val as 'p2p')}
				color={'primary'}
				className={css.type}
			/>
			{dialpadType == 'conference' ? <Conference /> : <P2P />}
		</div>
	);
};
