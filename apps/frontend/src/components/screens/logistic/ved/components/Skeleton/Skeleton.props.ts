import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface SkeletonProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	view: 'kanban' | 'list';
}
