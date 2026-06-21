import { defineStore } from 'pinia';

/**
 * window widths defined by Tailwind
 */
enum TailwindWidth {
  sm = 576,
  md = 768,
  lg = 992,
  xl = 1200,
  xxl = 1600,
}

/**
 * Layout store
 * @param menuMobileActive - Whether the menu is active on mobile
 * @param menuDesktopActive - Whether the menu is active on desktop
 * @param darkMode - Whether the dark mode is active
 * @param windowWidth - The width of the window
 */
interface LayoutStore {
  menuMobileActive: boolean;
  menuDesktopActive: boolean;
  darkMode: boolean;
  windowWidth: number;
}

/**
 * Get dark mode from local storage, otherwise match media
 */
function useDarkMode() {
  if (localStorage.getItem('theme')) {
    return localStorage.getItem('theme') === 'dark';
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      localStorage.setItem('theme', 'dark');
      return true;
    } else {
      localStorage.setItem('theme', 'light');
      return false;
    }
  }
}

export const useLayoutStore = defineStore('layout', {
  state: (): LayoutStore => ({
    menuMobileActive: false,
    menuDesktopActive: false,
    darkMode: useDarkMode(),
    windowWidth: window.innerWidth,
  }),
  getters: {
    getMenuMobileActive: (state) => state.menuMobileActive,
    getMenuDesktopActive: (state) => state.menuDesktopActive,
    getDarkMode: (state) => state.darkMode,
    getWindowWidth: (state): number => state.windowWidth,
  },
  actions: {
    /**
     * Initialize the store
     */
    init() {
      this.applyTheme();

      // Open the main menu by default if the screen is large enough
      const bound: number = TailwindWidth.xxl;
      if (this.windowWidth > bound) {
        this.menuDesktopActive = true;
      }
    },
    /**
     * Toggle the menu on mobile
     */
    switchMenuMobile() {
      this.menuMobileActive = !this.menuMobileActive;
    },
    /**
     * Toggle the menu on desktop
     */
    switchMenuDesktop() {
      this.menuDesktopActive = !this.menuDesktopActive;
    },
    /**
     * Toggle the theme
     */
    switchTheme() {
      this.darkMode = !this.darkMode;
      const theme = this.darkMode ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      this.applyTheme();
    },
    /**
     * Apply a specific theme by adding a class to the html element
     */
    applyTheme() {
      const element = document.querySelector('html');
      if (this.darkMode) {
        element!.classList.add('dark-mode');
      } else {
        element!.classList.remove('dark-mode');
      }
    },
    /**
     * Adjust the state width to match the window width
     */
    changeWidth() {
      this.windowWidth = window.innerWidth;
    },
    /**
     * Mount the resize listener to the window
     */
    mountResizeListener() {
      window.addEventListener('resize', this.changeWidth.bind(this));
    },
    /**
     * Unmount the resize listener from the window
     */
    unmountResizeListener() {
      window.removeEventListener('resize', this.changeWidth.bind(this));
    },
  },
});

export { TailwindWidth };
