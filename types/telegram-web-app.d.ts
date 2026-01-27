export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    contact?: {
      phone_number: string;
      first_name: string;
      last_name?: string;
      user_id: number;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  viewportWidth: number;
  isClosing: boolean;
  MainButton: {
    show(): void;
    hide(): void;
    setText(text: string): void;
    enable(): void;
    disable(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    showProgress(leaveActive: boolean): void;
    hideProgress(): void;
    isVisible: boolean;
    isProgressVisible: boolean;
    text: string;
  };
  BackButton: {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    isVisible: boolean;
  };
  SettingsButton: {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    isVisible: boolean;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  theme: string;
  headerColor: string;
  backgroundColor: string;
}

declare global {
  interface Window {
    TelegramWebApp?: TelegramWebApp;
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};