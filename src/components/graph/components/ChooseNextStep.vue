<template>
  <div class="text-bm text-regular mb-m1">Content</div>
  <div class="grid grid-cols-2 gap-m2 mb-m2">
    <div :class="$style.item" @click="emit('select', 'MessageNode')">
      <img class="size-[24px]" src="/automation/whatsapp.png" />
      <span class="text-ll">Send Message</span>
    </div>
  </div>
  <div class="text-bm text-regular mb-m1">Logic</div>
  <div class="grid grid-cols-2 gap-m2">
    <div :class="$style.item" @click="emit('select', 'ConditionNode')">
      <img class="size-[24px]" src="/automation/condition.png" />
      <span class="text-ll">Condition</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
const emit = defineEmits<{
  (e: "select", type: string): void;
}>();
</script>
<style lang="less" module>
.item {
  --at-apply: "flex items-center gap-m1 b-dashed b-[1.5px] b-border rounded-sm px-m1 py-12px cursor-pointer hover:bg-brand/10";
}
</style>
