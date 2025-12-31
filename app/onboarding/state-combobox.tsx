'use client';

import * as React from 'react';
import type { UsState } from '@/types/us-states';
import { filterUsStates } from './us-states';

type Props = {
  /**
   * This is the field name submitted in the form (expects the 2-letter code).
   * Keep this as "state" to preserve existing server action behavior.
   */
  name: string;
  /**
   * Input id for label association (this is the visible search input).
   */
  inputId: string;
  placeholder?: string;
  /**
   * Optional test/DI hook: provide states to skip fetching.
   */
  states?: UsState[];
  onSelect?: (state: UsState | null) => void;
};

export function StateCombobox({
  name,
  inputId,
  placeholder = 'Start typing a state…',
  states,
  onSelect,
}: Props) {
  const [allStates, setAllStates] = React.useState<UsState[]>(states ?? []);
  const [isLoading, setIsLoading] = React.useState(states ? false : true);
  const [loadError, setLoadError] = React.useState<string>('');

  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedCode, setSelectedCode] = React.useState('');

  React.useEffect(() => {
    if (states) return;

    let cancelled = false;
    async function run() {
      setIsLoading(true);
      setLoadError('');
      try {
        const res = await fetch('/api/us-states', { cache: 'force-cache' });
        if (!res.ok) {
          throw new Error(`Failed to load states (${res.status})`);
        }
        const data = (await res.json()) as { states: UsState[] };
        if (!cancelled) {
          setAllStates(Array.isArray(data.states) ? data.states : []);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : 'Failed to load US states'
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [states]);

  const filtered = React.useMemo(() => {
    return filterUsStates(allStates, query).slice(0, 12);
  }, [allStates, query]);

  const selectState = React.useCallback(
    (s: UsState) => {
    setSelectedCode(s.code);
    setQuery(s.name);
    setIsOpen(false);
      onSelect?.(s);
    },
    [onSelect]
  );

  return (
    <div className="relative">
      {/* Hidden input is what gets submitted */}
      <input type="hidden" name={name} value={selectedCode} />

      <input
        id={inputId}
        type="text"
        value={query}
        autoComplete="off"
        placeholder={placeholder}
        className="block w-full rounded-lg border-none bg-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#6c47ff] sm:text-sm sm:leading-6"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={`${inputId}-listbox`}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          // Allow option click handlers to run first
          window.setTimeout(() => setIsOpen(false), 0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          // Force a re-selection if user changes the text after picking
          setSelectedCode('');
          onSelect?.(null);
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false);
        }}
      />

      {isOpen && (
        <div
          className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
          role="presentation"
        >
          <ul
            id={`${inputId}-listbox`}
            role="listbox"
            className="max-h-64 overflow-auto py-1"
          >
            {isLoading && (
              <li className="px-4 py-2 text-sm text-gray-600">Loading…</li>
            )}
            {!isLoading && loadError && (
              <li className="px-4 py-2 text-sm text-red-600">{loadError}</li>
            )}
            {!isLoading && !loadError && filtered.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-600">No matches</li>
            )}
            {!isLoading &&
              !loadError &&
              filtered.map((s) => (
                <li key={s.code} role="option" aria-selected={s.code === selectedCode}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                    onMouseDown={(e) => {
                      // Prevent the input blur from closing before click fires
                      e.preventDefault();
                    }}
                    onClick={() => selectState(s)}
                  >
                    <span className="font-medium">{s.name}</span>{' '}
                    <span className="text-gray-500">({s.code})</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

