import { AuthFirstLogin } from './firstLogin/auth-first-login';
import { AuthLayoutStopOne } from './steps/StepOne';
import { AuthLayoutStopThree } from './steps/StepThree';
import { AuthLayoutStopTwo } from './steps/StepTwo';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useClient } from '@fsd/shared/lib/hooks/use-client/use-client';
import { Alert, Icon } from '@fsd/shared/ui-kit';
import LogoSvg from '../../../public/img/logo_full.svg';
import css from './Styles.module.scss';

export const AuthLayout = observer((): JSX.Element => {
	const step = useStateSelector((state) => state.app.auth.step);
	const { skipLateness } = useClient();

	return (
		<div className={css.wrapper}>
			<div className={css.bgImg}></div>
			<div className={css.info}>
				{skipLateness && (
					<Alert
						title={'Не учитывается'}
						body={
							'Авторизация с этого устройства не будет учитываться в табеле опозданий. ' +
							'Авторизуйтесь с рабочего компьютера.'
						}
						variant={'filled'}
						color={'warning'}
						icon={<Icon name={'alert'} />}
					/>
				)}
			</div>
			<div
				className={cn(css.form, {
					[css.form__firstLogin]: step === 42,
				})}
			>
				<LogoSvg alt="Логотип Back Office" draggable="false" className={css.logo} />

				<div className={css.stepWrapper}>
					{step === 1 ? <AuthLayoutStopOne /> : null}
					{step === 2 ? <AuthLayoutStopTwo /> : null}
					{step === 3 ? <AuthLayoutStopThree /> : null}
					{step === 42 ? <AuthFirstLogin /> : null}
				</div>
			</div>
		</div>
	);
});
