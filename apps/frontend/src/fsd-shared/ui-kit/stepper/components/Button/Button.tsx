import { Button as UIButton, StoreContext } from '@fsd/shared/ui-kit';
import { observer } from 'mobx-react-lite';
import { FC, useContext } from 'react';
import { ButtonPropsT } from '.';
import * as Enums from './button.enums';

export const Button: FC<ButtonPropsT> = observer(({
	buttonType, active, setActive, isDisplay, ...props
}) => {
	const Store = useContext(StoreContext);

	const handleClick = async () => {
		Store.setLoading(true);

		// Валидация
		const isValid = await Store.config.buttons?.[buttonType]?.validate?.() ?? true;
		if (!isValid) {
			Store.setLoading(false);
			return;
		}
		
		// Выполнение заложенного действия
		await Store.config.buttons?.[buttonType]?.event?.();
		Store.setLoading(false);

		// Базовые переходы по шагам
		if (buttonType === 'cancel') setActive(0);
		if (buttonType === 'prev') setActive(active-1);
		if (buttonType === 'next') setActive(active+1);
	}

	if (!isDisplay) return null;

	return (
		<UIButton
			onClick={handleClick}
			color={Store.config.buttons?.[buttonType]?.color || Enums.ColorDefaultEnum[buttonType]}
			variant={Store.config.buttons?.[buttonType]?.variant || Enums.VariantDefaultEnum[buttonType]}
			disabled={Store.loading || Store.disabled}
			{...props}
		> {Store.config.buttons?.[buttonType]?.name || Enums.NameDefaultEnum[buttonType]} </UIButton>
	);
});
