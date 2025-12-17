<template>
  <span v-if="props.icon" class="badge" :class="icon">
    <svg width="100%" height="100%" class="logo" viewBox="0 0 94 94">
      <g v-if="props.icon === 'failed'" class="failed">
        <path
          d="M41.072,46.729l-18.826,-18.826l5.657,-5.657l18.826,18.826l18.826,-18.826l5.657,5.657l-18.826,18.826l18.826,18.826l-5.657,5.657l-18.826,-18.826l-18.826,18.826l-5.657,-5.657l18.826,-18.826Z"
        />
      </g>
      <g v-else-if="props.icon === 'in-progress'" class="in-progress">
        <rect x="16.527" y="40.642" width="11.934" height="12.175" />
        <rect x="40.826" y="40.642" width="11.934" height="12.175" />
        <rect x="64.361" y="40.642" width="11.934" height="12.175" />
      </g>
      <g v-else-if="props.icon === 'connected'" class="connected">
        <path
          d="M14.399,50.635l4.923,-6.306l18.186,14.198l35.766,-32.422l5.373,5.927l-40.755,36.944l-23.494,-18.342Z"
        />
      </g>
      <g v-else-if="props.icon === 'default'" class="default">
        <circle cx="47" cy="47" r="10" />
      </g>
    </svg>
  </span>
</template>

<script lang="ts" setup>
const props = defineProps<{
  icon?: "failed" | "in-progress" | "connected" | "default";
}>();
</script>

<style scoped>
.badge {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border: 1px solid var(--color-primary);
  border-radius: 50%;
  vertical-align: middle;
  line-height: 0;

  &.failed {
    background-color: #f44;
    border: none;

    .logo {
      fill: var(--color-background);
    }
  }

  &.in-progress {
    background-color: #fb4;
    border: none;

    .logo {
      fill: var(--color-background);
    }
  }

  &.connected {
    border-color: #4f4;

    .logo {
      fill: #4f4;
    }
  }

  &.default {
    border-color: #888;

    .logo {
      fill: #888;
    }
  }
}

.logo {
  width: 100%;
  height: 100%;
  fill: var(--color-primary);
}
</style>
