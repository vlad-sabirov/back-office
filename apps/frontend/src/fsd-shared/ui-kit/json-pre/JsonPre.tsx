import { FC } from 'react';
import { JsonPreProps } from '.';
import css from './json-pre.module.scss';

export const JsonPre: FC<JsonPreProps> = ({ data }) => {
	return process.env.NODE_ENV === 'development' && data && JSON.stringify(data) !== '{}' ? (
		<pre className={css.wrapper}>{JSON.stringify(data, null, 2)}</pre>
	) : (
		<></>
	);
};
