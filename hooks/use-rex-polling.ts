import { useState, useCallback, useRef, useEffect } from 'react';

interface PollConfig {
  maxAttempts?: number;
  interval?: number; // in milliseconds
  onStatusUpdate?: (status: any) => void;
  onCompleted?: (result: any) => void;
  onError?: (error: Error) => void;
}

interface PollState {
  isPolling: boolean;
  status: any;
  result: any;
  error: Error | null;
  attempt: number;
}

interface PersistedPollState {
  processId: string;
  config: PollConfig;
  startTime: number;
  attempt: number;
}

const POLLING_STATE_KEY = 'rex_polling_state';

// Helper to get persisted polling state from sessionStorage
const getPersistedPollingState = (): PersistedPollState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(POLLING_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('[Polling] Error reading persisted state:', err);
    return null;
  }
};

// Helper to save polling state to sessionStorage
const savePollingState = (processId: string, config: PollConfig, attempt: number): void => {
  if (typeof window === 'undefined') return;
  try {
    const state: PersistedPollState = {
      processId,
      config,
      startTime: Date.now(),
      attempt,
    };
    sessionStorage.setItem(POLLING_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('[Polling] Error saving polling state:', err);
  }
};

// Helper to clear persisted polling state
const clearPersistedPollingState = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(POLLING_STATE_KEY);
  } catch (err) {
    console.error('[Polling] Error clearing polling state:', err);
  }
};

export const useRexPolling = () => {
  const [state, setState] = useState<PollState>({
    isPolling: false,
    status: null,
    result: null,
    error: null,
    attempt: 0,
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef<PollConfig>({});
  const processIdRef = useRef<string | null>(null);
  const isPollingRef = useRef<boolean>(false);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    isPollingRef.current = false;
    setState((prev) => ({ ...prev, isPolling: false }));
    clearPersistedPollingState();
  }, []);

  const startPolling = useCallback(
    (processId: string, config: PollConfig = {}) => {
      const {
        maxAttempts = 120, // 10 minutes with 5-second interval
        interval = 5000,
        onStatusUpdate,
        onCompleted,
        onError,
      } = config;

      configRef.current = config;
      processIdRef.current = processId;
      isPollingRef.current = true;

      setState((prev) => ({
        ...prev,
        isPolling: true,
        error: null,
        attempt: 0,
      }));

      let attempts = 0;

      const poll = async () => {
        // Check if polling has been stopped
        if (!isPollingRef.current) {
          console.log('[Polling] Polling stopped, skipping poll');
          return;
        }

        try {
          attempts++;
          setState((prev) => ({ ...prev, attempt: attempts }));
          
          // Persist polling state so it can be resumed if page refreshes
          savePollingState(processId, config, attempts);

          // Check status
          const statusResponse = await fetch(
            `/api/rex/status?processId=${processId}`
          );

          if (!statusResponse.ok) {
            throw new Error(
              `Status check failed: ${statusResponse.statusText}`
            );
          }

          const statusData = await statusResponse.json();
          console.log('[Polling] Status:', statusData);

          setState((prev) => ({ ...prev, status: statusData }));
          onStatusUpdate?.(statusData);

          // Check if completed
          if (statusData.status === 'completed') {
            console.log('[Polling] Status is completed, fetching results...');

            // Fetch results
            const resultResponse = await fetch(
              `/api/rex/result?processId=${processId}`
            );

            if (!resultResponse.ok) {
              throw new Error(
                `Result fetch failed: ${resultResponse.statusText}`
              );
            }

            const resultData = await resultResponse.json();
            console.log('[Polling] Results:', resultData);

            setState((prev) => ({ ...prev, result: resultData }));
            onCompleted?.(resultData);

            stopPolling();
          } else if (attempts >= maxAttempts) {
            const error = new Error(
              `Polling timeout: Max attempts (${maxAttempts}) reached`
            );
            setState((prev) => ({ ...prev, error }));
            onError?.(error);
            stopPolling();
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error('[Polling] Error:', err);
          setState((prev) => ({ ...prev, error: err }));
          onError?.(err);
          stopPolling();
        }
      };

      // Initial poll immediately
      poll();

      // Then poll at interval
      pollIntervalRef.current = setInterval(poll, interval);
    },
    [stopPolling]
  );

  // On mount, check if there's a persisted polling state and resume it
  useEffect(() => {
    const persistedState = getPersistedPollingState();
    
    if (persistedState && !state.isPolling) {
      console.log('[Polling] Resuming polling from previous session:', persistedState.processId);
      // Resume polling from where it left off
      startPolling(persistedState.processId, persistedState.config);
    }
  }, []);

  return {
    ...state,
    startPolling,
    stopPolling,
  };
};
