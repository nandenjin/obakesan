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
      ref="tooltip"
      class="tooltip"
      :class="{
        'is-active': hover && !disabled && content,
      }"
      :style="{
        left: `${left}px`,
        top: `${top}px`,
      }"
    >
      {{ content }}
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, watch } from "vue";

defineProps<{
  disabled?: boolean;
  content?: string | null;
}>();

const target = useTemplateRef<HTMLElement>("target");
const tooltip = useTemplateRef<HTMLElement>("tooltip");
const hover = ref(false);

const left = ref(0);
const top = ref(0);

const updatePosition = () => {
  if (!target.value || !tooltip.value) return;

  const targetRect = target.value.getBoundingClientRect();
  const tooltipRect = tooltip.value.getBoundingClientRect();

  const leftMax = window.innerWidth - tooltipRect.width - 5;
  const leftMin = 5;

  left.value = Math.min(
    Math.max(targetRect.left - tooltipRect.width / 2, leftMin),
    leftMax
  );

  top.value = targetRect.bottom;
};

watch(hover, async (newVal) => {
  if (newVal) {
    // Determine position immediately
    updatePosition();
  }
});
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
  width: max-content;
  max-width: 300px;
  pointer-events: none;
  transition: opacity 0.1s ease;

  &:not(.is-active) {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
