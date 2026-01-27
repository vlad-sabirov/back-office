import { MultiSelectProps } from '@fsd/shared/ui-kit';
import { IStaffEntity } from '../../staff.entity';

export type ISelectProps = {
	users: IStaffEntity[];
	limit?: number;
	withOrphan?: boolean;
	withPriority?: boolean;
} & Omit<MultiSelectProps, 'mode' | 'data' | 'searchable' | 'clearable' | 'maxSelectedValues'>;
