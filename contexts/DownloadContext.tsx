import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  cancelSurahDownload,
  deleteSurahAudio,
  downloadSurahAudio,
  downloadsSupported,
  refreshDownloadedSurahs,
} from '@/lib/downloads';
import type { DownloadJob, DownloadedSurahMeta } from '@/lib/types';

type DownloadContextValue = {
  supported: boolean;
  downloaded: DownloadedSurahMeta[];
  ready: boolean;
  queue: DownloadJob[];
  isDownloaded: (surahId: number) => boolean;
  enqueue: (surahId: number) => void;
  cancel: (surahId: number) => void;
  remove: (surahId: number) => Promise<void>;
  getJob: (surahId: number) => DownloadJob | undefined;
  refresh: () => Promise<void>;
};

const DownloadContext = createContext<DownloadContextValue | null>(null);

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [downloaded, setDownloaded] = useState<DownloadedSurahMeta[]>([]);
  const [ready, setReady] = useState(false);
  const [jobs, setJobs] = useState<Record<number, DownloadJob>>({});
  const processing = useRef(false);
  const pending = useRef<number[]>([]);

  const supported = downloadsSupported();

  const refresh = useCallback(async () => {
    const list = await refreshDownloadedSurahs();
    setDownloaded(list);
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  const updateJob = useCallback((surahId: number, patch: Partial<DownloadJob>) => {
    setJobs((prev) => {
      const cur = prev[surahId] ?? {
        surahId,
        status: 'queued' as const,
        progress: 0,
        completedAyahs: 0,
        totalAyahs: 0,
      };
      return { ...prev, [surahId]: { ...cur, ...patch } };
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (processing.current) return;
    processing.current = true;
    try {
      while (pending.current.length > 0) {
        const surahId = pending.current.shift()!;
        updateJob(surahId, { status: 'downloading', progress: 0, error: undefined });
        try {
          await downloadSurahAudio(surahId, (p) => {
            updateJob(surahId, {
              status: 'downloading',
              progress: p.progress,
              completedAyahs: p.completedAyahs,
              totalAyahs: p.totalAyahs,
            });
          });
          updateJob(surahId, { status: 'done', progress: 1 });
          await refresh();
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Download failed';
          if (msg === 'cancelled') {
            updateJob(surahId, { status: 'cancelled', error: 'Cancelled' });
          } else {
            updateJob(surahId, { status: 'error', error: msg });
          }
        }
      }
    } finally {
      processing.current = false;
      if (pending.current.length > 0) {
        void processQueue();
      }
    }
  }, [refresh, updateJob]);

  const enqueue = useCallback(
    (surahId: number) => {
      if (!supported) return;
      if (pending.current.includes(surahId)) return;
      if (downloaded.some((d) => d.surahId === surahId)) return;
      const existing = jobs[surahId];
      if (existing?.status === 'downloading') return;

      pending.current.push(surahId);
      updateJob(surahId, {
        status: 'queued',
        progress: 0,
        completedAyahs: 0,
        totalAyahs: 0,
        error: undefined,
      });
      void processQueue();
    },
    [supported, downloaded, jobs, updateJob, processQueue],
  );

  const cancel = useCallback(
    (surahId: number) => {
      cancelSurahDownload(surahId);
      // Drop from pending if still queued; in-flight download checks the cancel flag.
      pending.current = pending.current.filter((id) => id !== surahId);
      updateJob(surahId, { status: 'cancelled', error: 'Cancelled' });
    },
    [updateJob],
  );

  const remove = useCallback(
    async (surahId: number) => {
      cancelSurahDownload(surahId);
      pending.current = pending.current.filter((id) => id !== surahId);
      await deleteSurahAudio(surahId);
      setJobs((prev) => {
        const next = { ...prev };
        delete next[surahId];
        return next;
      });
      await refresh();
    },
    [refresh],
  );

  const isDownloaded = useCallback(
    (surahId: number) => downloaded.some((d) => d.surahId === surahId),
    [downloaded],
  );

  const getJob = useCallback((surahId: number) => jobs[surahId], [jobs]);

  const queue = useMemo(
    () =>
      Object.values(jobs)
        .filter((j) => j.status === 'queued' || j.status === 'downloading')
        .sort((a, b) => a.surahId - b.surahId),
    [jobs],
  );

  const value = useMemo(
    () => ({
      supported,
      downloaded,
      ready,
      queue,
      isDownloaded,
      enqueue,
      cancel,
      remove,
      getJob,
      refresh,
    }),
    [
      supported,
      downloaded,
      ready,
      queue,
      isDownloaded,
      enqueue,
      cancel,
      remove,
      getJob,
      refresh,
    ],
  );

  return <DownloadContext.Provider value={value}>{children}</DownloadContext.Provider>;
}

export function useDownloads() {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error('useDownloads must be used within DownloadProvider');
  return ctx;
}
