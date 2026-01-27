import { useState } from 'react';
import cn from 'classnames';
import TailwindColors from '@config/tailwind/color';
import { Loader, Stepper as MantineStepper } from '@mantine/core';
import { Button } from '..';
import { StepperV1Props } from './props';
import css from './styles.module.scss';

export const StepperV1 = ({
	mode = 'standard',
	steps,
	cancel,
	finish,
	buttons = true,
	loading,
	disabled,
	...props
}: StepperV1Props): JSX.Element => {
	const [stepperPosition, setStepperPosition] = useState(0);
	const prevStepperPosition = () => setStepperPosition((current) => (current > 0 ? current - 1 : current));
	const nextStepperPosition = () => setStepperPosition((current) => (current < steps.length ? current + 1 : current));

	const handleOnSuccess = async () => {
		await steps[stepperPosition].onSuccess?.();
		stepperPosition === steps.length - 1 ? finishFunction() : nextStepperPosition();
	}

	const finishFunction = () => {
		(async function () {
			let findErrors = false;
			for (let i = 0; i < steps.length; ++i) {
				if (typeof steps[i].validation === 'function' && (await steps[i].validation?.())) {
					setStepperPosition(i);
					findErrors = true;
				}
			}
			if (!findErrors) finish?.onChange?.();
		})();
	};

	const cancelFunction = () => {
		cancel?.onChange?.();
	};

	return (
		<div style={{ position: 'relative' }}>
			{loading && (
				<div className={css.loading}>
					<Loader size="xl" variant="bars" color={TailwindColors.primary.main} />
				</div>
			)}

			<MantineStepper
				active={stepperPosition}
				onStepClick={setStepperPosition}
				className={cn(css.root, { [css.disabled]: disabled || loading })}
				{...props}
				sx={{
					'.mantine-Stepper-steps': {
						width: steps.length * 80,
						margin: '20px auto 8px',
					}
				}}
			>
				{steps.map((step, index) => {					
					return (
						<MantineStepper.Step
							key={'stepper_' + index}
							allowStepSelect={mode === 'edit' || stepperPosition > index}
							icon={<>{index + 1}</>}
							completedIcon={<>{index + 1}</>}
							className={css.wrapper}
						>
							{step.display}
						</MantineStepper.Step>
					)
				})}
			</MantineStepper>

			{buttons && (
				<div className={css.buttons}>
					<div />
					<div className={css.buttonPrev}>
						<Button
							color="neutral"
							variant="easy"
							onClick={() => {
								stepperPosition === 0 ? cancelFunction() : prevStepperPosition();
							}}
							disabled={disabled || loading}
						>
							{stepperPosition !== 0 ? 'Назад' : cancel?.buttonName ? cancel.buttonName : 'Отмена'}
						</Button>
					</div>

					<div className={css.buttonNext}>
						<Button
							color={stepperPosition === steps.length - 1 ? 'success' : 'primary'}
							variant="hard"
							onClick={async () => {
								if (
									typeof steps[stepperPosition].validation === 'function' &&
									(await steps[stepperPosition].validation?.())
								)
									return;

								if (steps[stepperPosition].onSuccess) {
									handleOnSuccess();
									return;
								}

								stepperPosition === steps.length - 1 ? finishFunction() : nextStepperPosition();
							}}
							disabled={disabled || loading}
						>
							{stepperPosition !== steps.length - 1
								? 'Далее'
								: finish?.buttonName
								? finish.buttonName
								: 'Завершить'}
						</Button>
					</div>

					{mode === 'edit' && stepperPosition !== steps.length - 1 && (
						<div className={css.buttonSave}>
							<Button
								color="success"
								variant="hard"
								onClick={async () => {
									if (
										typeof steps[stepperPosition].validation === 'function' &&
										(await steps[stepperPosition].validation?.())
									)
										return;

									finishFunction();
								}}
								disabled={disabled || loading}
							>
								{finish?.buttonName ? finish.buttonName : 'Сохранить'}
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
