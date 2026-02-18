"use client"

import * as React from "react"
import {
    generateQuestion,
    Question,
    QuestionCategory
} from "../_lib/question-generator"

export function usePointless(
    initialCategory: QuestionCategory = "factors",
    initialParams?: Record<string, number | string>
) {
    const [category, setCategory] = React.useState<QuestionCategory>(initialCategory)
    const [params, setParams] = React.useState<Record<string, number | string>>(initialParams || {})
    const [isRevealed, setIsRevealed] = React.useState(false)
    const [question, setQuestion] = React.useState<Question>(() =>
        generateQuestion(initialCategory, initialParams)
    )

    // Sync question when category or manual params change
    // This allows the teacher to change values in the sidebar
    // We use a effect that specifically looks for structural changes in params
    const lastRenderedState = React.useRef({ category, params });

    React.useEffect(() => {
        const hasParamChange = JSON.stringify(params) !== JSON.stringify(lastRenderedState.current.params);
        const hasCategoryChange = category !== lastRenderedState.current.category;

        if (hasParamChange || hasCategoryChange) {
            const newQuestion = generateQuestion(category, params);
            setQuestion(newQuestion);
            // Only update params if the category changed (to get defaults)
            if (hasCategoryChange && !hasParamChange) {
                setParams(newQuestion.parameters);
            }
            setIsRevealed(false);
            lastRenderedState.current = { category, params };
        }
    }, [category, params]);

    const handleSetParams = (newParams: Record<string, number | string>) => {
        setParams(newParams);
        // Logic to regenerate based on manual params would go here if generator supports it
        // For now, let's keep it simple as per confirmed plan (teacher controls params).
        // If teacher manually changes a value in the sidebar, we might need to 
        // re-run the generator with those specific inputs.
    };

    const nextQuestion = () => {
        const newQuestion = generateQuestion(category);
        setQuestion(newQuestion);
        setParams(newQuestion.parameters);
        setIsRevealed(false);
    };

    const toggleReveal = () => setIsRevealed(!isRevealed);

    return {
        category,
        setCategory,
        params,
        setParams: handleSetParams,
        question,
        isRevealed,
        toggleReveal,
        nextQuestion
    };
}
