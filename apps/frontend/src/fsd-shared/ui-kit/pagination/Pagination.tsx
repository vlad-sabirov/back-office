import { FC, useMemo } from 'react';
import cn from 'classnames';
import { Button, Icon, Menu, TextField } from '@fsd/shared/ui-kit';
import { usePagination } from '@mantine/hooks';
import { PaginationT } from '.';
import css from './pagination.module.scss';

export const Pagination: FC<PaginationT> = ({
	page,
	total,
	limit,
	onChangePage,
	onChangeLimit,
	siblings = 2,
	limitSelect,
	className,
	...props
}) => {
	const calc = useMemo(() => {
		const showStart = (page - 1) * limit + 1;
		const showEnd = page * limit > total ? total : page * limit;
		const pages = Math.ceil(total / limit);

		return {
			showStart,
			showEnd,
			pages,
		};
	}, [total, limit, page]);
	const { active, range } = usePagination({ page, total: calc.pages, siblings });

	const handleChangeLimit = (limit: number) => {
		onChangeLimit(limit);
		if (page > Math.ceil(total / limit)) {
			onChangePage(Math.ceil(total / limit));
		}
	};

	return (
		<div className={cn(css.wrapper, className)} {...props}>
			<div className={css.pagination}>
				{calc.pages > 1 &&
					range.map((pageNumber, index) => (
						<Button
							key={pageNumber === 'dots' ? `dots${index}` : pageNumber}
							size={'small'}
							className={css.paginationButton}
							onClick={() => {
								if (typeof pageNumber === 'number') {
									onChangePage(pageNumber);
								}
							}}
							disabled={active === pageNumber || pageNumber === 'dots'}
						>
							{pageNumber === 'dots' ? '...' : pageNumber}
						</Button>
					))}
			</div>

			{!!total && (
				<div className={css.limit}>
					<TextField size={'small'} className={css.limitInfo}>
						{calc.showStart}-{calc.showEnd} / {total}
					</TextField>

					<Menu
						width={50}
						control={
							<div>
								<Button size={'small'} className={css.limitButton}>
									{' '}
									<Icon name={'arrow-medium'} /> {limit}{' '}
								</Button>
							</div>
						}
					>
						{limitSelect ? (
							limitSelect.map((limit) => (
								<Menu.Item onClick={() => handleChangeLimit(limit)} key={limit}>
									{limit}
								</Menu.Item>
							))
						) : (
							<>
								<Menu.Item onClick={() => handleChangeLimit(10)}>10</Menu.Item>
								<Menu.Item onClick={() => handleChangeLimit(25)}>25</Menu.Item>
								<Menu.Item onClick={() => handleChangeLimit(50)}>50</Menu.Item>
								<Menu.Item onClick={() => handleChangeLimit(100)}>100</Menu.Item>
							</>
						)}
					</Menu>
				</div>
			)}
		</div>
	);
};
