<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content" @click.stop>
      <h3>Marker Info</h3>
      <p>Latitude: {{ lat.toFixed(6) }}</p>
      <p>Longitude: {{ lng.toFixed(6) }}</p>
      <p>{{ message }}</p>
      <button @click="handleClose">Close</button>
      <!-- <button @click="handleOk">OK</button> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  visible: boolean;
  message: string;
  lat: number;
  lng: number;
}>();

const emit = defineEmits<{
  (event: 'update:visible', visible: boolean): void;
  (event: 'marker-action', action: 'add' | 'none'): void;
}>();

const handleClose = () => {
  emit('update:visible', false);
  emit('marker-action', 'none');
};

const handleOk = () => {
  emit('update:visible', false);
  emit('marker-action', 'add'); 
};

</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
  text-align: center;
  position: relative;
}
</style>
