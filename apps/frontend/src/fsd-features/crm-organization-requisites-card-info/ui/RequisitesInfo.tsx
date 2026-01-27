import { FC } from "react";
import { TextField } from "@fsd/shared/ui-kit";
import { IRequisitesInfoProps } from "./requisites-info.props";
import css from './requisites-info.module.scss';

export const RequisitesInfo: FC<IRequisitesInfoProps> = (
	{ requisites }
) => {
	
	return (
		<div className={css.wrapper}>
			<TextField mode={'heading'} size={'small'}>
				Реквизиты
			</TextField>

			<div className={css.requisites}>
				{requisites && !!requisites.length && requisites.map((requisite) => (
					<div key={requisite.id} className={css.contact}>
						<TextField className={css.name}>
							{requisite.name}
						</TextField>

						<TextField className={css.inn}>
							ИНН: <span>{requisite.inn}</span>
						</TextField>

						<TextField className={css.action}>
							изменить
						</TextField>
					</div>
				))}
			</div>

			<TextField className={css.add}>Добавить</TextField>
		</div>
	);
}
