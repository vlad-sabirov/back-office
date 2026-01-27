import { IUserResponse } from '@interfaces/user/UserList.response';
import { MultiSelectProps } from '@fsd/shared/ui-kit';

export type MultiSelectUserProps = {
	data: IUserResponse[];
} & Omit<MultiSelectProps, 'mode' | 'data' | 'searchable' | 'clearable'>;
