import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an async loader and tracks { data, loading, error }. Re-runs when deps change.
 * Returns reload() for manual refresh.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const seq = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps)

  const reload = useCallback(async () => {
    const id = ++seq.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await run()
      if (id === seq.current) setState({ data, loading: false, error: null })
    } catch (error) {
      if (id === seq.current) setState((s) => ({ ...s, loading: false, error }))
    }
  }, [run])

  useEffect(() => {
    reload()
  }, [reload])

  return { ...state, reload, setData: (data) => setState((s) => ({ ...s, data })) }
}
