<template>
  <h2>Map</h2>
  <div ref="mapContainer" class="map-container" style=" height: 800px"></div>

  <Dialog
    :visible="dialogVisible"
    :message="dialogMessage"
    :lat="dialogLat"
    :lng="dialogLng"
    @update:visible="dialogVisible = $event"
    @marker-action="handleMarkerAction"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted, watchEffect } from 'vue';
import leaflet from 'leaflet';
import { useGeolocation } from '@vueuse/core';
import { userMarker, nearbyMarkers } from '@/stores/mapStore';
import Dialog from '@/components/Dialog.vue';

const { coords } = useGeolocation();
const lat = ref(0);
const lng = ref(0);
const mapContainer = ref<HTMLDivElement | null>(null);
const dialogVisible = ref(false);
const dialogMessage = ref('');
const dialogLat = ref(0);
const dialogLng = ref(0);
const pointerEnabled = ref(true); 
let map: leaflet.Map;
let userGeoMarker: leaflet.Marker;
let markerAction = ref<'none' | 'add'>('none');

onMounted(() => {
  if (mapContainer.value) {
    map = leaflet.map(mapContainer.value).setView([51.505, -0.09], 13);

    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    nearbyMarkers.value.forEach(({ latitude, longitude }) => {
      const marker = leaflet.marker([latitude, longitude])
        .addTo(map)
        .on('click', () => {
          dialogMessage.value = `Saved Marker at (<strong>${latitude.toFixed(2)},${longitude.toFixed(2)}</strong>)`;
          dialogLat.value = latitude;
          dialogLng.value = longitude;
          dialogVisible.value = true; 
          pointerEnabled.value = false; 
        });

      marker.bindPopup(`<b>Marker</b><br>Latitude: ${latitude.toFixed(6)}<br>Longitude: ${longitude.toFixed(6)}`);
    });

    map.addEventListener('click', (e) => {
      if (pointerEnabled.value) {
        const { lat: latitude, lng: longitude } = e.latlng;

        dialogMessage.value = `Saved Marker at (<strong>${latitude.toFixed(2)},${longitude.toFixed(2)}</strong>)`;
        dialogLat.value = latitude;
        dialogLng.value = longitude;
        dialogVisible.value = true;
        pointerEnabled.value = false; 
      }
    });
  }
});

watchEffect(() => {
  if (coords.value.latitude !== Number.POSITIVE_INFINITY && coords.value.longitude !== Number.POSITIVE_INFINITY) {
    userMarker.value.latitude = coords.value.latitude;
    userMarker.value.longitude = coords.value.longitude;

    if (userGeoMarker) {
      map.removeLayer(userGeoMarker);
    }

    if (map) {
      userGeoMarker = leaflet.marker([userMarker.value.latitude, userMarker.value.longitude])
        .addTo(map)
        .bindPopup('User Marker');

      map.setView([userMarker.value.latitude, userMarker.value.longitude], 13);

      const el = userGeoMarker.getElement();
      if (el) {
        el.style.filter = 'hue-rotate(120deg)';
      }
    }
  }
});

function handleMarkerAction(action: 'add' | 'none') {
  markerAction.value = action;

  if (markerAction.value === 'add') {
    leaflet.marker([dialogLat.value, dialogLng.value])
      .addTo(map)
      .bindPopup(`Saved Marker at (<strong>${dialogLat.value.toFixed(2)},${dialogLng.value.toFixed(2)}</strong>)`);

    nearbyMarkers.value.push({ latitude: dialogLat.value, longitude: dialogLng.value });
  }
  pointerEnabled.value = true;
}
</script>

<style scoped>
.map-container {
  position: relative;
  margin: 20px;
  z-index: 1; 
}
</style>
