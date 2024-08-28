<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content" @click.stop>
      <img src="/pin.png" class="logo" alt="Imagen Pin" /> <br>
      <h3>{{ dataMapPage.text[0].title }}</h3><br>
      <p>{{ dataMapPage.text[0].name }} {{ dialogData.name }}</p>
      <p>{{ dataMapPage.text[0].email }} {{ dialogData.email }}</p>
      <p>{{ dataMapPage.text[0].latitude }} {{ dialogData.latitude }}</p>
      <p>{{ dataMapPage.text[0].longitude }} {{ dialogData.longitude }}</p><br>
      <button @click="handleClose" class="btn-close">Close</button>
      <!-- <button @click="handleOk">OK</button> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";

const props = defineProps<{
  visible: boolean;
  dialogData: {
    latitude: number;
    longitude: number;
    name: string;
    email: string;
  };
}>();
const dataMapPage = reactive({
  text: [{
    title: 'Visit information',
    name: 'Name:',
    email: 'Email:',
    latitude: 'Latitude:',
    longitude: 'Longitude:'
  }]
})
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
.btn-close {
  background-color: #f53545; 
  color: white; 
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
</style>
