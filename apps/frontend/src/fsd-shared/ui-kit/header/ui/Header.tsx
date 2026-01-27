import TailwindColors from "@config/tailwind/color"
import { Loader } from "@mantine/core"
import cn from "classnames"
import { FC } from "react"
import { TextField } from "../../text-field"
import { IHeaderProps } from "../types/header.props"
import css from "./header.module.scss"

export const Header: FC<IHeaderProps> = (
	{ title, contentLeft, contentRight, contentCenter, loading, className, ...props }
) => {
	return <div className={cn(css.wrapper, className)} {...props}>
		<TextField
			mode={'heading'}
			className={css.title}
			disabled={loading}
		> {title} </TextField>

		<div className={css.contentLeft}>
			{contentLeft}
		</div>

		<div>
			{loading && <Loader color={TailwindColors.neutral[100]} size="sm" className={css.loader} />}
		</div>

		<div className={css.contentCenter}>
			{contentCenter}
		</div>

		<div className={css.contentRight}>
			{contentRight}
		</div>
	</div>
}
