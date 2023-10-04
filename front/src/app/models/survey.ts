export interface Survey {
    id: number,
    status?: string,
    total?: number,
    title: string,
    description: string,
    link?: string,
    variants: SurveyVariants[],
}

export interface SurveyVariants {
    key: number,
    value: string,
    count?: number
}
