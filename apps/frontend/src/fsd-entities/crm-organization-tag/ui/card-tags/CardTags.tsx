import { FC } from "react";
import { ICardTagsProps } from "./card-tags.props";
import { TextField } from "@fsd/shared/ui-kit";
import css from './card-tags.module.scss';

export const CardTags: FC<ICardTagsProps> = (
	{ tags }
) => {

	if (!tags || !tags.length) return null;

	if (tags.length === 1) {
		return (
			<TextField className={css.once}>
				Тег: {' '}
				<span>{tags[0].name}</span>
			</TextField>
		);
	}

	return (
		<div className={css.many}>
			<TextField className={css.manyTitle}>Теги:</TextField>
			<TextField className={css.manyItems}>
				{tags.map((tag, index) => (
					<span key={tag.id}>
						{index !== 0 && ', '}
						{tag.name}
					</span>
				))}
			</TextField>
		</div>
	);
}
