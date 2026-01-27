import { FC, useMemo } from 'react';
import { Conference } from './ui/Conference';
import { P2P } from './ui/P2P';
import { ICallersProps } from '@fsd/entities/voip/ui/calls/caller.types';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Dialpad } from '../../ui/dialpad/Dialpad';
import { MeP2P } from '../../ui/me-p2p/MeP2P';
import { MeConference } from '../me-conference/MeConference';
import { MissedCalls } from '../missed/Missed';
import css from './callers.module.scss';

export const Callers: FC<ICallersProps> = (props) => {
	const { isShowPopover } = props;

	const callEvents = useStateSelector((state) => state.voip.data.events);
	const myCallEvent = useStateSelector((state) => state.voip.data.my);
	const missedCalls = useStateSelector((state) => state.voip.data.missed);

	const events = useMemo(
		() => callEvents.filter((event) => myCallEvent?.uuid !== event.uuid),
		[callEvents, myCallEvent?.uuid]
	);

	return (
		<div className={css.root}>
			{myCallEvent == null ? (
				<Dialpad />
			) : myCallEvent.type === 'conference' ? (
				<MeConference event={myCallEvent} isShowPopover={isShowPopover} />
			) : (
				<MeP2P event={myCallEvent} isShowPopover={isShowPopover} />
			)}
			{!!events.length && <div className={css.hr} />}
			{events?.map((caller) =>
				caller.type === 'conference' ? (
					<Conference key={caller.uuid} call={caller} />
				) : (
					<P2P key={caller.uuid} call={caller} />
				)
			)}
			{missedCalls.length > 0 && (
				<>
					<div className={css.hr} />
					<MissedCalls missedCalls={missedCalls} isShowPopover={isShowPopover} />
				</>
			)}
		</div>
	);
};
