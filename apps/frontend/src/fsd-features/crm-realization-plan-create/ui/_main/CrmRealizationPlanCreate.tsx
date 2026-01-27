import { FC, FormEvent, useCallback, useMemo } from 'react';
import { useCrmRealizationActionsPage } from '@fsd/pages/crm-report-realization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Modal } from '@fsd/shared/ui-kit';
import { showNotification } from '@mantine/notifications';
import { useCreatePlan } from '../../libs';
import { DatePicker } from '../date-picker/DatePicker';
import { FormPlan } from '../form-plan/FormPlan';
import css from './crm-realization-plan-create.module.scss';

export const CrmRealizationPlanCreate: FC = () => {
	const isShowModal = useStateSelector((state) => state.crm_realization_page.modals.planCreate);
	const isFetching = useStateSelector((state) => state.crm_realization_page.isFetching);
	const errors = useStateSelector((state) => state.crm_realization_page.errors.planCreate);
	const actions = useCrmRealizationActionsPage();
	const createPlan = useCreatePlan();
	const isError = useMemo<boolean>(() => {
		const errorDate = !!errors.date;
		const errorTeams = Boolean(errors.teams && Object.values(errors.teams).filter((val) => !!val).length);
		const errorEmployees = Boolean(
			errors.employees && Object.values(errors.employees).filter((val) => !!val).length
		);
		return errorDate || errorTeams || errorEmployees;
	}, [errors]);

	const handleModalClose = useCallback(() => {
		actions.setModal(['planCreate', false]);
		actions.setClearPlanCreate();
	}, [actions]);

	const handleCreate = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!(await createPlan())) {
				return;
			}

			showNotification({
				color: 'green',
				message: 'План добавлен',
			});

			handleModalClose();
		},
		[createPlan, handleModalClose]
	);

	return (
		<Modal
			title={'Добавление плана продаж'}
			opened={isShowModal}
			onClose={handleModalClose}
			loading={isFetching}
			size={600}
		>
			<form onSubmit={handleCreate}>
				<div className={css.form}>
					<DatePicker />
					<FormPlan />
				</div>

				<Modal.Buttons>
					<Button onClick={handleModalClose}> Отмена </Button>

					<Button color={'primary'} variant={'hard'} type={'submit'} disabled={isError}>
						{' '}
						Сохранить{' '}
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
};
