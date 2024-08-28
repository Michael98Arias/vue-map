<template>
    <div class="loading-overlay">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p class="loading-text">Please wait a moment</p>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  </script>
  
  <style scoped>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8); 
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .spinner {
    border: 8px solid rgba(0, 0, 0, 0.1); 
    border-left: 8px solid #3498db; 
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-text {
    margin-top: 10px;
    font-size: 16px;
    color: #333;
  }
  </style>
  