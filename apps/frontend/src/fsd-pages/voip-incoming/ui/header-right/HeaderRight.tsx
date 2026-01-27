import { FC } from 'react';
import { VoipIncomingDateWidget } from '@fsd/widgets/voip-incoming-date';

export const HeaderRight: FC = () => {
	return <VoipIncomingDateWidget maxDate={new Date()} minDate={new Date('2023-7-7')} />;
};
