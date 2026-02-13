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
} as const;
