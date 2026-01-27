import { FC } from 'react';
import cn from 'classnames';
import { Avatar, AvatarGroup, Skeleton, TextField } from '@fsd/shared/ui-kit';
import { ItemProps } from './item.props';
import css from './item.module.scss';

export const Item: FC<ItemProps> = ({ data, title, subtitle, displayTime, onClick, className, ...props }) => {
	return data.length ? (
		<div className={cn(css.root, className)} {...props} onClick={onClick}>
			<TextField mode={'heading'} size={'small'} className={'title'}>
				{title}
			</TextField>

			<TextField size={'small'} className={css.subtitle}>
				{subtitle}
			</TextField>

			<div className={css.staff}>
				<Avatar
					color={data[0].user.color}
					text={`${data[0].user.lastName[0]}${data[0].user.firstName[0]}`}
					src={data[0].user.photo}
					size={'small'}
				/>

				<div>
					<TextField className={css.staff__name}>
						{data[0].user.lastName} {data[0].user.firstName}
					</TextField>

					<TextField size={'small'} className={css.staff__description}>
						{displayTime}
					</TextField>
				</div>
			</div>

			<AvatarGroup
				data={data.map((item) => ({
					color: item.user.color,
					text: `${item.user.lastName[0]}${item.user.firstName[0]}`,
					src: item.user.photo,
				}))}
				limit={2}
				size={'small'}
				className={css.avatarGroup}
			/>
		</div>
	) : (
		<div className={cn(css.skeleton, className)} {...props}>
			<Skeleton rounded={'large'} width={200} height={30} className={css.skeleton__title} />
			<Skeleton rounded={'large'} width={250} height={16} className={css.skeleton__subtitle} />
			<div className={css.skeleton__staff}>
				<Skeleton rounded={'circle'} width={40} height={40} className={css.skeleton__description} />
				<div>
					<Skeleton rounded={'large'} width={120} height={16} />
					<Skeleton rounded={'large'} width={120} height={12} />
				</div>
			</div>
			<Skeleton rounded={'circle'} width={40} height={40} className={css.skeleton__avatarGroup} />
		</div>
	);
};
