import { createContext, FC, useContext, useEffect, useState } from 'react';
import { Stepper as MantineStepper } from '@mantine/core';
import * as Types from '.';
import css from './stepper.module.scss';
import { Button } from './components';
import { StepperStore } from './stepper.store';
import { observer } from 'mobx-react-lite';

const Store = new StepperStore();
export const StoreContext = createContext(Store);

const Component: FC<Types.StepperT> = observer((
	{ steps, activeStep, stepsSpace, skip = true, ...props }
) => {
	const Store = useContext(StoreContext);
	const [active, setActive] = useState<number>(activeStep ? activeStep-1 : 0);
	const [loading, setLoading] = useState<boolean>(false);

	const isCancelButton = active === 0 && (Store.config.buttons?.cancel?.display ?? true);
	const isPrevButton = active !== 0 && (Store.config.buttons?.prev?.display ?? true);
	const isNextButton = active < steps.length-1 && (Store.config.buttons?.next?.display ?? true);
	const isFinishButton = active === steps.length-1 && (Store.config.buttons?.finish?.display ?? true);

	useEffect(() => {
		props.setLoading?.(loading);
		Store.setLoading(loading);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading]);

	useEffect(() => {
		setLoading(props.loading ?? false);
	}, [props.loading]);

	useEffect(() => {
		setLoading(Store.loading ?? false);
	}, [Store.loading]);

	return (
		<div>		
			<MantineStepper
				active={active}
				onStepClick={skip ? setActive : undefined}
				className={css.stepper}
				sx={{
					'.mantine-Stepper-steps': {
						width: stepsSpace ? (steps.length * 40) + 20 + stepsSpace : undefined,
						margin: '20px auto 8px',
					}
				}}
			>
				{!!steps.length && steps.map((step, index) => {
					return (
						<MantineStepper.Step
							key={index}
							icon={index+1}
							completedIcon={index+1}
						> {step} </MantineStepper.Step>
					);
				})}
			</MantineStepper>

			<div className={css.buttons}>
				<Button
					buttonType={'cancel'}
					active={active}
					setActive={setActive}
					isDisplay={isCancelButton}
				/>

				<Button
					buttonType={'prev'}
					active={active}
					setActive={setActive}
					isDisplay={isPrevButton}
				/>

				<Button
					buttonType={'next'}
					active={active}
					setActive={setActive}
					isDisplay={isNextButton}
				/>

				<Button
					buttonType={'finish'}
					active={active}
					setActive={setActive}
					isDisplay={isFinishButton}
				/>
			</div>
		</div>
	);
});

const withHOC = <T extends Record<string, unknown>>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<StoreContext.Provider value={Store}>
				<Component {...props} />
			</StoreContext.Provider>
		);
	};
};

export const Stepper = withHOC(Component);
