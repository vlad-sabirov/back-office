import { Skeleton as UISkeleton } from "@fsd/shared/ui-kit"

export const Skeleton = () => {
	return (
		<>
			<UISkeleton rounded={"medium"} height={60} />
			<br />
			<UISkeleton rounded={"medium"} height={60} />
			<br />
			<UISkeleton rounded={"medium"} height={60} />
			<br />
			<UISkeleton rounded={"medium"} height={60} />
			<br />
			<UISkeleton rounded={"medium"} height={60} />
		</>
	)
}
