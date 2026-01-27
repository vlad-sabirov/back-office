import { FC, useMemo } from 'react';
import { Queues } from '@fsd/entities/voip/config/queues';
import { ICallerProps } from '@fsd/entities/voip/ui/calls/caller.types';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Icon, TextField } from '@fsd/shared/ui-kit';
import css from '../callers.module.scss';

export const Queue: FC<ICallerProps> = (props) => {
	const { call } = props;

	const caller = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return call.users.find((user) => user.role == 'caller')!;
	}, [call]);

	return (
		<div className={css.call}>
			<div className={css.queueIcon}>
				<Icon name={'call-phone'} />
			</div>

			<div>
				<TextField size={'small'} className={css.conference}>
					{parsePhoneNumber(caller.caller).output}
				</TextField>

				<TextField size={'small'} className={css.user}>
					Звонок в {Queues.toList[call.queue]}
				</TextField>
			</div>
		</div>
	);
};
