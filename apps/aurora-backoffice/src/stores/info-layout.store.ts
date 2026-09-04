import { defineStore } from 'pinia';
import {
  copyInfoLayoutToAll,
  getInfoLayout,
  getInfoWidgetCatalog,
  getScreens,
  setInfoLayout,
  type InfoScreenLayoutResponse,
  type ScreenResponse,
  type WidgetCatalogItem,
  type WidgetPlacement,
} from '@gewis/aurora-api-client';

interface InfoLayoutStore {
  screens: ScreenResponse[];
  catalog: WidgetCatalogItem[];
  selectedScreenId: number | null;
  layout: InfoScreenLayoutResponse | null;
  loading: boolean;
  saving: boolean;
  initialized: boolean;
}

export const useInfoLayoutStore = defineStore('info-layout', {
  state: (): InfoLayoutStore => ({
    screens: [],
    catalog: [],
    selectedScreenId: null,
    layout: null,
    loading: true,
    saving: false,
    initialized: false,
  }),
  getters: {
    /** Catalog items that are placed on the grid (non-modal). */
    placeableCatalog: (state): WidgetCatalogItem[] => state.catalog.filter((w) => !w.modal),
    /** Catalog items that are toggled overlays (modal). */
    modalCatalog: (state): WidgetCatalogItem[] => state.catalog.filter((w) => w.modal),
  },
  actions: {
    async init() {
      if (this.initialized) return;
      this.loading = true;
      await Promise.all([this.fetchScreens(), this.fetchCatalog()]);
      if (this.screens.length > 0) await this.selectScreen(this.screens[0].id);
      this.loading = false;
      this.initialized = true;
    },
    async fetchScreens() {
      const res = await getScreens();
      if (res.response.ok && res.data) this.screens = res.data;
    },
    async fetchCatalog() {
      const res = await getInfoWidgetCatalog();
      if (res.response.ok && res.data) this.catalog = res.data;
    },
    async selectScreen(screenId: number) {
      this.selectedScreenId = screenId;
      const res = await getInfoLayout({ path: { screenId } });
      if (res.response.ok && res.data) this.layout = res.data;
    },
    async save(
      placements: WidgetPlacement[],
      modals: string[],
      background: string,
      backgroundImage: string,
      backgroundColor: string,
      defaultPanelBackground: string,
    ) {
      if (this.selectedScreenId == null) return;
      this.saving = true;
      const res = await setInfoLayout({
        path: { screenId: this.selectedScreenId },
        body: {
          placements,
          modals,
          background,
          backgroundImage,
          backgroundColor,
          defaultPanelBackground,
        },
      });
      if (res.response.ok && res.data) this.layout = res.data;
      this.saving = false;
    },
    async copyToAll() {
      if (this.selectedScreenId == null) return;
      await copyInfoLayoutToAll({ path: { screenId: this.selectedScreenId } });
    },
  },
});
