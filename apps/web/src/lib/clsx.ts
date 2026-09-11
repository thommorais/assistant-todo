import { tv } from './third-party/tv'

const clsxClasses = tv({ base: [] })

export const clsx = (...args: (string | undefined)[]) => clsxClasses({ class: [args] })
