import { FC, useMemo } from "react";
import { Tabs } from "@fsd/shared/ui-kit";
import { IActionsProps, IActionsTab } from "./actions.props";
import { CommentList, CommentPanel } from "./comment/Comment";
import { TaskList, TaskPanel } from "./task/Task";
import { CalendarEventList, CalendarEventPanel } from "./calendar-event";
import { OrgNotes } from '@fsd/features/crm-organization-card-info/ui/notes/Notes';
import css from './actions.module.scss';
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Skeleton } from "./skeleton/Skeleton";

const tabs: IActionsTab[] = [
	{
		list: { type: CommentList, props: { index: 'comment' }, key: null },
		panel: { type: CommentPanel, props: { index: 'comment' }, key: null },
	},
	{
		list: { type: TaskList, props: { index: 'task' }, key: null  },
		panel: { type: TaskPanel, props: { index: 'task' }, key: null  },
	},
	{
		list: { type: CalendarEventList, props: { index: 'event' }, key: null },
		panel: { type: CalendarEventPanel, props: { index: 'event' }, key: null },
	},
]

export const Actions: FC<IActionsProps> = () => {
	const isLoading = useStateSelector((state) => state.crm_card.isLoading);
	const firstTab = useMemo(() => tabs.find((tab) => !tab.list.props.disabled), []);
	
	if (isLoading) {
		return <Skeleton />;
	}
	
	return (
		<div className={css.wrapper}>
		<OrgNotes />
		<Tabs
			defaultValue={firstTab?.list.props.index}
		>
			<Tabs.List>
				{tabs.map((tab) => {
					const { type: List, props } = tab.list;
					return <List key={props.index} {...props} />;
				})}
			</Tabs.List>

			{tabs.map((tab) => {
				const { type: Panel, props } = tab.panel;
				return <Panel key={props.index} {...props} />;
			})}
		</Tabs>
		</div>
	);
}
