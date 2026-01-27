import { FC } from 'react';
import cn from 'classnames';
import { Button, Icon } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { ArrowProps } from './props';
import css from './styles.module.scss';

export const Arrow: FC<ArrowProps> = ({ viewport, ...props }) => {
	const scrollLeft = () => {
		if (viewport?.current) viewport.current.scrollTo({ left: 0, behavior: 'smooth' });
	};

	const scrollRight = () => {
		if (viewport?.current) {
			// noinspection JSSuspiciousNameCombination
			viewport.current.scrollTo({ left: viewport.current.scrollHeight, behavior: 'smooth' });
		}
	};

	return (
		<div className={css.wrapper} {...props}>
			<Tooltip label={'Прокрутить левее'} withArrow openDelay={1000} transitionDuration={300} position="top-end">
				<div>
					<Button variant="hard" className={cn(css.button, css.button__left)} onClick={scrollLeft}>
						<Icon name="arrow-medium" />
					</Button>
				</div>
			</Tooltip>

			<Tooltip label={'Прокрутить правее'} withArrow openDelay={1000} transitionDuration={300} position="top-end">
				<div>
					<Button variant="hard" className={cn(css.button, css.button__right)} onClick={scrollRight}>
						<Icon name="arrow-medium" />
					</Button>
				</div>
			</Tooltip>
		</div>
	);
};
