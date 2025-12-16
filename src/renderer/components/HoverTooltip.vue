<template>
  <span
    ref="target"
    class="hover-tooltip-target"
    @mouseover="hover = true"
    @mouseout="hover = false"
  >
    <slot />
  </span>
  <Teleport to="body">
    <div
      v-if="hover && !disabled && content"
      class="tooltip"
      :style="{
        left: target?.getBoundingClientRect().left + 'px',
        top: target?.getBoundingClientRect().bottom + 'px',
      }"
    >
      {{ content }}
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from "vue";

defineProps<{
  disabled?: boolean;
  content?: string | null;
}>();

const target = useTemplateRef("target");
const hover = ref(false);
</script>

<style scoped>
.tooltip {
  position: absolute;
  background-color: var(--color-background);
  border-radius: 5px;
  padding: 5px;
  border: 1px solid #888;
  transform: translate(0, 5px);
  z-index: 999;
}
</style>
