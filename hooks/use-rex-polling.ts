import { useState, useCallback, useRef } from 'react';

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

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setState((prev) => ({ ...prev, isPolling: false }));
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

      setState((prev) => ({
        ...prev,
        isPolling: true,
        error: null,
        attempt: 0,
      }));

      let attempts = 0;

      const poll = async () => {
        try {
          attempts++;
          setState((prev) => ({ ...prev, attempt: attempts }));

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

  return {
    ...state,
    startPolling,
    stopPolling,
  };
};
