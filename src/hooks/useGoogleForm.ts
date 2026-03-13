import { useState } from 'react';

interface GoogleFormConfig {
    scriptUrl?: string;
    sheetName?: string;
}

interface SubmitResult {
    success: boolean;
    message?: string;
    error?: string;
}

export const useGoogleForm = ({ scriptUrl, sheetName = 'Sheet1' }: GoogleFormConfig = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Use environment variable if URL not provided
    const targetUrl = scriptUrl || window.RUNTIME_CONFIG.VITE_GOOGLE_SCRIPT_URL;

    const submit = async (data: Record<string, any>): Promise<SubmitResult> => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!targetUrl) {
                throw new Error("Google Script URL is not configured (VITE_GOOGLE_SCRIPT_URL)");
            }

            // Add sheetName to payload
            const payload = {
                ...data,
                sheetName,
                secret: window.RUNTIME_CONFIG.VITE_APP_SECRET,
            };

            // We use fetch with 'no-cors' initially? No, Apps Script Web Apps support CORS if returning JSON.
            // However, to be safe and handle complex JSON including Files, we use 'text/plain' or standard JSON 
            // but ensure the script handles OPTIONS (which it often doesn't).
            // Best approach: Send as text/plain to avoid preflight, parse on server.

            const response = await fetch(targetUrl, {
                method: "POST",
                // Do NOT set 'Content-Type': 'application/json' to avoid preflight OPTIONS request
                // which Apps Script fails on. Send as plain text, parse in GAS.
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.result === 'success') {
                setSuccess(true);
                return { success: true, message: result.message };
            } else {
                throw new Error(result.error || "Unknown error from script");
            }

        } catch (err: any) {
            console.error("Form submission error:", err);
            const msg = err.message || "Failed to submit form";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        submit,
        loading,
        error,
        success,
        reset: () => {
            setSuccess(false);
            setError(null);
        }
    };
};
