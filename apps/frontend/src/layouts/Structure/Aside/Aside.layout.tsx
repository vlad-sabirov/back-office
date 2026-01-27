import cn from 'classnames';
import { AsideStaff } from '@components/AsideStaff/AsideStaff';
import { NavigationApp } from '@fsd/app/index';
import { ScrollArea } from '@mantine/core';
import { NextLink } from '@mantine/next';
import LogoIcon from '../../../../public/img/logo_full.svg';
import { AsideLayoutProps } from './Aside.layout.props';
import css from './Aside.layout.module.scss';

export const AsideLayout = ({ className, ...props }: AsideLayoutProps): JSX.Element => {
	return (
		<div className={cn(css.wrapper, className)} {...props}>
			<div className={css.header}>
				<NextLink href="/" className={css.logo}>
					<LogoIcon alt="Логотип Back Office" draggable="false" />
				</NextLink>
			</div>

			<div className={css.navigation}>
				<NavigationApp />
			</div>

			<ScrollArea className={css.staff} scrollbarSize={2} scrollHideDelay={500} type="scroll">
				<AsideStaff />
			</ScrollArea>
		</div>
	);
};
