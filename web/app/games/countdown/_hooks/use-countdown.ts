"use client"

import * as React from "react"
import {
    generatePuzzle,
    solve,
    GameConfig,
    Puzzle,
    Operation
} from "../_lib/countdown-solver"

export function useCountdown(initialState?: { config: GameConfig, sources: number[], target: number }) {
    const defaultConfig: GameConfig = {
        allowedOperations: ['+', '-', '*', '/'],
        largeNumbersCount: 1,
        targetRange: [100, 999]
    }

    const [config, setConfig] = React.useState<GameConfig>(initialState?.config || defaultConfig)
    const [puzzle, setPuzzle] = React.useState<Puzzle | null>(() => {
        if (initialState) {
            const solution = solve(initialState.sources, initialState.target, initialState.config.allowedOperations)
            return {
                sources: initialState.sources,
                target: initialState.target,
                solution
            }
        }
        return null
    })

    React.useEffect(() => {
        if (!puzzle && !initialState) {
            setPuzzle(generatePuzzle(config))
        }
    }, [config, initialState, puzzle])

    const [isRevealed, setIsRevealed] = React.useState(false)

    // Timer state
    const [timeLeft, setTimeLeft] = React.useState(30)
    const [isTimerRunning, setIsTimerRunning] = React.useState(false)

    React.useEffect(() => {
        let interval: NodeJS.Timeout
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsTimerRunning(false)
        }
        return () => clearInterval(interval)
    }, [isTimerRunning, timeLeft])

    const startTimer = () => {
        setTimeLeft(30)
        setIsTimerRunning(true)
    }

    const stopTimer = () => setIsTimerRunning(false)
    const resetTimer = () => {
        setTimeLeft(30)
        setIsTimerRunning(false)
    }

    const newPuzzle = (customConfig?: GameConfig) => {
        const activeConfig = customConfig || config
        const newPuz = generatePuzzle(activeConfig)
        setPuzzle(newPuz)
        setIsRevealed(false)
        resetTimer()
    }

    const toggleReveal = () => setIsRevealed(!isRevealed)

    const toggleOperation = (op: Operation) => {
        const newOps = config.allowedOperations.includes(op)
            ? config.allowedOperations.filter(o => o !== op)
            : [...config.allowedOperations, op]

        setConfig(prev => ({ ...prev, allowedOperations: newOps }))
    }

    const setTargetRange = (min: number, max: number) => {
        setConfig(prev => ({ ...prev, targetRange: [min, max] }))
    }

    const setLargeNumbersCount = (count: number | 'random') => {
        setConfig(prev => ({ ...prev, largeNumbersCount: count }))
    }

    return {
        config,
        puzzle,
        isRevealed,
        timeLeft,
        isTimerRunning,
        startTimer,
        stopTimer,
        resetTimer,
        newPuzzle,
        toggleReveal,
        toggleOperation,
        setTargetRange,
        setLargeNumbersCount
    }
}
