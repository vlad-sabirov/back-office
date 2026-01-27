import { FC } from 'react';
import { Grid } from '@mantine/core';
import { MockProps } from './props';

export const Mock: FC<MockProps> = ({ count }) => {
	const span = Math.round(100 / count);
	return (
		<>
			{[...Array(count)].map((x, i) => {
				const color = Math.floor(Math.random() * 16777215).toString(16);
				return (
					<Grid.Col
						key={i}
						span={span}
						style={{ backgroundColor: `#${color}`, minHeight: '160px' }}
					></Grid.Col>
				);
			})}
		</>
	);
};
