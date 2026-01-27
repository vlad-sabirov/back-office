import { createContext, useContext } from 'react';
import Store from './auth.first.login.store';
import StepFour from './steps/four';
import StepOne from './steps/one';
import StepThree from './steps/three';
import StepTwo from './steps/two';
import { observer } from 'mobx-react-lite';

export const Context = createContext({ store: new Store() });

const Display = observer((): JSX.Element => {
	const { store } = useContext(Context);
	return (
		<>
			{store.step === 1 && <StepOne />}
			{store.step === 2 && <StepTwo />}
			{store.step === 3 && <StepThree />}
			{store.step === 4 && <StepFour />}
		</>
	);
});

export const AuthFirstLogin = (): JSX.Element => (
	<Context.Provider value={{ store: new Store() }}>
		<Display />
	</Context.Provider>
);
