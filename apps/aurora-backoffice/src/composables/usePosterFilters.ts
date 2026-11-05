import { ref, computed, type MaybeRefOrGetter } from 'vue';
import type { PosterType, PosterResponse } from '@gewis/aurora-api-client';
import { toValue } from 'vue';
import { getPosterStatus, posterStatusLabels, type PosterStatus } from '@/utils/posterUtils';
import { usePosterStore } from '@/stores/poster/poster.store';

const posterStore = usePosterStore();
void posterStore.init();

export function usePosterFilters(source: MaybeRefOrGetter<PosterResponse[]>) {
  const search = ref('');
  const selectedTypes = ref<PosterType[] | null>([]);
  const selectedStatuses = ref<PosterStatus[] | null>([]);

  const typeOptions = computed(() => [...new Set(posterStore.posters.map((p) => p.type))].sort());

  const statusOptions = Object.entries(posterStatusLabels).map(([value, label]) => ({
    label,
    value,
  }));
  const filteredPosters = computed(() => {
    const q = search.value.trim().toLowerCase();
    return toValue(source).filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!selectedTypes.value?.length || selectedTypes.value.includes(p.type)) &&
        (!selectedStatuses.value?.length || selectedStatuses.value.includes(getPosterStatus(p))),
    );
  });

  return { search, selectedTypes, selectedStatuses, typeOptions, statusOptions, filteredPosters };
}
