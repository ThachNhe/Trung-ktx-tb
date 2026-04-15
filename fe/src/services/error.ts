import axios from 'axios'

import type { ApiErrorResponse, ApiResponse } from '@/types/api.types'

export function getApiErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const payload = error.response?.data

        if (payload?.errors?.length) {
            return payload.errors.map((item) => item.message).join(', ')
        }

        return payload?.message ?? fallback
    }

    if (error instanceof Error) {
        return error.message || fallback
    }

    return fallback
}

export async function executeRequest<T>(
    request: Promise<ApiResponse<T>>,
    fallback: string,
) {
    try {
        const response = await request
        return response.data
    } catch (error) {
        throw new Error(getApiErrorMessage(error, fallback))
    }
}