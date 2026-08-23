import { useState, useCallback, useEffect } from 'react';
import { getOccurrencesForDate } from '../database/occurrencesRepository';
import { useFocusEffect } from 'expo-router';

export function useMedications(dateIso: string) {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOccurrencesForDate(dateIso);
      setOccurrences(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateIso]);

  useFocusEffect(
    useCallback(() => {
      fetchMedications();
    }, [dateIso])
  );

  return { occurrences, loading, refetch: fetchMedications };
}
