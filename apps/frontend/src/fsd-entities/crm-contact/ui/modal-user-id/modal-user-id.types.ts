export interface IModalUserIdProps {
	isShow: boolean;
	isLoading: boolean;
	setIsShow: (isShow: boolean) => void;
	onSuccess: (value: string) => void;
}
