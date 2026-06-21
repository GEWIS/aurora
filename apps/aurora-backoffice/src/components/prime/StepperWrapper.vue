<template>
  <Stepper linear :value="currentStep">
    <StepList v-if="!vertical">
      <Step v-for="(step, index) in steps" :key="index" :value="(index + 1).toString()">
        {{ step.value }}
      </Step>
    </StepList>

    <StepPanels>
      <StepperWrapper
        v-for="(step, index) in steps"
        :key="step.value"
        :header="step.value"
        :value="(index + 1).toString()"
        :wrap="vertical"
      >
        <StepPanel v-slot="{ activateCallback }" :value="(index + 1).toString()">
          <AppBox class="flex flex-col gap-5 mb-4">
            <slot :name="index + 1" />
            <div class="flex justify-center gap-5">
              <Button
                v-if="index > 0 && !steps[index].previousHidden"
                :disabled="steps[index].previousDisabled || steps[index].previousLoading"
                :icon="
                  steps[index].previousIcon === null
                    ? ''
                    : steps[index].previousIcon
                      ? steps[index].previousIcon
                      : 'pi pi-chevron-left'
                "
                :label="steps[index].previousText"
                :loading="steps[index].previousLoading"
                severity="secondary"
                @click="
                  steps[index].previousFunction?.();
                  steps[index].overridePreviousFunction ? null : activateCallback(index.toString());
                "
              />
              <Button
                v-if="index < steps.length - 1 && !steps[index].nextHidden"
                :disabled="steps[index].nextDisabled || steps[index].nextLoading"
                :icon="
                  steps[index].nextIcon === null
                    ? ''
                    : steps[index].nextIcon
                      ? steps[index].nextIcon
                      : 'pi pi-chevron-right'
                "
                :label="steps[index].nextText"
                :loading="steps[index].nextLoading"
                @click="
                  steps[index].nextFunction?.();
                  steps[index].overrideNextFunction ? null : activateCallback((index + 2).toString());
                "
              />
              <Button
                v-if="index === steps.length - 1 && !steps[index].confirmHidden"
                :disabled="steps[index].confirmDisabled || steps[index].confirmLoading"
                :icon="
                  steps[index].confirmIcon === null
                    ? ''
                    : steps[index].confirmIcon
                      ? steps[index].confirmIcon
                      : 'pi pi-check'
                "
                :label="steps[index].confirmText"
                :loading="steps[index].confirmLoading"
                @click="steps[index].confirmFunction"
              />
            </div>
          </AppBox>
        </StepPanel>
      </StepperWrapper>
    </StepPanels>
  </Stepper>
</template>

<script setup lang="ts">
import StepPanel from 'primevue/steppanel';
import StepList from 'primevue/steplist';
import Stepper from 'primevue/stepper';
import Step from 'primevue/step';
import StepPanels from 'primevue/steppanels';
import { computed } from 'vue';
import StepperWrapper from '@/components/prime/VerticalStepperWrapper.vue';
import AppBox from '@/layout/AppBox.vue';
import { TailwindWidth, useLayoutStore } from '@/stores/layout.store';

interface StepperStep {
  value: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  nextHidden?: boolean;
  nextIcon?: string | null;
  nextText?: string;
  nextFunction?: undefined | (() => void);
  overrideNextFunction?: boolean;
  previousDisabled?: boolean;
  previousLoading?: boolean;
  previousHidden?: boolean;
  previousIcon?: string | null;
  previousText?: string;
  previousFunction?: undefined | (() => void);
  overridePreviousFunction?: boolean;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  confirmHidden?: boolean;
  confirmIcon?: string | null;
  confirmText?: string;
  confirmFunction?: undefined | (() => void);
}

defineProps<{
  steps: StepperStep[];
  currentStep: string;
}>();

const layoutStore = useLayoutStore();
const vertical = computed((): boolean => {
  const windowWidth: number = layoutStore.windowWidth;
  const limit: number = TailwindWidth.sm;
  return windowWidth < limit;
});

export type { StepperStep };
</script>

<style lang="scss">
.p-select-option-label,
.p-select-label {
  text-overflow: ellipsis;
  overflow: hidden;
}

.p-steppanel-content,
.p-steppanel {
  padding-left: 0 !important;
}

.p-stepper-separator {
  display: none;
}

@screen sm {
  .p-stepper-separator {
    display: flex;
  }
}
</style>
