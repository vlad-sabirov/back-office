import { useMemo, useState } from 'react';
import { Parent } from './parts/parent/Parent';
import { useRouter } from 'next/router';
import { Accordion } from '@mantine/core';
import { data } from '../../config/navigation.data';

export const Navigation = () => {
	const [value, setValue] = useState<string | null>(null);
	const { route } = useRouter();
	const activePage = useMemo(() => {
		for (const parent of data) {
			if (parent.route === '/') {
				continue;
			}
			if (route.includes(parent.route || '!!!')) {
				return parent.alias;
			}
		}
		return undefined;
	}, [route]);

	return (
		<Accordion variant={'filled'} defaultValue={activePage} value={value} onChange={setValue}>
			{data.map((item) => (
				<Parent data={item} key={item.alias} active={value} />
			))}
		</Accordion>
	);
};
