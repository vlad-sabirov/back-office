import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { TextField } from '@fsd/shared/ui-kit';
import { HeaderContentProps } from './HeaderContent.props';
import css from './Styles.module.scss';

export const HeaderContent = observer(
	({ title, leftSection, rightSection, className }: HeaderContentProps): JSX.Element => {
		return (
			<div className={cn(css.wrapper, className)}>
				<TextField mode="heading" className={css.title}>
					{title}
				</TextField>
				<div className={css.leftSelection}>{leftSection}</div>
				<div className={css.rightSelection}>{rightSection}</div>
			</div>
		);
	}
);
