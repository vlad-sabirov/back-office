import { FC, memo } from 'react';
import { IIncomingBoardsProps } from './incoming-boards.types';
import cn from 'classnames';
import TailwindColors from '@config/tailwind/color';
import { useSecondsToTime } from '@fsd/shared/lib/hooks/use-seconds-to-time/use-seconds-to-time';
import { ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import css from './incoming-boards.module.scss';

export const IncomingBoards: FC<IIncomingBoardsProps> = memo((props) => {
	const { className } = props;
	const answeredCount = props.answeredCount ?? 0;
	const missedCount = props.missedCount ?? 0;
	const duration = useSecondsToTime(props.duration ?? 0);

	return (
		<div className={cn(css.root, className)}>
			<ContentBlock className={css.item}>
				<Icon name={'call-phone'} className={css.icon} style={{ color: TailwindColors.primary[200] }} />
				<div>
					<TextField className={css.title}>Всего звонков</TextField>
					<TextField className={css.value} mode={'heading'} size={'small'}>
						{answeredCount + missedCount}
					</TextField>
				</div>
			</ContentBlock>

			<ContentBlock className={css.item}>
				<Icon name={'call-answered'} className={css.icon} style={{ color: TailwindColors.success[400] }} />
				<div>
					<TextField className={css.title}>Входящие</TextField>
					<TextField className={css.value} mode={'heading'} size={'small'}>
						{answeredCount}
					</TextField>
				</div>
			</ContentBlock>

			<ContentBlock className={css.item}>
				<Icon name={'call-missed'} className={css.icon} style={{ color: TailwindColors.error[200] }} />
				<div>
					<TextField className={css.title}>Пропущено</TextField>
					<TextField className={css.value} mode={'heading'} size={'small'}>
						{missedCount}
					</TextField>
				</div>
			</ContentBlock>

			<ContentBlock className={css.item}>
				<Icon name={'call-duration'} className={css.icon} style={{ color: TailwindColors.warning[400] }} />
				<div>
					<TextField className={css.title}>Средняя продолж.</TextField>
					<TextField className={css.value} mode={'heading'} size={'small'}>
						{duration}
					</TextField>
				</div>
			</ContentBlock>
		</div>
	);
});

IncomingBoards.displayName = 'IncomingBoards';
