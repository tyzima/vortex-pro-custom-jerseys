import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SportDefinition } from '../types';
import { getTemplateLibrary } from '../lib/templateService';

interface TemplateLibraryContextType {
  library: Record<string, SportDefinition> | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const TemplateLibraryContext = createContext<TemplateLibraryContextType | undefined>(undefined);

const CACHE_KEY = 'template_library_v1';
const CACHE_TTL = 60 * 60 * 1000;

interface CachedData {
  library: Record<string, SportDefinition>;
  timestamp: number;
  version: string;
}

function getCachedLibrary(): Record<string, SportDefinition> | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.library;
  } catch (error) {
    console.error('Error reading cached library:', error);
    return null;
  }
}

function setCachedLibrary(library: Record<string, SportDefinition>): void {
  try {
    const data: CachedData = {
      library,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching library:', error);
  }
}

export function TemplateLibraryProvider({ children }: { children: React.ReactNode }) {
  const [library, setLibrary] = useState<Record<string, SportDefinition> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLibrary = useCallback(async (useCache = true) => {
    setLoading(true);
    setError(null);

    try {
      if (useCache) {
        const cached = getCachedLibrary();
        if (cached) {
          setLibrary(cached);
          setLoading(false);
          return;
        }
      }

      const fetchedLibrary = await getTemplateLibrary();
      setLibrary(fetchedLibrary);
      setCachedLibrary(fetchedLibrary);
    } catch (err) {
      console.error('Error loading template library:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template library');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadLibrary(false);
  }, [loadLibrary]);

  useEffect(() => {
    loadLibrary(true);
  }, [loadLibrary]);

  return (
    <TemplateLibraryContext.Provider value={{ library, loading, error, refresh }}>
      {children}
    </TemplateLibraryContext.Provider>
  );
}

export function useTemplateLibrary() {
  const context = useContext(TemplateLibraryContext);
  if (context === undefined) {
    throw new Error('useTemplateLibrary must be used within a TemplateLibraryProvider');
  }
  return context;
}
