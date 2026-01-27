export interface ITaskEntity {
	id: string;
	is_done: boolean;
	user_id: number;
	name: string;
	description: string;
	due_date: string;
	assignee_id: number;
	organization_id: number;
	contact_id: number;
	send_notification_to_telegram: boolean;
	created_at: string;
	updated_at: string;
}
