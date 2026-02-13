export function useElectronAPI() {
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

  const api = isElectron ? (window as any).electronAPI : null;

  return {
    isElectron,
    toggleOverlay: () => api?.toggleOverlay?.(),
    setOpacity: (value: number) => api?.setOpacity?.(value),
    setAlwaysOnTop: (enabled: boolean) => api?.setAlwaysOnTop?.(enabled),
    getVersion: () => api?.getVersion?.() ?? '1.0.0-web',
  };
}
