import axiosInstance from '@/app/utils/axiosInstance';

// --- Types ---------------------------------------------------------------
export interface GeminiChatResponse {
  text: string;          // Plain text returned by backend (current implementation)
}

export interface GeminiConfigResponse {
  base: string;
  model: string;
}

export interface GeminiModelListRaw {
  // The backend currently returns the raw JSON string from Google. We'll type the common shape defensively.
  models?: Array<{
    name: string;               // e.g. "models/gemini-2.5-flash"
    displayName?: string;
    description?: string;
    inputTokenLimit?: number;
    outputTokenLimit?: number;
    temperature?: number;
    // Accept additional unknown keys without breaking.
    [key: string]: any;
  }>;
  [key: string]: any;
}

// --- Internal helpers ----------------------------------------------------
const parseError = (err: any): Error => {
  if (err?.response) {
    const msg = err.response.data?.message || err.response.data || `Request failed (${err.response.status})`;
    return new Error(msg);
  }
  return new Error(err?.message || 'Network error');
};

// Because backend returns plain text for chat, wrap it into a structured object for UI consistency.
const wrapChatText = (text: string): GeminiChatResponse => ({ text });

// --- API surface ---------------------------------------------------------
export const GeminiApi = {
  /**
   * Send a prompt to the Gemini chat endpoint (single-turn currently).
   * Backend returns plain text body. We wrap it for consistency.
   */
  async sendMessage(message: string): Promise<GeminiChatResponse> {
    try {
      const res = await axiosInstance.post<string>('/api/chat', { message });
      return wrapChatText(res.data);
    } catch (e) {
      throw parseError(e);
    }
  },

  /**
   * List available Gemini models (raw passthrough from backend). Attempts JSON parse.
   */
  async listModels(): Promise<GeminiModelListRaw> {
    try {
      const res = await axiosInstance.get<string>('/api/chat/models');
      // Backend returns a string that should already be JSON from Google API. Parse defensively.
      if (typeof res.data === 'string') {
        try {
          return JSON.parse(res.data) as GeminiModelListRaw;
        } catch {
          // If parsing fails, return object with raw property.
          return { raw: res.data } as GeminiModelListRaw;
        }
      }
      return res.data as any; // fallback
    } catch (e) {
      throw parseError(e);
    }
  },

  /**
   * Fetch non-sensitive config reflection (base, model).
   */
  async getConfig(): Promise<GeminiConfigResponse> {
    try {
      const res = await axiosInstance.get<GeminiConfigResponse>('/api/chat/config');
      return res.data;
    } catch (e) {
      throw parseError(e);
    }
  }
};

export default GeminiApi;
