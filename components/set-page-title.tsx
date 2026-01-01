"use client"

import * as React from "react"
import { usePageTitle } from "./page-title-context"

interface SetPageTitleProps {
    title: string
}

export function SetPageTitle({ title }: SetPageTitleProps) {
    const { setTitle } = usePageTitle()

    React.useEffect(() => {
        setTitle(title)
        return () => setTitle(null)
    }, [title, setTitle])

    return null
}
