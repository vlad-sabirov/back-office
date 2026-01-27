import { ForwardedRef, forwardRef } from 'react';
import Link from 'next/link';
import { NextLinkProps } from '@fsd/shared/ui-kit';

export const NextLink = forwardRef((props: NextLinkProps, ref: ForwardedRef<HTMLAnchorElement>): JSX.Element => {
	return (
		<Link href={props.href ? (props.href as string) : '#'}>
			<a {...props} ref={ref} />
		</Link>
	);
});

NextLink.displayName = 'NextLink';
