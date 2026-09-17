import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  bookmarkKey,
  loadBookmarks,
  loadLastRead,
  saveBookmarks,
  saveLastRead,
} from '@/lib/storage';
import type { Bookmark, LastRead } from '@/lib/types';

type BookmarksContextValue = {
  bookmarks: Bookmark[];
  lastRead: LastRead | null;
  ready: boolean;
  isBookmarked: (surahId: number, ayahId: number) => boolean;
  toggleBookmark: (surahId: number, ayahId: number) => void;
  removeBookmark: (surahId: number, ayahId: number) => void;
  setLastReadPosition: (surahId: number, ayahId: number) => void;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([loadBookmarks(), loadLastRead()]).then(([b, l]) => {
      setBookmarks(b);
      setLastRead(l);
      setReady(true);
    });
  }, []);

  const isBookmarked = useCallback(
    (surahId: number, ayahId: number) =>
      bookmarks.some((b) => b.surahId === surahId && b.ayahId === ayahId),
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (surahId: number, ayahId: number) => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.surahId === surahId && b.ayahId === ayahId);
        const next = exists
          ? prev.filter((b) => !(b.surahId === surahId && b.ayahId === ayahId))
          : [{ surahId, ayahId, createdAt: Date.now() }, ...prev];
        void saveBookmarks(next);
        return next;
      });
    },
    [],
  );

  const removeBookmark = useCallback((surahId: number, ayahId: number) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => !(b.surahId === surahId && b.ayahId === ayahId));
      void saveBookmarks(next);
      return next;
    });
  }, []);

  const setLastReadPosition = useCallback((surahId: number, ayahId: number) => {
    const next: LastRead = { surahId, ayahId, updatedAt: Date.now() };
    setLastRead(next);
    void saveLastRead(next);
  }, []);

  const value = useMemo(
    () => ({
      bookmarks,
      lastRead,
      ready,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
      setLastReadPosition,
    }),
    [bookmarks, lastRead, ready, isBookmarked, toggleBookmark, removeBookmark, setLastReadPosition],
  );

  // silence unused helper warning in some tooling
  void bookmarkKey;

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider');
  return ctx;
}
