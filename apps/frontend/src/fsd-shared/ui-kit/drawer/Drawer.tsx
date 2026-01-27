import { FC } from 'react';
import cn from 'classnames';
import TailwindColors from '@config/tailwind/color';
import { Icon } from '@fsd/shared/ui-kit';
import { Loader, Drawer as MantineDrawer, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { DrawerProps } from '.';
import css from './drawer.module.scss';

export const Drawer: FC<DrawerProps> = ({ className, width, title, loading, children, sharedLink, ...props }) => {
	const clipboard = useClipboard({ timeout: 1000 });

	return (
		<MantineDrawer
			className={cn(css.wrapper, className)}
			{...props}
			title={
				<div className={css.title}>
					{title}{' '}
					{!!sharedLink && (
						<Tooltip label={'Скопировать ссылку'} withArrow>
							<div>
								<Icon
									name={'share'}
									onClick={() => {
										clipboard.copy(sharedLink);
										showNotification({
											color: 'green',
											title: 'Ссылка скопирована',
											message: 'Ссылка скопирована в буфер обмена. Теперь ей можно поделиться',
											autoClose: 2000,
										});
									}}
									className={css.shared}
									style={{ color: clipboard.copied ? TailwindColors.success.main : undefined }}
								/>
							</div>
						</Tooltip>
					)}{' '}
					{loading && <Loader size="sm" color={TailwindColors.primary.main} />}
				</div>
			}
			size={width}
		>
			<div className={cn({ [css.body__disabled]: loading })}>{children}</div>
		</MantineDrawer>
	);
};
