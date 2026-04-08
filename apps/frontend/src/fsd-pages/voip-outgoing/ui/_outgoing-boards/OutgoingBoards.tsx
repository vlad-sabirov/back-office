import { FC } from 'react';
import TailwindColors from '@config/tailwind/color';
import { useSecondsToTime } from '@fsd/shared/lib/hooks/use-seconds-to-time/use-seconds-to-time';
import { ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import css from './outgoing-boards.module.scss';

interface OutgoingBoardsProps {
	count: number;
	duration: number | null;
}

export const OutgoingBoards: FC<OutgoingBoardsProps> = ({ count, duration }) => {
	const durationStr = useSecondsToTime(duration ?? 0);

	return (
		<div className={css.root}>
			<ContentBlock className={css.item}>
				<Icon name={'call-phone'} className={css.icon} style={{ color: TailwindColors.primary[400] }} />
				<div>
					<TextField className={css.title}>Исходящие</TextField>
					<TextField className={css.value} mode={'heading'} size={'small'}>
						{count}
					</TextField>
				</div>
			</ContentBlock>

			<ContentBlock className={css.item}>
				<Icon name={'call-duration'} className={css.icon} style={{ color: TailwindColors.warning[400] }} />
				<div>
					<TextField className={css.title}>Средняя продолж.</TextField>
					<TextField className={css.value} mode={'heading'} size={'small'}>
						{durationStr}
					</TextField>
				</div>
			</ContentBlock>
		</div>
	);
};
