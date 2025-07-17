"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { Section } from "@/types/section";

interface SectionsContextValue {
  sections: Section[];
  status: "loading" | "ready" | "error";
  error: string | null;
  refetch: () => Promise<void>;
  addSection: (section: Section) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  removeSection: (id: string) => void;
}

const SectionsContext = createContext<SectionsContextValue | undefined>(undefined);

export const useSections = () => {
  const context = useContext(SectionsContext);
  if (!context) {
    throw new Error("useSections must be used within a SectionsProvider");
  }
  return context;
};

export function SectionsProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [status, setStatus] = useState<SectionsContextValue["status"]>("loading");
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setStatus("loading");
      setError(null);

      // Call the API route instead of direct database access
      const response = await fetch('/api/sections', {
        cache: 'no-store', // Adjust caching strategy as needed
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sections: ${response.statusText}`);
      }

      const data = await response.json();
      setSections(data);
      setStatus("ready");
    } catch (err) {
      console.error("Failed to fetch sections:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch sections";
      setError(errorMessage);
      setStatus("error");
    }
  }, []);

  const refetch = useCallback(async () => {
   console.log('Refetching Sections!')
    await fetchSections();
  }, [fetchSections]);

  // Optimistic updates for better UX
  const addSection = useCallback((section: Section) => {
    setSections(prev => [...prev, section]);
  }, []);

  const updateSection = useCallback((id: string, updates: Partial<Section>) => {
    setSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, ...updates } : section
      )
    );
  }, []);

  const removeSection = useCallback((id: string) => {
    setSections(prev =>
      prev.filter(section => section.id !== id)
    );
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const value: SectionsContextValue = {
    sections,
    status,
    error,
    refetch,
    addSection,
    updateSection,
    removeSection,
  };

  return (
    <SectionsContext.Provider value={value}>
      {children}
    </SectionsContext.Provider>
  );
}
