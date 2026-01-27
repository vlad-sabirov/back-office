import { useContext, useEffect, useRef } from 'react';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { MainContext } from '@globalStore';
import { BodyLayoutProps } from './Body.layout.props';
import css from './Body.layout.module.scss';

export const BodyLayout = observer(({ children, className, ...props }: BodyLayoutProps): JSX.Element => {
	const bodyRef = useRef(null);
	const { templateStore } = useContext(MainContext);

	useEffect(() => {
		if (bodyRef) templateStore.setBodyRef(bodyRef);
	}, [bodyRef, templateStore]);

	return (
		<div className={cn(css.wrapper, className)} {...props} ref={bodyRef}>
			{children}
		</div>
	);
});
