import { FC, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import { format, parseISO } from 'date-fns';
import { uniq } from 'lodash';
import { useCrmCardShowContact, useCrmCardShowOrganization } from '@fsd/entities/crm-card';
import { CrmContactService } from '@fsd/entities/crm-contact';
import { EnCrmHistoryTypes, ICrmHistoryEntity } from '@fsd/entities/crm-history';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { IStaffVoip } from '@fsd/entities/staff';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { AvatarGroup, Icon, TextField } from '@fsd/shared/ui-kit';
import { AudioPlayer } from '@fsd/shared/ui-kit/audio-player';
import { parsePhoneNumber } from '@helpers';
import css from './log.module.scss';

interface IProps {
	history: ICrmHistoryEntity;
	className?: string;
}

interface INotUsers {
	type: 'organization' | 'contact' | 'number';
	id: string | number | null;
	name: string;
}

export const Call: FC<IProps> = ({ history, className }) => {
	const staff = useStateSelector((state) => state.staff.data.voip);
	const date = useMemo(() => {
		return format(parseISO(history.createdAt), 'dd MMMM yyyy (HH:mm)', { locale: dateFnsLocaleRu });
	}, [history.createdAt]);
	const [searchOrg] = CrmOrganizationService.search();
	const [searchCont] = CrmContactService.search();
	const showOrg = useCrmCardShowOrganization();
	const showCont = useCrmCardShowContact();

	const callers = useMemo<string[]>(() => {
		if (history.type != EnCrmHistoryTypes.Call) return [];
		const callers: string[] = [];
		// if (history.payload.call_type == 'p2p' && !history.payload.queue) {
		// 	callers.push(history.payload.caller);
		// 	callers.push(history.payload.receiver);
		// }

		if (history.payload.call_type == 'p2p') {
			for (const stage of history.payload.stages) {
				if (!stage.file) continue;
				callers.push(stage.caller);
				callers.push(stage.receiver);
			}
		}

		if (history.payload.call_type == 'conference') {
			for (const user of history.payload.stages) {
				callers.push(user.caller);
			}
		}

		return callers;
	}, [history]);

	const users = useMemo<IStaffVoip[]>(() => {
		if (history.type != EnCrmHistoryTypes.Call) return [];

		return uniq(
			callers.reduce((acc: IStaffVoip[], caller: string) => {
				if (staff[caller]) acc.push(staff[caller]);
				return acc;
			}, [])
		);
	}, [callers, history.type, staff]);

	const [notUsers, setNotUsers] = useState<INotUsers[]>([]);
	useEffect(() => {
		(async () => {
			setNotUsers([]);
			const phones = uniq(
				callers.reduce((acc: string[], caller: string) => {
					if (!staff[caller]) acc.push(caller);
					return acc;
				}, [])
			);

			const output: INotUsers[] = [];

			for (const phone of phones) {
				let found = false;
				const rOrg = await searchOrg({ search: phone });
				if (rOrg?.data?.data?.length) {
					found = true;
					output.push({
						type: 'organization',
						name: `${rOrg.data.data[0].nameEn} (${rOrg.data.data[0].nameRu})`,
						id: rOrg.data.data[0].id,
					});
				}

				const rCont = await searchCont({ search: phone });
				if (rCont?.data?.data?.length) {
					found = true;
					output.push({ type: 'contact', name: rCont.data.data[0].name, id: rCont.data.data[0].id });
				}

				if (!found) {
					output.push({ type: 'number', name: parsePhoneNumber(phone).output, id: null });
				}

				setNotUsers(output);
			}
		})();
	}, [callers, searchCont, searchOrg, staff]);

	if (history.type != EnCrmHistoryTypes.Call) return null;
	return (
		<div className={cn(css.root, className)}>
			<AvatarGroup
				data={users.map((user) => ({
					color: user.color,
					text: `${user.initial}`,
					src: user.photo,
				}))}
				size={'small'}
				className={css.avatar}
				limit={users.length}
				topPosition={'left'}
			/>
			<TextField className={css.date} size={'small'}>
				{date}
			</TextField>
			<div>
				{history.payload.call_type === 'p2p' && history.payload.is_answered && (
					<TextField className={css.log} size={'small'}>
						Звонок
					</TextField>
				)}
				{history.payload.call_type === 'p2p' && !history.payload.is_answered && (
					<TextField className={css.log} size={'small'}>
						Звонок пропущен <Icon name={'call-hangup'} className={css.notAnswered} />
					</TextField>
				)}
				{history.payload.call_type === 'conference' && (
					<TextField className={css.log} size={'small'}>
						Конференция
					</TextField>
				)}

				{!!notUsers.length && (
					<TextField className={css.log} size={'small'}>
						{notUsers.map((person, i) => {
							return (
								<span key={`${person.name}`}>
									{i != 0 && <>,&nbsp;&nbsp;</>}
									<span
										className={css.personFound}
										onClick={() => {
											if (!person.id) return;
											if (person.type === 'organization') showOrg({ id: person.id });
											if (person.type === 'contact') showCont({ id: person.id });
										}}
									>
										{person.name}
									</span>
								</span>
							);
						})}
					</TextField>
				)}

				<AudioPlayer src={history.payload.file} className={css.audio} />
			</div>
		</div>
	);
};
