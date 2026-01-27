import { FC, useCallback } from 'react';
import { ISearchHeaderProps } from './search-header.types';
import cn from 'classnames';
import { SearchConst, useSearchActions } from '@fsd/entities/search';
import { useAccess } from '@fsd/shared/lib/hooks';
import { Button, Icon } from '@fsd/shared/ui-kit';
import { Kbd } from '@mantine/core';
import css from './search-header.module.scss';

export const SearchHeader: FC<ISearchHeaderProps> = ({ iconLeft, onClick, children, className, ...rest }) => {
	const isAccessToInput = useAccess({ access: SearchConst.Access.HeaderInput });
	const isAccessToHotkey = useAccess({ access: SearchConst.Access.ModalHotkey });
	const action = useSearchActions();

	const handleModalOpen = useCallback(() => {
		action.setIsShowModal(true);
	}, [action]);

	if (!isAccessToInput) {
		return null;
	}
	return (
		<Button
			iconLeft={iconLeft ?? <Icon name="search" />}
			onClick={() => onClick?.() ?? handleModalOpen()}
			className={cn(css.button, className)}
			{...rest}
		>
			{children ?? 'Поиск по базе'}
			<div className={css.kbd}>
				{isAccessToHotkey && (
					<>
						<Kbd>Ctrl</Kbd>
						<span style={{ margin: '0 5px' }}>+</span>
						<Kbd>/</Kbd>
					</>
				)}
			</div>
		</Button>
	);
};
