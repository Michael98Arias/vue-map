<template>
  <h2>
    <img src="/pin.png" class="logo" alt="Imagen Pin" />
    {{ dataMapPage.loadingC }}
    {{ dataMapPage.title }}
  </h2>
  <br>
  <h4>
    <img src="/reload.png" class="logo" alt="Imagen Pin" />
    {{ dataMapPage.subtitle }}
    
  </h4>
  <button @click="handleClose" class="btn-reload">Reload</button>
  <br>
  <div ref="mapContainer" class="map-container" style="height: 800px"></div>
  <LoadingSpinner v-if="dataMapPage.loadingC" />
  <Dialog
    :visible="dataMapPage.dialogVisible"
    :dialogData="dataMapPage.dialogData"
    @update:visible="dataMapPage.dialogVisible = $event"
    @marker-action="handleMarkerAction"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, watchEffect } from 'vue';
import leaflet from 'leaflet';
import { useGeolocation } from '@vueuse/core';
import { userMarker, nearbyMarkers } from '@/stores/mapStore';
import Dialog from '@/components/Dialog.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { convertToGeoJson } from '@/utils/geoJsonUtils';
import MapApi from './MapApi';
import type { ListVisit } from './interface/Map';

const { coords } = useGeolocation();
const dataMapPage = reactive({
  title: 'Visits on the map',
  subtitle: 'Reload visit data',
  dialogVisible: false,
  dialogMessage: '',
  dialogLat: 0,
  dialogLng: 0,
  pointerEnabled: true,
  dialogData: {} as ListVisit,
  loadingC: false
});
const mapContainer = ref<HTMLDivElement | null>(null);
let map: leaflet.Map;
let userGeoMarker: leaflet.Marker;
let markerAction = ref<'none' | 'add'>('none');



onMounted(() => {
  ListVisits()
  if (mapContainer.value) {
    map = leaflet.map(mapContainer.value).setView([51.505, -0.09], 13);

    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (userMarker.value.latitude && userMarker.value.longitude) {
      userGeoMarker = leaflet.marker([userMarker.value.latitude, userMarker.value.longitude])
        .addTo(map)
        .bindPopup('User Marker');

      map.setView([userMarker.value.latitude, userMarker.value.longitude], 13);
    }

    map.on('click', (e) => {
      // if (dataMapPage.pointerEnabled) {
      //   const { lat: latitude, lng: longitude } = e.latlng;

      //   dataMapPage.dialogMessage = `Saved Marker at (<strong>${latitude.toFixed(2)},${longitude.toFixed(2)}</strong>)`;
      //   dataMapPage.dialogLat = latitude;
      //   dataMapPage.dialogLng = longitude;
      //   dataMapPage.dialogVisible = true;
      //   dataMapPage.pointerEnabled = false;
      // }
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
    leaflet.marker([dataMapPage.dialogLat, dataMapPage.dialogLng])
      .addTo(map)
      .bindPopup(`
        <b>Saved Marker</b><br>
        Name: ${dataMapPage.dialogData.name}<br>
        Latitude: ${dataMapPage.dialogData.latitude.toFixed(2)}<br>
        Longitude: ${dataMapPage.dialogData.longitude.toFixed(2)}
      `);
    nearbyMarkers.value.push({ latitude: dataMapPage.dialogLat, longitude: dataMapPage.dialogLng });
  }
  dataMapPage.pointerEnabled = true;
}
const ListVisits = async () => {
  console.log('dartos',dataMapPage.loadingC)
  try {
    dataMapPage.loadingC = true;
    const rawData: ListVisit[] = await MapApi.getVisits();
    const geoJsonData = convertToGeoJson(rawData);

    map.eachLayer((layer) => {
      if (layer instanceof leaflet.Marker || layer instanceof leaflet.GeoJSON) {
        map.removeLayer(layer);
      }
    });

    leaflet.geoJSON(geoJsonData, {
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(`<b>${feature.properties.name}</b><br>Email: ${feature.properties.email}<br>Latitude: ${feature.geometry.coordinates[1]}<br>Longitude: ${feature.geometry.coordinates[0]}`);
        }
        layer.on('click', () => {
          dataMapPage.dialogData = {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            name: feature.properties?.name || 'Unknown',
            email: feature.properties?.email || 'No email'
          };
          dataMapPage.dialogVisible = true;
          dataMapPage.pointerEnabled = false;
        });
      }
    }).addTo(map);
  } catch (e) {
    console.error('Error loading visits:', e);
  } finally {
    dataMapPage.loadingC = false;
  }
};
</script>

<style scoped>
.map-container {
  position: relative;
  margin: 20px;
  z-index: 1;
}
.btn-reload {
  background-color: #16bf16; 
  color: white; 
  border: none;
  padding: 5px 20px;
  margin: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
</style>
