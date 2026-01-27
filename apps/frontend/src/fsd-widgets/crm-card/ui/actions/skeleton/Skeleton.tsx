import { Skeleton as UISkeleton } from "@fsd/shared/ui-kit"
import css from './skeleton.module.scss';

export const Skeleton = () => {
	return (
		<div className={css.wrapper}>
			<UISkeleton rounded={"medium"} height={40} />
			<UISkeleton rounded={"medium"} height={100} />
		</div>
	)
}
