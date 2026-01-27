import { FC, useCallback } from 'react';
import { IMissedProps } from './missed.types';
import cn from 'classnames';
import { format, parseISO } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { useCrmCardShowContact, useCrmCardShowOrganization } from '@fsd/entities/crm-card';
import { CallTo, VoipService, useVoipActions } from '@fsd/entities/voip';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Icon, TextField } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import css from './missed.module.scss';

export const MissedCalls: FC<IMissedProps> = (props) => {
	const { missedCalls, isShowPopover, className } = props;
	const [fetchCheck] = VoipService.missingCallCheck();
	const voipActions = useVoipActions();
	const isFetching = useStateSelector((state) => state.voip.isFetching);
	const showOrg = useCrmCardShowOrganization();
	const showCont = useCrmCardShowContact();

	const handleCheck = useCallback(
		async (uuid: string) => {
			voipActions.setIsFetching(true);
			await fetchCheck({ uuid });
			voipActions.refresh('missed');
			voipActions.setIsFetching(false);
		},
		[fetchCheck, voipActions]
	);

	if (!missedCalls.length) return null;
	return (
		<div
			className={cn(
				css.wrapper,
				{
					[css.wrapper__disabled]: isFetching,
				},
				className
			)}
		>
			{missedCalls.map((call) => {
				return (
					<div key={call.timestamp} className={css.item}>
						<Icon name={'call-missed'} className={css.callIcon} />

						<div>
							{call.callerName && (
								<TextField
									className={cn(css.callerName, {
										[css.pointer]: call.type === 'contact' || call.type === 'organization',
									})}
									size={'small'}
									onClick={() => {
										if (call.type === 'organization' && call.id) {
											showOrg({ id: call.id });
											isShowPopover(false);
										}
										if (call.type === 'contact' && call.id) {
											showCont({ id: call.id });
											isShowPopover(false);
										}
									}}
								>
									{call.callerName}
								</TextField>
							)}
							{call.callerPhone && (
								<CallTo callToPhone={call.callerPhone} callToName={call.callerName} offset={-2}>
									<TextField className={cn(css.callerName, css.pointer)} size={'small'}>
										{parsePhoneNumber(call.callerPhone).output}
									</TextField>
								</CallTo>
							)}
							<TextField className={css.callerDate} size={'small'}>
								{format(parseISO(call.timestamp), 'dd MMMM yyyy, HH:mm', { locale: customLocaleRu })}
							</TextField>
						</div>

						<Icon name={'close-small'} className={css.callClose} onClick={() => handleCheck(call.uuid)} />
					</div>
				);
			})}
		</div>
	);
};
