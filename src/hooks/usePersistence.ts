import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { CraftSelection } from '../types/resolver';

interface PersistenceArgs {
  selections: CraftSelection[];
  setSelections: Dispatch<SetStateAction<CraftSelection[]>>;
  modQuantities: Record<string, number>;
  setModQuantities: Dispatch<SetStateAction<Record<string, number>>>;
  collected: Record<string, number>;
  setCollected: Dispatch<SetStateAction<Record<string, number>>>;
}

export function usePersistence({
  selections, setSelections,
  modQuantities, setModQuantities,
  collected, setCollected,
}: PersistenceArgs) {
  const { user } = useAuth();
  const latestState = useRef({ selections, modQuantities, collected });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync with latest state so async callbacks always read fresh values
  latestState.current = { selections, modQuantities, collected };

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem('arc_selections', JSON.stringify(selections));
  }, [selections]);

  useEffect(() => {
    localStorage.setItem('arc_mod_quantities', JSON.stringify(modQuantities));
  }, [modQuantities]);

  useEffect(() => {
    localStorage.setItem('arc_collected', JSON.stringify(collected));
  }, [collected]);

  // On sign-in: load from Firestore, or upload local state on first sign-in
  useEffect(() => {
    if (!user || !db) return;
    const userDoc = doc(db, 'users', user.uid);
    getDoc(userDoc).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSelections(data.selections ?? []);
        setModQuantities(data.modQuantities ?? {});
        setCollected(data.collected ?? {});
      } else {
        // First sign-in — upload current local state to Firestore
        const { selections: s, modQuantities: m, collected: c } = latestState.current;
        setDoc(userDoc, { selections: s, modQuantities: m, collected: c, updatedAt: new Date() });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Debounced Firestore sync when signed in (1.5s after last change)
  useEffect(() => {
    if (!user || !db) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const userDoc = doc(db!, 'users', user.uid);
      const { selections: s, modQuantities: m, collected: c } = latestState.current;
      setDoc(userDoc, { selections: s, modQuantities: m, collected: c, updatedAt: new Date() });
    }, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections, modQuantities, collected, user]);
}
