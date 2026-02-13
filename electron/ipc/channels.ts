export const IPC_CHANNELS = {
  WINDOW: {
    TOGGLE_OVERLAY: 'window:toggle-overlay',
    SET_OPACITY: 'window:set-opacity',
    SET_ALWAYS_ON_TOP: 'window:set-always-on-top',
    SET_CLICK_THROUGH: 'window:set-click-through',
  },
  CONFIG: {
    GET: 'config:get',
    SET: 'config:set',
  },
  HOTKEY: {
    EVENT: 'hotkey:event',
  },
  APP: {
    GET_VERSION: 'app:get-version',
  },
  SERVER: {
    GET_PORT: 'server:get-port',
  },
  TRAY: {
    MUTE_CHANGED: 'tray:mute-changed',
    OVERLAY_TOGGLED: 'tray:overlay-toggled',
  },
} as const;
