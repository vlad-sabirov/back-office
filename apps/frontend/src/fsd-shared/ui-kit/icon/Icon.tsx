import AlarmIcon from './svg/alarm.svg';
import AlertIcon from './svg/alert.svg';
import AnalyticsIcon from './svg/analytics.svg';
import ArrowLargeIcon from './svg/arrow-large.svg';
import ArrowMediumIcon from './svg/arrow-medium.svg';
import ArrowSmallIcon from './svg/arrow-small.svg';
import ArrowTwoLargeIcon from './svg/arrow-two-large.svg';
import ArrowTwoMediumIcon from './svg/arrow-two-medium.svg';
import ArrowTwoSmallIcon from './svg/arrow-two-small.svg';
import BackFIcon from './svg/back-f.svg';
import BatteryEmptyIcon from './svg/battery-empty.svg';
import BatteryFullIcon from './svg/battery-full.svg';
import BatteryLowIcon from './svg/battery-low.svg';
import BatteryMediumIcon from './svg/battery-medium.svg';
import ButtonIcon from './svg/button.svg';
import CalendarIcon from './svg/calendar.svg';
import CallAnsweredIcon from './svg/call-answered.svg';
import CallDurationIcon from './svg/call-duration.svg';
import CallHangupIcon from './svg/call-hangup.svg';
import CallKeyboardIcon from './svg/call-keyboard.svg';
import CallMissedIcon from './svg/call-missed.svg';
import CallMobileIcon from './svg/call-mobile.svg';
import CallPhoneIcon from './svg/call-phone.svg';
import CallRedirectIcon from './svg/call-redirect.svg';
import CheckboxIcon from './svg/checkbox.svg';
import ChipIcon from './svg/chip.svg';
import CloseLargeIcon from './svg/close-large.svg';
import CloseMediumIcon from './svg/close-medium.svg';
import CloseSmallIcon from './svg/close-small.svg';
import CmdIcon from './svg/cmd.svg';
import CommentIcon from './svg/comment.svg';
import ContentBlockIcon from './svg/content-block.svg';
import CrmFilterAllIcon from './svg/crm-filter-all.svg';
import CrmFilterArchiveIcon from './svg/crm-filter-archive.svg';
import CrmFilterFreedomIcon from './svg/crm-filter-freedom.svg';
import CrmFilterMyIcon from './svg/crm-filter-my.svg';
import CrmFilterNewIcon from './svg/crm-filter-new.svg';
import CrmFilterPriorityIcon from './svg/crm-filter-priority.svg';
import CrmFilterUnverifiedIcon from './svg/crm-filter-unverified.svg';
import CrmIcon from './svg/crm.svg';
import DashboardFillIcon from './svg/dashboard-f.svg';
import DashboardIcon from './svg/dashboard.svg';
import DotsEightIcon from './svg/dots-eight.svg';
import DotsThreeIcon from './svg/dots-three.svg';
import DownloadIcon from './svg/download.svg';
import DrawerIcon from './svg/drawer.svg';
import EditIcon from './svg/edit.svg';
import EraseIcon from './svg/erase.svg';
import ExcelIcon from './svg/excel.svg';
import EyeIcon from './svg/eye.svg';
import FacebookIcon from './svg/facebook.svg';
import FemaleIcon from './svg/female.svg';
import FilterCleanIcon from './svg/filter-clean.svg';
import FilterIcon from './svg/filter.svg';
import FiredIcon from './svg/fired.svg';
import HistoryIcon from './svg/history.svg';
import IconsIcon from './svg/icons.svg';
import InformationFillIcon from './svg/information-f.svg';
import InformationIcon from './svg/information.svg';
import InputNumberIcon from './svg/input-number.svg';
import InputOTPIcon from './svg/input-otp.svg';
import InputIcon from './svg/input.svg';
import InstagramIcon from './svg/instagram.svg';
import LinkIcon from './svg/link.svg';
import LogisticsIcon from './svg/logistics.svg';
import LogoutIcon from './svg/logout.svg';
import MailFillIcon from './svg/mail-f.svg';
import MailIcon from './svg/mail.svg';
import MaleIcon from './svg/male.svg';
import MicrophoneOffIcon from './svg/microphone-off.svg';
import ModalIcon from './svg/modal.svg';
import OpenIcon from './svg/open.svg';
import PasswordIcon from './svg/password.svg';
import PauseIcon from './svg/pause.svg';
import PhoneFillIcon from './svg/phone-f.svg';
import PhoneIcon from './svg/phone.svg';
import PlayIcon from './svg/play.svg';
import PlusLargeIcon from './svg/plus-large.svg';
import PlusMediumIcon from './svg/plus-medium.svg';
import PlusSmallIcon from './svg/plus-small.svg';
import RadioButtonIcon from './svg/radio-button.svg';
import RealizationEmployeeIcon from './svg/realization-employee.svg';
import RealizationTeamIcon from './svg/realization-team.svg';
import RefreshIcon from './svg/refresh.svg';
import SearchIcon from './svg/search.svg';
import SegmentControlIcon from './svg/segment-control.svg';
import SelectIcon from './svg/select.svg';
import SettingsIcon from './svg/settings.svg';
import ShareIcon from './svg/share.svg';
import SliderIcon from './svg/slider.svg';
import StepperIcon from './svg/stepper.svg';
import SwitcherIcon from './svg/switcher.svg';
import TableIcon from './svg/table.svg';
import TelegramIcon from './svg/telegram.svg';
import TextIcon from './svg/text.svg';
import TimeCleanIcon from './svg/time-clean.svg';
import TimeIcon from './svg/time.svg';
import TodoIcon from './svg/todo.svg';
import TrashIcon from './svg/trash.svg';
import UploadCircleIcon from './svg/upload-circle.svg';
import UploadIcon from './svg/upload.svg';
import UserAddIcon from './svg/user-add.svg';
import UserIcon from './svg/user.svg';
import UsersBoldIcon from './svg/users-bold.svg';
import UsersSingletonIcon from './svg/users-singleton.svg';
import UsersIcon from './svg/users.svg';
import WarehouseFillIcon from './svg/warehouse-f.svg';
import WarehouseIcon from './svg/warehouse.svg';
import cn from 'classnames';
import { IconProps } from './Icon.props';
import css from './Styles.module.scss';

const IconsArray = ({ name, className, ...props }: IconProps): JSX.Element => {
	if (name === 'alarm') {
		return <AlarmIcon className={className} {...props} />;
	}

	if (name === 'alert') {
		return <AlertIcon className={className} {...props} />;
	}

	if (name === 'analytics') {
		return <AnalyticsIcon className={className} {...props} />;
	}

	if (name === 'arrow-small') {
		return <ArrowSmallIcon className={className} {...props} />;
	}

	if (name === 'arrow-medium') {
		return <ArrowMediumIcon className={className} {...props} />;
	}

	if (name === 'arrow-large') {
		return <ArrowLargeIcon className={className} {...props} />;
	}

	if (name === 'arrow-two-small') {
		return <ArrowTwoSmallIcon className={className} {...props} />;
	}

	if (name === 'back-f') {
		return <BackFIcon className={className} {...props} />;
	}

	if (name === 'battery-empty') {
		return <BatteryEmptyIcon className={className} {...props} />;
	}

	if (name === 'battery-full') {
		return <BatteryFullIcon className={className} {...props} />;
	}

	if (name === 'battery-low') {
		return <BatteryLowIcon className={className} {...props} />;
	}

	if (name === 'battery-medium') {
		return <BatteryMediumIcon className={className} {...props} />;
	}

	if (name === 'arrow-two-medium') {
		return <ArrowTwoMediumIcon className={className} {...props} />;
	}

	if (name === 'arrow-two-large') {
		return <ArrowTwoLargeIcon className={className} {...props} />;
	}

	if (name === 'calendar') {
		return <CalendarIcon className={className} {...props} />;
	}

	if (name === 'call-answered') {
		return <CallAnsweredIcon className={className} {...props} />;
	}

	if (name === 'call-duration') {
		return <CallDurationIcon className={className} {...props} />;
	}

	if (name === 'call-hangup') {
		return <CallHangupIcon className={className} {...props} />;
	}

	if (name === 'call-keyboard') {
		return <CallKeyboardIcon className={className} {...props} />;
	}

	if (name === 'call-missed') {
		return <CallMissedIcon className={className} {...props} />;
	}

	if (name === 'call-mobile') {
		return <CallMobileIcon className={className} {...props} />;
	}

	if (name === 'call-phone') {
		return <CallPhoneIcon className={className} {...props} />;
	}

	if (name === 'call-redirect') {
		return <CallRedirectIcon className={className} {...props} />;
	}

	if (name === 'chip') {
		return <ChipIcon className={className} {...props} />;
	}

	if (name === 'close-small') {
		return <CloseSmallIcon className={className} {...props} />;
	}

	if (name === 'close-medium') {
		return <CloseMediumIcon className={className} {...props} />;
	}

	if (name === 'close-large') {
		return <CloseLargeIcon className={className} {...props} />;
	}

	if (name === 'comment') {
		return <CommentIcon className={className} {...props} />;
	}

	if (name === 'content-block') {
		return <ContentBlockIcon className={className} {...props} />;
	}

	if (name === 'crm-filter-all') {
		return <CrmFilterAllIcon className={className} {...props} />;
	}

	if (name === 'crm-filter-archive') {
		return <CrmFilterArchiveIcon className={className} {...props} />;
	}

	if (name === 'crm-filter-freedom') {
		return <CrmFilterFreedomIcon className={className} {...props} />;
	}

	if (name === 'crm-filter-my') {
		return <CrmFilterMyIcon className={className} {...props} />;
	}

	if (name === 'crm-filter-new') {
		return <CrmFilterNewIcon className={className} {...props} />;
	}

	if (name === 'crm-filter-priority') {
		return <CrmFilterPriorityIcon className={className} {...props} />;
	}

	if (name === 'crm-filter-unverified') {
		return <CrmFilterUnverifiedIcon className={className} {...props} />;
	}

	if (name === 'cmd') {
		return <CmdIcon className={className} {...props} />;
	}

	if (name === 'crm') {
		return <CrmIcon className={className} {...props} />;
	}

	if (name === 'dashboard') {
		return <DashboardIcon className={className} {...props} />;
	}

	if (name === 'dashboard-f') {
		return <DashboardFillIcon className={className} {...props} />;
	}

	if (name === 'dots-eight') {
		return <DotsEightIcon className={className} {...props} />;
	}

	if (name === 'dots-three') {
		return <DotsThreeIcon className={className} {...props} />;
	}

	if (name === 'download') {
		return <DownloadIcon className={className} {...props} />;
	}

	if (name === 'edit') {
		return <EditIcon className={className} {...props} />;
	}

	if (name === 'erase') {
		return <EraseIcon className={className} {...props} />;
	}

	if (name === 'excel') {
		return <ExcelIcon className={className} {...props} />;
	}

	if (name === 'eye') {
		return <EyeIcon className={className} {...props} />;
	}

	if (name === 'facebook') {
		return <FacebookIcon className={className} {...props} />;
	}

	if (name === 'female') {
		return <FemaleIcon className={className} {...props} />;
	}

	if (name === 'filter-clean') {
		return <FilterCleanIcon className={className} {...props} />;
	}

	if (name === 'filter') {
		return <FilterIcon className={className} {...props} />;
	}

	if (name === 'fired') {
		return <FiredIcon className={className} {...props} />;
	}

	if (name === 'history') {
		return <HistoryIcon className={className} {...props} />;
	}

	if (name === 'information') {
		return <InformationIcon className={className} {...props} />;
	}

	if (name === 'icons') {
		return <IconsIcon className={className} {...props} />;
	}

	if (name === 'information-f') {
		return <InformationFillIcon className={className} {...props} />;
	}

	if (name === 'input-number') {
		return <InputNumberIcon className={className} {...props} />;
	}

	if (name === 'input-otp') {
		return <InputOTPIcon className={className} {...props} />;
	}

	if (name === 'input') {
		return <InputIcon className={className} {...props} />;
	}

	if (name === 'instagram') {
		return <InstagramIcon className={className} {...props} />;
	}

	if (name === 'link') {
		return <LinkIcon className={className} {...props} />;
	}

	if (name === 'logistics') {
		return <LogisticsIcon className={className} {...props} />;
	}

	if (name === 'logout') {
		return <LogoutIcon className={className} {...props} />;
	}

	if (name === 'mail') {
		return <MailIcon className={className} {...props} />;
	}

	if (name === 'mail-f') {
		return <MailFillIcon className={className} {...props} />;
	}

	if (name === 'male') {
		return <MaleIcon className={className} {...props} />;
	}

	if (name === 'microphone-off') {
		return <MicrophoneOffIcon className={className} {...props} />;
	}

	if (name === 'password') {
		return <PasswordIcon className={className} {...props} />;
	}

	if (name === 'pause') {
		return <PauseIcon className={className} {...props} />;
	}

	if (name === 'phone') {
		return <PhoneIcon className={className} {...props} />;
	}

	if (name === 'phone-f') {
		return <PhoneFillIcon className={className} {...props} />;
	}

	if (name === 'play') {
		return <PlayIcon className={className} {...props} />;
	}

	if (name === 'plus-small') {
		return <PlusSmallIcon className={className} {...props} />;
	}

	if (name === 'plus-medium') {
		return <PlusMediumIcon className={className} {...props} />;
	}

	if (name === 'plus-large') {
		return <PlusLargeIcon className={className} {...props} />;
	}

	if (name === 'refresh') {
		return <RefreshIcon className={className} {...props} />;
	}

	if (name === 'search') {
		return <SearchIcon className={className} {...props} />;
	}

	if (name === 'time') {
		return <TimeIcon className={className} {...props} />;
	}

	if (name === 'time-clean') {
		return <TimeCleanIcon className={className} {...props} />;
	}

	if (name === 'todo') {
		return <TodoIcon className={className} {...props} />;
	}

	if (name === 'button') {
		return <ButtonIcon className={className} {...props} />;
	}

	if (name === 'checkbox') {
		return <CheckboxIcon className={className} {...props} />;
	}

	if (name === 'drawer') {
		return <DrawerIcon className={className} {...props} />;
	}

	if (name === 'modal') {
		return <ModalIcon className={className} {...props} />;
	}

	if (name === 'open') {
		return <OpenIcon className={className} {...props} />;
	}

	if (name === 'radio-button') {
		return <RadioButtonIcon className={className} {...props} />;
	}

	if (name === 'realization-employee') {
		return <RealizationEmployeeIcon className={className} {...props} />;
	}

	if (name === 'realization-team') {
		return <RealizationTeamIcon className={className} {...props} />;
	}

	if (name === 'segment-control') {
		return <SegmentControlIcon className={className} {...props} />;
	}

	if (name === 'text') {
		return <TextIcon className={className} {...props} />;
	}

	if (name === 'select') {
		return <SelectIcon className={className} {...props} />;
	}

	if (name === 'stepper') {
		return <StepperIcon className={className} {...props} />;
	}

	if (name === 'switcher') {
		return <SwitcherIcon className={className} {...props} />;
	}

	if (name === 'upload') {
		return <UploadIcon className={className} {...props} />;
	}

	if (name === 'upload-circle') {
		return <UploadCircleIcon className={className} {...props} />;
	}

	if (name === 'user') {
		return <UserIcon className={className} {...props} />;
	}

	if (name === 'user-add') {
		return <UserAddIcon className={className} {...props} />;
	}

	if (name === 'users') {
		return <UsersIcon className={className} {...props} />;
	}

	if (name === 'users-bold') {
		return <UsersBoldIcon className={className} {...props} />;
	}

	if (name === 'users-singleton') {
		return <UsersSingletonIcon className={className} {...props} />;
	}

	if (name === 'settings') {
		return <SettingsIcon className={className} {...props} />;
	}

	if (name === 'share') {
		return <ShareIcon className={className} {...props} />;
	}

	if (name === 'slider') {
		return <SliderIcon className={className} {...props} />;
	}

	if (name === 'table') {
		return <TableIcon className={className} {...props} />;
	}

	if (name === 'telegram') {
		return <TelegramIcon className={className} {...props} />;
	}

	if (name === 'trash') {
		return <TrashIcon className={className} {...props} />;
	}

	if (name === 'warehouse') {
		return <WarehouseIcon className={className} {...props} />;
	}

	if (name === 'warehouse-f') {
		return <WarehouseFillIcon className={className} {...props} />;
	}

	return <></>;
};

export const Icon = ({ name, disabled, className, ...props }: IconProps): JSX.Element => {
	const classNames = cn(className, {
		[css.disabled]: disabled,
	});

	return <IconsArray name={name} className={classNames} width={props.width || 16} {...props} />;
};
