import { FC, useMemo } from "react";
import { capitalize } from "lodash";
import { TextField } from "@fsd/shared/ui-kit";
import { ICardTypeProps } from "./card-type.props";
import css from './card-type.module.scss';

export const CardType: FC<ICardTypeProps> = (
	{ type }
) => {
	const typeName = useMemo(() => {
		if (!type) return 'Другое';
		return capitalize(type.name);
	}, [type]);

	return (
		<TextField className={css.type}>
			Сфера деятельности: <span>{typeName}</span>
		</TextField>
	);
}
