<template>
  <div class="flex flex-col gap-4">
    <AppContainer icon="pi-th-large" title="Screen layout editor">
      <template #header>
        <div class="flex flex-wrap items-center gap-2">
          <!-- Saved configurations -->
          <span class="text-sm opacity-70">Configuration</span>
          <Select
            v-model="selectedPresetId"
            class="w-48 text-start"
            option-label="name"
            option-value="id"
            :options="presetStore.presets"
            placeholder="None"
            show-clear
          />
          <Button
            :disabled="selectedPresetId == null"
            icon="pi pi-download"
            label="Load"
            severity="secondary"
            @click="loadPreset"
          />
          <Button
            v-tooltip.top="'Configuration actions'"
            aria-haspopup="true"
            icon="pi pi-ellipsis-v"
            severity="secondary"
            text
            @click="toggleConfigMenu"
          />
          <Menu ref="configMenu" :model="configMenuItems" popup />

          <span class="mx-1 h-6 w-px bg-white/20" />

          <!-- Screen actions -->
          <Button
            :disabled="!store.selectedScreenId"
            icon="pi pi-copy"
            label="Copy to all screens"
            severity="secondary"
            @click="copyToAll"
          />
          <Button
            :disabled="!store.selectedScreenId || store.saving"
            icon="pi pi-save"
            label="Save to screen"
            :loading="store.saving"
            @click="save"
          />
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm opacity-70">Screen</label>
            <Select
              :model-value="store.selectedScreenId"
              option-label="name"
              option-value="id"
              :options="store.screens"
              placeholder="Select a screen"
              @update:model-value="(id: number) => store.selectScreen(id)"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm opacity-70">Background</label>
            <Select
              v-model="background"
              option-label="label"
              option-value="value"
              :options="backgroundOptions"
            />
          </div>
          <div v-if="background === 'image'" class="flex min-w-64 flex-1 flex-col gap-1">
            <label class="text-sm opacity-70">Background image URL</label>
            <InputText v-model="backgroundImage" placeholder="https://…/wallpaper.jpg" />
          </div>
          <div v-if="background === 'color'" class="flex flex-col gap-1">
            <label class="text-sm opacity-70">Background colour</label>
            <div class="flex items-center gap-2">
              <ColorPicker
                format="hex"
                :model-value="backgroundColor.replace('#', '')"
                @update:model-value="(h: string | number) => (backgroundColor = '#' + h)"
              />
              <button
                v-for="p in backgroundColorPresets"
                :key="p.value"
                v-tooltip.top="p.label"
                class="h-7 w-7 rounded border border-white/40 ring-1 ring-inset ring-black/40 ring-offset-1 ring-offset-surface-800 hover:ring-2 hover:ring-primary-400"
                :class="p.value === backgroundColor ? 'ring-2 ring-primary-400' : ''"
                :style="{ backgroundColor: p.value }"
                type="button"
                @click="backgroundColor = p.value"
              />
            </div>
          </div>

          <!-- Widget actions: default widget background + add widget (right-aligned) -->
          <div class="ml-auto flex items-end gap-2">
            <Button severity="secondary" @click="toggleDefaultBg">
              <span
                class="h-5 w-5 shrink-0 rounded border border-white/60 ring-1 ring-black/40"
                :style="bgStyle(defaultPanelBackground)"
              />
              <span>Default widget background</span>
            </Button>
            <Popover ref="defaultBgPanel">
              <div class="flex w-96 flex-col gap-3">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-semibold">Default widget background</span>
                  <Button
                    v-tooltip.top="'Set every widget to this background'"
                    icon="pi pi-clone"
                    label="Apply to all"
                    size="small"
                    text
                    @click="applyDefaultToAll"
                  />
                </div>
                <BackgroundPicker v-model="defaultPanelBackground" :options="panelBgOptions" />
              </div>
            </Popover>
            <Button icon="pi pi-plus" label="Add widget" @click="openAdd" />
          </div>
        </div>

        <!-- Modal overlays (toggled, not placed) -->
        <div class="flex flex-col gap-1">
          <label class="text-sm opacity-70">Overlays</label>
          <div class="flex flex-wrap gap-4">
            <div v-for="w in store.modalCatalog" :key="w.id" class="flex items-center gap-2">
              <Checkbox v-model="modals" :input-id="`modal-${w.id}`" :value="w.id" />
              <label :for="`modal-${w.id}`">{{ w.name }}</label>
            </div>
          </div>
        </div>

        <!-- Grid editor -->
        <div class="rounded-md border border-gray-600 bg-black/20 p-2">
          <GridLayout
            v-model:layout="items"
            :col-num="9"
            :is-draggable="true"
            :is-resizable="true"
            :margin="[6, 6]"
            :responsive="false"
            :row-height="44"
          >
            <GridItem
              v-for="item in items"
              :key="item.i"
              :h="item.h"
              :i="item.i"
              :max-h="item.maxH"
              :max-w="item.maxW"
              :min-h="item.minH"
              :min-w="item.minW"
              :static="item.locked"
              :w="item.w"
              :x="item.x"
              :y="item.y"
            >
              <div
                class="flex h-full w-full flex-col overflow-hidden rounded border border-white/20 bg-black/20 p-2 text-white"
                :class="{ 'opacity-70': item.locked }"
                :style="tilePreviewStyle(item)"
              >
                <div class="flex items-center justify-between gap-1">
                  <span class="flex min-w-0 items-center gap-1.5">
                    <i class="pi text-xs" :class="catalogItem(item.type)?.icon" />
                    <span class="truncate text-sm font-semibold">{{ label(item.type) }}</span>
                  </span>
                  <div class="flex items-center gap-1.5">
                    <i
                      v-if="!item.locked"
                      v-tooltip.top="'Settings'"
                      class="pi pi-cog cursor-pointer text-xs"
                      @click.stop="openSettings(item)"
                      @mousedown.stop
                    />
                    <i
                      v-tooltip.top="item.locked ? 'Unlock' : 'Lock'"
                      class="cursor-pointer text-xs"
                      :class="item.locked ? 'pi pi-lock' : 'pi pi-lock-open'"
                      @click.stop="item.locked = !item.locked"
                      @mousedown.stop
                    />
                    <i
                      v-tooltip.top="'Remove'"
                      class="pi pi-times cursor-pointer text-xs"
                      @click.stop="removeWidget(item.i)"
                      @mousedown.stop
                    />
                  </div>
                </div>

                <!-- Container child manager (fills the tile) -->
                <template v-if="isContainer(item.type)">
                  <div class="mt-2 flex min-h-0 flex-1 items-stretch gap-2">
                    <!-- empty + editable: one big add box -->
                    <div
                      v-if="item.children.length === 0 && !item.locked"
                      v-tooltip.top="'Add widget'"
                      class="flex min-h-0 min-w-0 flex-1 cursor-pointer items-center justify-center rounded bg-black/30"
                      @click.stop="openAddChild(item, 0)"
                      @mousedown.stop
                    >
                      <i class="pi pi-plus text-2xl" />
                    </div>

                    <!-- empty + locked -->
                    <div
                      v-else-if="item.children.length === 0"
                      class="flex min-h-0 min-w-0 flex-1 items-center justify-center rounded bg-black/30"
                    >
                      <i class="pi pi-lock text-2xl opacity-40" />
                    </div>

                    <template v-else>
                      <!-- left control: prev, or add-before at the start (editable only) -->
                      <i
                        v-if="item.childIndex > 0"
                        class="pi pi-chevron-left flex cursor-pointer items-center self-center text-base"
                        @click.stop="item.childIndex--"
                        @mousedown.stop
                      />
                      <i
                        v-else-if="!item.locked"
                        v-tooltip.top="'Add before'"
                        class="pi pi-plus flex cursor-pointer items-center self-center text-base"
                        @click.stop="openAddChild(item, 0)"
                        @mousedown.stop
                      />

                      <!-- current child: fills the tile; name + controls in the header
                           (so the text is never clipped on short tiles) -->
                      <div
                        class="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded bg-black/30 p-2"
                      >
                        <div class="flex shrink-0 items-center justify-between gap-1">
                          <span class="flex min-w-0 items-center gap-1.5">
                            <i
                              class="pi text-xs"
                              :class="catalogItem(currentChild(item)?.type)?.icon"
                            />
                            <span class="truncate text-xs font-semibold">
                              {{ label(currentChild(item)?.type ?? '') }}
                            </span>
                          </span>
                          <div v-if="!item.locked" class="flex shrink-0 items-center gap-2">
                            <i
                              v-tooltip.top="'Configure'"
                              class="pi pi-cog cursor-pointer text-xs"
                              @click.stop="openChildSettings(item)"
                              @mousedown.stop
                            />
                            <i
                              v-tooltip.top="'Remove'"
                              class="pi pi-times cursor-pointer text-xs"
                              @click.stop="removeChild(item)"
                              @mousedown.stop
                            />
                          </div>
                        </div>
                        <div
                          class="flex min-h-0 flex-1 items-center justify-center overflow-hidden"
                        >
                          <i
                            class="pi text-3xl opacity-40"
                            :class="catalogItem(currentChild(item)?.type)?.icon"
                          />
                        </div>
                      </div>

                      <!-- right control: next, or add-after at the end (editable only) -->
                      <i
                        v-if="item.childIndex < item.children.length - 1"
                        class="pi pi-chevron-right flex cursor-pointer items-center self-center text-base"
                        @click.stop="item.childIndex++"
                        @mousedown.stop
                      />
                      <i
                        v-else-if="!item.locked"
                        v-tooltip.top="'Add after'"
                        class="pi pi-plus flex cursor-pointer items-center self-center text-base"
                        @click.stop="openAddChild(item, item.children.length)"
                        @mousedown.stop
                      />
                    </template>
                  </div>
                  <span class="mt-2 text-center text-[10px] opacity-60">
                    {{
                      item.children.length
                        ? `${item.childIndex + 1} / ${item.children.length}`
                        : 'empty'
                    }}
                  </span>
                </template>
                <span v-else class="mt-auto text-xs opacity-70">{{ item.w }}×{{ item.h }}</span>
              </div>
            </GridItem>
          </GridLayout>
        </div>
      </div>
    </AppContainer>

    <!-- Add widget dialog -->
    <Dialog v-model:visible="addVisible" header="Add widget" modal>
      <div class="flex flex-col gap-4 w-96">
        <Select
          v-model="addChoice"
          filter
          fluid
          option-group-children="items"
          option-group-label="label"
          option-label="name"
          option-value="id"
          :options="addOptions"
          placeholder="Search a widget"
        >
          <template #option="{ option }">
            <span class="flex items-center gap-2">
              <i class="pi" :class="option.icon" />
              {{ option.name }}
            </span>
          </template>
        </Select>
        <small class="opacity-60">The same widget can be added multiple times.</small>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="addVisible = false" />
        <Button :disabled="!addChoice" label="Add" @click="confirmAdd" />
      </template>
    </Dialog>

    <!-- Add child widget dialog -->
    <Dialog v-model:visible="addChildVisible" header="Add widget to container" modal>
      <div class="flex flex-col gap-4 w-96">
        <Select
          v-model="addChildChoice"
          filter
          fluid
          option-label="name"
          option-value="id"
          :options="childCatalog"
          placeholder="Search a widget"
        >
          <template #option="{ option }">
            <span class="flex items-center gap-2">
              <i class="pi" :class="option.icon" />
              {{ option.name }}
            </span>
          </template>
        </Select>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="addChildVisible = false" />
        <Button :disabled="!addChildChoice" label="Add" @click="confirmAddChild" />
      </template>
    </Dialog>

    <!-- Per-widget settings dialog -->
    <Dialog
      v-model:visible="settingsVisible"
      :header="settingsItem ? `${label(settingsItem.type)} settings` : 'Settings'"
      modal
    >
      <div v-if="settingsItem" class="flex flex-col gap-4 w-96">
        <SettingsControls
          :schema="settingsSchemaRaw"
          :values="settingsItem.settings"
          @update="setSetting"
        />
      </div>
      <template #footer>
        <Button label="Done" @click="settingsVisible = false" />
      </template>
    </Dialog>

    <!-- Child settings dialog (widget settings + container behaviour) -->
    <Dialog
      v-model:visible="childSettingsVisible"
      :header="childCtx ? `${label(childCtx.child.type)} settings` : 'Settings'"
      modal
    >
      <div v-if="childCtx" class="flex flex-col gap-4 w-96">
        <div class="text-xs uppercase tracking-wide opacity-50">Widget</div>
        <SettingsControls
          :schema="childWidgetSchema"
          :values="childCtx.child.settings"
          @update="setChildSetting"
        />
        <template v-if="childContainerSchema.length">
          <div
            class="mt-2 border-t border-gray-600 pt-3 text-xs uppercase tracking-wide opacity-50"
          >
            Behaviour
          </div>
          <SettingsControls
            :schema="childContainerSchema"
            :values="childCtx.child.containerSettings"
            @update="setChildContainerSetting"
          />
        </template>
      </div>
      <template #footer>
        <Button label="Done" @click="childSettingsVisible = false" />
      </template>
    </Dialog>

    <!-- Save-as-configuration dialog -->
    <Dialog v-model:visible="saveAsVisible" header="Save configuration" modal>
      <div class="flex w-96 flex-col gap-1">
        <label class="text-sm opacity-70">Configuration name</label>
        <InputText
          v-model="saveAsName"
          autofocus
          placeholder="e.g. Borrel night"
          @keyup.enter="confirmSaveAs"
        />
        <small class="opacity-60">Saving under an existing name creates a new configuration.</small>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="saveAsVisible = false" />
        <Button :disabled="!saveAsName.trim()" label="Save" @click="confirmSaveAs" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { MenuItem } from 'primevue/menuitem';
import type Menu from 'primevue/menu';
import type Popover from 'primevue/popover';
import { GridItem, GridLayout } from 'grid-layout-plus';
import {
  type LayoutPresetResponse,
  type WidgetCatalogItem,
  WidgetCategory,
  type WidgetPlacement,
  type WidgetSetting,
  type WidgetSettingOption,
  type WidgetSettingValue,
} from '@gewis/aurora-api-client';
import AppContainer from '@/layout/AppContainer.vue';
import SettingsControls from '@/views/Info/SettingsControls.vue';
import BackgroundPicker from '@/views/Info/BackgroundPicker.vue';
import { bgStyle } from '@/views/Info/background';
import { useInfoLayoutStore } from '@/stores/info-layout.store';
import { useInfoLayoutPresetStore } from '@/stores/info-layout-preset.store';

interface ChildItemData {
  i: string;
  type: string;
  settings: Record<string, WidgetSettingValue>;
  containerSettings: Record<string, WidgetSettingValue>;
}

interface GridItemData {
  i: string; // instanceId
  type: string; // catalog widget id
  x: number;
  y: number;
  w: number;
  h: number;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  locked: boolean; // user-facing "locked" state
  /** Mirror of `locked` — grid-layout-plus reads `static` off the layout objects. */
  readonly static: boolean;
  settings: Record<string, WidgetSettingValue>;
  children: ChildItemData[]; // for container widgets
  childIndex: number; // editor navigation state (not saved)
}

/**
 * Wrap grid-item data so grid-layout-plus keeps seeing a `static` property (used
 * by its compaction/collision helpers) while our code works with `locked`.
 */
function gridItem(data: Omit<GridItemData, 'static'>): GridItemData {
  return {
    ...data,
    get static() {
      return this.locked;
    },
  };
}

const store = useInfoLayoutStore();
const presetStore = useInfoLayoutPresetStore();

const items = ref<GridItemData[]>([]);
const modals = ref<string[]>([]);
const background = ref<string>('hexagons');
const backgroundImage = ref<string>('');
const backgroundColor = ref<string>('#0b1020');
const defaultPanelBackground = ref<string>('#374151|50|1|1');

const selectedPresetId = ref<number | null>(null);
const saveAsVisible = ref(false);
const saveAsName = ref('');
const configMenu = ref<InstanceType<typeof Menu>>();
const defaultBgPanel = ref<InstanceType<typeof Popover>>();

const addVisible = ref(false);
const addChoice = ref<string | null>(null);
const addChildVisible = ref(false);
const addChildChoice = ref<string | null>(null);
const addChildCtx = ref<{ container: GridItemData; index: number } | null>(null);
const settingsVisible = ref(false);
const settingsItem = ref<GridItemData | null>(null);
const childSettingsVisible = ref(false);
const childCtx = ref<{ container: GridItemData; child: ChildItemData } | null>(null);

const backgroundOptions = [
  { label: 'Hexagons', value: 'hexagons' },
  { label: 'Gradient', value: 'gradient' },
  { label: 'Grid', value: 'grid' },
  { label: 'Solid colour', value: 'color' },
  { label: 'Custom image', value: 'image' },
];

const backgroundColorPresets = [
  { label: 'Midnight', value: '#0b1020' },
  { label: 'Black', value: '#000000' },
  { label: 'Slate', value: '#0f172a' },
  { label: 'Red', value: '#8b1a1a' },
  { label: 'Blue', value: '#1e3a8a' },
  { label: 'Green', value: '#064e3b' },
];

onMounted(async () => {
  await Promise.all([store.init(), presetStore.fetch()]);
});

function catalogItem(id: string | undefined): WidgetCatalogItem | undefined {
  return id ? store.catalog.find((w) => w.id === id) : undefined;
}

/** Panel-background preset swatches, sourced from the catalog's setting schema. */
const panelBgOptions = computed<WidgetSettingOption[]>(() => {
  for (const w of store.catalog) {
    const s = (w.settings ?? []).find((x) => x.key === 'panelBackground');
    if (s?.options) return s.options;
  }
  return [];
});

function label(id: string): string {
  return catalogItem(id)?.name ?? id;
}

function isContainer(id: string): boolean {
  return !!catalogItem(id)?.container;
}

const byName = (a: WidgetCatalogItem, b: WidgetCatalogItem) => a.name.localeCompare(b.name);

/** Category order and labels for the palette. */
const CATEGORY_LABELS: { value: WidgetCategory; label: string }[] = [
  { value: WidgetCategory.INFORMATION, label: 'Information' },
  { value: WidgetCategory.ROOM, label: 'The room' },
  { value: WidgetCategory.CONTENT, label: 'Content' },
  { value: WidgetCategory.CONTAINER, label: 'Containers' },
];

/**
 * Options for the "add widget" picker, grouped by what a widget is for and
 * sorted by name within each group — the catalog's own order is definition
 * order, which is arbitrary to someone hunting for a widget. A category the
 * core added but this list does not know about still shows, at the end.
 */
const addOptions = computed(() => {
  const known = CATEGORY_LABELS.map((c) => c.value);
  const extra = [...new Set(store.placeableCatalog.map((w) => w.category))]
    .filter((c) => !known.includes(c))
    .map((c) => ({ value: c, label: c }));

  return [...CATEGORY_LABELS, ...extra]
    .map(({ value, label }) => ({
      label,
      items: store.placeableCatalog.filter((w) => w.category === value).sort(byName),
    }))
    .filter((group) => group.items.length > 0);
});

/** Widgets that may be placed inside a container (no nesting). */
const childCatalog = computed<WidgetCatalogItem[]>(() =>
  store.catalog.filter((w) => !w.modal && !w.container).sort(byName),
);

function defaultsFrom(schema: WidgetSetting[] | undefined): Record<string, WidgetSettingValue> {
  const out: Record<string, WidgetSettingValue> = {};
  (schema ?? []).forEach((s) => {
    out[s.key] = s.default;
  });
  return out;
}

const defaultSettings = (type: string) => defaultsFrom(catalogItem(type)?.settings);
const defaultChildSettings = (containerType: string) =>
  defaultsFrom(catalogItem(containerType)?.childSettings);

/** Whether a widget type exposes the `panelBackground` card-background setting. */
function hasPanelBg(type: string): boolean {
  return (catalogItem(type)?.settings ?? []).some((s) => s.key === 'panelBackground');
}

/** Overwrite a widget's panel background with the configured screen default. */
function applyDefaultBg(type: string, settings: Record<string, WidgetSettingValue>) {
  if (hasPanelBg(type)) settings.panelBackground = defaultPanelBackground.value;
}

/** Fresh settings for a new widget, seeded with the default panel background. */
function newSettings(type: string): Record<string, WidgetSettingValue> {
  const settings = defaultSettings(type);
  applyDefaultBg(type, settings);
  return settings;
}

function currentChild(item: GridItemData): ChildItemData | undefined {
  return item.children[item.childIndex];
}

function toGridItem(p: WidgetPlacement): GridItemData | null {
  const c = catalogItem(p.id);
  if (!c) return null;
  const children = (p.children ?? [])
    .map((ch): ChildItemData | null => {
      if (!catalogItem(ch.id)) return null;
      return {
        i: ch.instanceId,
        type: ch.id,
        settings: { ...defaultSettings(ch.id), ...(ch.settings ?? {}) },
        containerSettings: { ...defaultChildSettings(p.id), ...(ch.containerSettings ?? {}) },
      };
    })
    .filter((x): x is ChildItemData => x !== null);
  return gridItem({
    i: p.instanceId,
    type: p.id,
    x: p.x,
    y: p.y,
    w: p.w,
    h: p.h,
    minW: c.minW,
    maxW: c.maxW,
    minH: c.minH,
    maxH: c.maxH,
    locked: !!p.locked,
    settings: { ...defaultSettings(p.id), ...(p.settings ?? {}) },
    children,
    childIndex: 0,
  });
}

/** Load a layout/preset config (placements + backgrounds) into the editor. */
function applyConfig(cfg: {
  placements: WidgetPlacement[];
  modals: string[];
  background?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  defaultPanelBackground?: string;
}) {
  items.value = cfg.placements.map(toGridItem).filter((x): x is GridItemData => x !== null);
  modals.value = [...cfg.modals];
  background.value = cfg.background ?? 'hexagons';
  backgroundImage.value = cfg.backgroundImage ?? '';
  backgroundColor.value = cfg.backgroundColor ?? '#0b1020';
  defaultPanelBackground.value = cfg.defaultPanelBackground ?? '#374151|50|1|1';
}

// Rebuild the editor whenever the selected screen's layout loads.
watch(
  () => store.layout,
  (layout) => {
    if (!layout) {
      items.value = [];
      modals.value = [];
      return;
    }
    applyConfig(layout);
  },
  { immediate: true },
);

function openAdd() {
  addChoice.value = null;
  addVisible.value = true;
}

function confirmAdd() {
  const type = addChoice.value;
  const c = type ? catalogItem(type) : undefined;
  if (!type || !c) return;
  items.value.push(
    gridItem({
      i: uuidv4(),
      type,
      x: 0,
      y: 0,
      w: c.defaultW,
      h: c.defaultH,
      minW: c.minW,
      maxW: c.maxW,
      minH: c.minH,
      maxH: c.maxH,
      locked: false,
      settings: newSettings(type),
      children: [],
      childIndex: 0,
    }),
  );
  addVisible.value = false;
}

function removeWidget(instanceId: string) {
  items.value = items.value.filter((i) => i.i !== instanceId);
}

// --- children -------------------------------------------------------------

function openAddChild(container: GridItemData, index: number) {
  addChildCtx.value = { container, index };
  addChildChoice.value = null;
  addChildVisible.value = true;
}

function confirmAddChild() {
  const ctx = addChildCtx.value;
  const type = addChildChoice.value;
  if (!ctx || !type || !catalogItem(type)) return;
  ctx.container.children.splice(ctx.index, 0, {
    i: uuidv4(),
    type,
    settings: newSettings(type),
    containerSettings: defaultChildSettings(ctx.container.type),
  });
  ctx.container.childIndex = ctx.index;
  addChildVisible.value = false;
}

function removeChild(container: GridItemData) {
  container.children.splice(container.childIndex, 1);
  if (container.childIndex >= container.children.length) {
    container.childIndex = Math.max(0, container.children.length - 1);
  }
}

function openChildSettings(container: GridItemData) {
  const child = currentChild(container);
  if (!child) return;
  childCtx.value = { container, child };
  childSettingsVisible.value = true;
}

const childWidgetSchema = computed<WidgetSetting[]>(() =>
  childCtx.value ? (catalogItem(childCtx.value.child.type)?.settings ?? []) : [],
);
const childContainerSchema = computed<WidgetSetting[]>(() =>
  childCtx.value ? (catalogItem(childCtx.value.container.type)?.childSettings ?? []) : [],
);

function setChildSetting(key: string, value: WidgetSettingValue) {
  if (childCtx.value) childCtx.value.child.settings[key] = value;
}
function setChildContainerSetting(key: string, value: WidgetSettingValue) {
  if (childCtx.value) childCtx.value.child.containerSettings[key] = value;
}

// --- settings + save ------------------------------------------------------

const settingsSchemaRaw = computed<WidgetSetting[]>(() =>
  settingsItem.value ? (catalogItem(settingsItem.value.type)?.settings ?? []) : [],
);

function openSettings(item: GridItemData) {
  if (item.locked) return; // locked widgets cannot be edited
  settingsItem.value = item;
  settingsVisible.value = true;
}

function setSetting(key: string, value: WidgetSettingValue) {
  if (settingsItem.value) settingsItem.value.settings[key] = value;
}

/** Snapshot the editor's grid items as catalog WidgetPlacements. */
function buildPlacements(): WidgetPlacement[] {
  return items.value.map((item) => ({
    instanceId: item.i,
    id: item.type,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    locked: item.locked,
    settings: item.settings,
    children: isContainer(item.type)
      ? item.children.map((c) => ({
          instanceId: c.i,
          id: c.type,
          settings: c.settings,
          containerSettings: c.containerSettings,
        }))
      : undefined,
  }));
}

async function save() {
  await store.save(
    buildPlacements(),
    modals.value,
    background.value,
    backgroundImage.value,
    backgroundColor.value,
    defaultPanelBackground.value,
  );
}

/**
 * Set every unlocked widget's (and its container children's) card background to
 * the default. Locked widgets keep their settings untouched.
 */
function applyDefaultToAll() {
  items.value.forEach((item) => {
    if (item.locked) return;
    applyDefaultBg(item.type, item.settings);
    item.children.forEach((c) => applyDefaultBg(c.type, c.settings));
  });
}

// --- saved configurations (presets) ---------------------------------------

/** Current editor state as a preset payload under the given name. */
function presetPayload(name: string) {
  return {
    name,
    placements: buildPlacements(),
    modals: modals.value,
    background: background.value,
    backgroundImage: backgroundImage.value,
    backgroundColor: backgroundColor.value,
    defaultPanelBackground: defaultPanelBackground.value,
  };
}

const selectedPreset = computed<LayoutPresetResponse | undefined>(() =>
  presetStore.presets.find((p) => p.id === selectedPresetId.value),
);

/** Load the selected saved configuration into the editor (not yet persisted). */
function loadPreset() {
  const preset = selectedPreset.value;
  if (preset) applyConfig(preset);
}

function openSaveAs() {
  saveAsName.value = selectedPreset.value?.name ?? '';
  saveAsVisible.value = true;
}

async function confirmSaveAs() {
  const name = saveAsName.value.trim();
  if (!name) return;
  const created = await presetStore.create(presetPayload(name));
  if (created) selectedPresetId.value = created.id;
  saveAsVisible.value = false;
}

/** Overwrite the selected saved configuration with the current editor state. */
async function updatePreset() {
  const preset = selectedPreset.value;
  if (!preset) return;
  await presetStore.update(preset.id, presetPayload(preset.name));
}

async function deletePreset() {
  if (selectedPresetId.value == null) return;
  await presetStore.remove(selectedPresetId.value);
  selectedPresetId.value = null;
}

function toggleConfigMenu(event: Event) {
  configMenu.value?.toggle(event);
}

function toggleDefaultBg(event: Event) {
  defaultBgPanel.value?.toggle(event);
}

/** Overflow menu for the header's configuration actions. */
const configMenuItems = computed<MenuItem[]>(() => [
  { label: 'Save as new configuration…', icon: 'pi pi-plus', command: () => openSaveAs() },
  {
    label: 'Update selected configuration',
    icon: 'pi pi-save',
    disabled: selectedPresetId.value == null,
    command: () => void updatePreset(),
  },
  { separator: true },
  {
    label: 'Delete configuration',
    icon: 'pi pi-trash',
    disabled: selectedPresetId.value == null,
    command: () => void deletePreset(),
  },
]);

/** Preview a widget tile with its configured panel background (containers transparent). */
function tilePreviewStyle(item: GridItemData): Record<string, string> {
  if (isContainer(item.type)) return {};
  return bgStyle(String(item.settings.panelBackground ?? ''));
}

async function copyToAll() {
  await store.copyToAll();
}
</script>
