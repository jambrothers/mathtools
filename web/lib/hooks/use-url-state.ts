"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { URLStateSerializer, generateShareableURL, copyURLToClipboard } from "@/lib/url-state"

interface UseUrlStateOptions<T> {
    /** Called when state is successfully restored from URL params. */
    onRestore: (state: T) => void
    /** Optional base URL override for shareable URLs. */
    baseUrl?: string
}

export function useUrlState<T>(
    serializer: URLStateSerializer<T>,
    { onRestore, baseUrl }: UseUrlStateOptions<T>
) {
    const searchParams = useSearchParams()
    const hasRestoredRef = useRef(false)
    const [hasRestored, setHasRestored] = useState(false)

    useEffect(() => {
        if (hasRestoredRef.current) return
        if (!searchParams || searchParams.toString() === '') {
            hasRestoredRef.current = true
            setHasRestored(true)
            return
        }

        const restored = serializer.deserialize(searchParams)
        if (restored) {
            onRestore(restored)
        }
        hasRestoredRef.current = true
        setHasRestored(true)
    }, [searchParams, serializer, onRestore])

    const getShareableUrl = useCallback((state: T) => {
        return generateShareableURL(serializer, state, baseUrl)
    }, [serializer, baseUrl])

    const copyShareableUrl = useCallback(async (state: T) => {
        const url = getShareableUrl(state)
        return copyURLToClipboard(url)
    }, [getShareableUrl])

    return {
        hasRestored,
        getShareableUrl,
        copyShareableUrl
    }
}
