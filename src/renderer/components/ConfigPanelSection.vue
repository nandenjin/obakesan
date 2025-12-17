<template>
  <div class="editor-group">
    <div class="title">
      <span>{{ title }}</span>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
}>();
</script>

<style scoped>
.editor-group {
  display: grid;
  grid-template-columns: minmax(70px, auto) 1fr;
  gap: 5px;

  & > .title {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 10px;
    font-size: 12px;
  }

  & > .content {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}
</style>
