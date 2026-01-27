import cn from 'classnames';
import { Prism, PrismProps } from '@mantine/prism';
import css from './Styles.layout.module.scss';

export const Code = ({ children, className, ...props }: PrismProps): JSX.Element => {
	const classNames = cn(css.root, className);

	return (
		<Prism className={classNames} noCopy {...props}>
			{children}
		</Prism>
	);
};
