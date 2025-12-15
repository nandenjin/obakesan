<template>
  <span class="badge">{{ props.status }}</span>
</template>

<script lang="ts" setup>
import { useStatusStore } from "../../store/status";

const props = defineProps<{
  status: ReturnType<typeof useStatusStore>["input"]["connection"];
  reasons: ReturnType<typeof useStatusStore>["input"]["reasons"];
}>();
</script>

<style scoped>
.badge {
}
</style>
