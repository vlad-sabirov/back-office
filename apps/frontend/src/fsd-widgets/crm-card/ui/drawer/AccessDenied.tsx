import { FC } from "react";
import { TextField } from "@fsd/shared/ui-kit";
import css from './drawer.module.scss';

export const AccessDenied: FC = () => {
	return (
		<div className={css.accessDenied}>
			<TextField className={css.accessDenied__title}>Для Вас доступ к этой информации закрыт</TextField>
		</div>
	);
}
