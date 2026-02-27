import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

export function useSupabase<T>(
    table: string,
    options?: {
        select?: string;
        filter?: (query: any) => any;
        orderBy?: { column: string; ascending?: boolean };
    }
) {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<PostgrestError | Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            let query = supabase.from(table).select(options?.select || '*');

            if (options?.filter) {
                query = options.filter(query);
            }

            if (options?.orderBy) {
                query = query.order(options.orderBy.column, {
                    ascending: options.orderBy.ascending ?? false
                });
            }

            const { data: result, error: supabaseError } = await query;

            if (supabaseError) throw supabaseError;
            setData(result as T[]);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [table, options?.select, options?.orderBy?.column, options?.orderBy?.ascending]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}
