import { Skeleton as UISkeleton } from "@fsd/shared/ui-kit"
import { Divider } from "@mantine/core"

export const Skeleton = () => {
	return (
		<>
			<UISkeleton rounded={"medium"} height={200} />

			<Divider style={{ margin: '40px 0px' }} />

			<UISkeleton rounded={"medium"} height={100} />
			<br />
			<UISkeleton rounded={"medium"} height={100} />
		</>
	)
}
