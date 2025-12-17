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
  documentId?: string; // Store documentId for re-attaching callbacks on resume
  startTime: number;
  attempt: number;
}

interface PersistedPollingQueue {
  processes: PersistedPollState[];
  lastUpdated: number;
}

const POLLING_STATE_KEY = 'rex_polling_state';
const POLLING_QUEUE_KEY = 'rex_polling_queue';

// Helper to get persisted polling queue from sessionStorage
const getPersistedPollingQueue = (): PersistedPollingQueue | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(POLLING_QUEUE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('[Polling] Error reading persisted queue:', err);
    return null;
  }
};

// Helper to save polling state to queue in sessionStorage
const addToPollingQueue = (processId: string, config: PollConfig, attempt: number, documentId?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const queue = getPersistedPollingQueue() || { processes: [], lastUpdated: Date.now() };
    
    // Check if process already exists, update it
    const existingIndex = queue.processes.findIndex(p => p.processId === processId);
    const newState: PersistedPollState = {
      processId,
      config,
      documentId,
      startTime: Date.now(),
      attempt,
    };
    
    if (existingIndex >= 0) {
      queue.processes[existingIndex] = newState;
    } else {
      queue.processes.push(newState);
    }
    
    queue.lastUpdated = Date.now();
    sessionStorage.setItem(POLLING_QUEUE_KEY, JSON.stringify(queue));
    console.log('[Polling] Queue updated, now tracking:', queue.processes.map(p => p.processId));
  } catch (err) {
    console.error('[Polling] Error saving to queue:', err);
  }
};

// Helper to remove from queue
const removeFromPollingQueue = (processId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const queue = getPersistedPollingQueue();
    if (queue) {
      queue.processes = queue.processes.filter(p => p.processId !== processId);
      queue.lastUpdated = Date.now();
      if (queue.processes.length > 0) {
        sessionStorage.setItem(POLLING_QUEUE_KEY, JSON.stringify(queue));
      } else {
        sessionStorage.removeItem(POLLING_QUEUE_KEY);
      }
      console.log('[Polling] Removed from queue, remaining:', queue.processes.map(p => p.processId));
    }
  } catch (err) {
    console.error('[Polling] Error removing from queue:', err);
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

  // Track multiple process polls
  const pollIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const configsRef = useRef<Map<string, PollConfig>>(new Map());
  const attemptsRef = useRef<Map<string, number>>(new Map());

  const stopPollingForProcess = useCallback((processId: string) => {
    const interval = pollIntervalsRef.current.get(processId);
    if (interval) {
      clearInterval(interval);
      pollIntervalsRef.current.delete(processId);
    }
    configsRef.current.delete(processId);
    attemptsRef.current.delete(processId);
    removeFromPollingQueue(processId);
    
    // Update state - set isPolling to true if there are still processes polling
    const hasActivePolls = pollIntervalsRef.current.size > 0;
    setState((prev) => ({ ...prev, isPolling: hasActivePolls }));
  }, []);

  const startPolling = useCallback(
    (processId: string, config: PollConfig = {}, documentId?: string) => {
      // Guard: Don't start polling if already polling this process
      if (pollIntervalsRef.current.has(processId)) {
        console.log(`[Polling] Process ${processId} is already polling, skipping duplicate start`);
        return;
      }

      const {
        maxAttempts = 120, // 10 minutes with 5-second interval
        interval = 10000, // 10 second interval
        onStatusUpdate,
        onCompleted,
        onError,
      } = config;

      // Store config for this process
      configsRef.current.set(processId, config);
      let attempts = attemptsRef.current.get(processId) || 0;

      console.log(`[Polling] Starting poll for process: ${processId}`);

      setState((prev) => ({
        ...prev,
        isPolling: true,
        error: null,
      }));

      const poll = async () => {
        try {
          attempts++;
          attemptsRef.current.set(processId, attempts);

          // Check status
          const statusResponse = await fetch(
            `/api/rex/status?processId=${processId}`
          );

          if (!statusResponse.ok) {
            // Check if response is JSON before parsing
            const contentType = statusResponse.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const errorData = await statusResponse.json();
              throw new Error(errorData.error || `Status check failed: ${statusResponse.statusText}`);
            } else {
              const errorText = await statusResponse.text();
              console.error('[Polling] Non-JSON error response:', errorText.substring(0, 200));
              throw new Error(`Status check failed (${statusResponse.status}): Server returned non-JSON response`);
            }
          }

          // Verify response is JSON before parsing
          const statusContentType = statusResponse.headers.get('content-type') || '';
          if (!statusContentType.includes('application/json')) {
            const responseText = await statusResponse.text();
            console.error('[Polling] Unexpected non-JSON response:', responseText.substring(0, 200));
            throw new Error('Status API returned non-JSON response');
          }

          const statusData = await statusResponse.json();
          console.log(`[Polling] Process ${processId} Status:`, statusData);

          setState((prev) => ({ ...prev, status: statusData }));
          onStatusUpdate?.(statusData);

          // Check if completed
          if (statusData.status === 'completed') {
            console.log(`[Polling] Process ${processId} completed, fetching results...`);

            // Fetch results
            const resultResponse = await fetch(
              `/api/rex/result?processId=${processId}`
            );

            if (!resultResponse.ok) {
              // Check if response is JSON before parsing
              const contentType = resultResponse.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const errorData = await resultResponse.json();
                throw new Error(errorData.error || `Result fetch failed: ${resultResponse.statusText}`);
              } else {
                const errorText = await resultResponse.text();
                console.error('[Polling] Non-JSON result error response:', errorText.substring(0, 200));
                throw new Error(`Result fetch failed (${resultResponse.status}): Server returned non-JSON response`);
              }
            }

            // Verify response is JSON before parsing
            const resultContentType = resultResponse.headers.get('content-type') || '';
            if (!resultContentType.includes('application/json')) {
              const responseText = await resultResponse.text();
              console.error('[Polling] Unexpected non-JSON result response:', responseText.substring(0, 200));
              throw new Error('Result API returned non-JSON response');
            }

            const resultData = await resultResponse.json();
            console.log(`[Polling] Process ${processId} Results:`, resultData);

            setState((prev) => ({ ...prev, result: resultData }));
            
            // CRITICAL: Always persist results to database when completed
            // This ensures results are saved even if callbacks are missing (e.g., after page refresh)
            try {
              const { updateDocumentStatus } = await import('@/lib/document-utils');
              await updateDocumentStatus(
                processId,
                'completed',
                resultData,
                undefined,
                resultData.documentId
              );
              console.log(`[Polling] Process ${processId} result persisted to database`);
            } catch (err) {
              console.error(`[Polling] Failed to persist result for process ${processId}:`, err);
            }
            
            // Also call the callback if provided
            onCompleted?.(resultData);

            stopPollingForProcess(processId);
          } else if (attempts >= maxAttempts) {
            const error = new Error(
              `Polling timeout: Max attempts (${maxAttempts}) reached for process ${processId}`
            );
            console.error('[Polling]', error.message);
            setState((prev) => ({ ...prev, error }));
            
            // Persist timeout error to database
            try {
              const { updateDocumentStatus } = await import('@/lib/document-utils');
              await updateDocumentStatus(
                processId,
                'failed',
                undefined,
                error.message
              );
              console.log(`[Polling] Process ${processId} failure persisted to database`);
            } catch (err) {
              console.error(`[Polling] Failed to persist error for process ${processId}:`, err);
            }
            
            onError?.(error);
            stopPollingForProcess(processId);
          } else {
            // Only persist to queue if still polling (not completed or errored)
            addToPollingQueue(processId, config, attempts, documentId);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error(`[Polling] Error for process ${processId}:`, err);
          setState((prev) => ({ ...prev, error: err }));
          
          // Persist error to database
          try {
            const { updateDocumentStatus } = await import('@/lib/document-utils');
            await updateDocumentStatus(
              processId,
              'failed',
              undefined,
              err.message
            );
            console.log(`[Polling] Process ${processId} error persisted to database`);
          } catch (persistErr) {
            console.error(`[Polling] Failed to persist error for process ${processId}:`, persistErr);
          }
          
          onError?.(err);
          stopPollingForProcess(processId);
        }
      };

      // Initial poll immediately
      poll();

      // Then poll at interval
      const pollInterval = setInterval(poll, interval);
      pollIntervalsRef.current.set(processId, pollInterval);
    },
    [stopPollingForProcess]
  );

  // On mount, check if there are persisted polling processes and resume them
  useEffect(() => {
    const resumePolling = () => {
      const persistedQueue = getPersistedPollingQueue();
      
      if (persistedQueue && persistedQueue.processes.length > 0) {
        console.log('[Polling] Resuming polling queue from previous session:', 
          persistedQueue.processes.map(p => p.processId));
        
        // Resume polling for all queued processes
        persistedQueue.processes.forEach((pollState) => {
          // Check if this process is already being tracked locally
          // to avoid duplicate polling if component remounts while polling is active
          if (!pollIntervalsRef.current.has(pollState.processId)) {
            console.log(`[Polling] Resuming process: ${pollState.processId}`);
            startPolling(pollState.processId, pollState.config, pollState.documentId);
          } else {
            console.log(`[Polling] Process ${pollState.processId} already running, skipping resume`);
          }
        });
      }
    };

    // Resume immediately on mount
    resumePolling();

    // Also set up a listener for storage changes (for multi-tab scenarios)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === POLLING_QUEUE_KEY && e.newValue) {
        console.log('[Polling] Queue updated in another tab, syncing...');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [startPolling]);

  const stopPolling = useCallback(() => {
    // Stop all polls but PRESERVE the queue in sessionStorage
    // This allows polling to resume even if component unmounts
    pollIntervalsRef.current.forEach((interval) => {
      clearInterval(interval);
    });
    pollIntervalsRef.current.clear();
    configsRef.current.clear();
    attemptsRef.current.clear();
    setState((prev) => ({ ...prev, isPolling: false }));
    // NOTE: We intentionally do NOT clear POLLING_QUEUE_KEY
    // The queue will persist and resume on component remount or page refresh
    console.log('[Polling] Stopped local polling intervals, but queue persists in sessionStorage');
  }, []);

  return {
    ...state,
    startPolling,
    stopPolling,
    stopPollingForProcess,
  };
};
