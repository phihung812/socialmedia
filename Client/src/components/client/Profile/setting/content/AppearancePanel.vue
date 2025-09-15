<template>
  <div class="settings-panel">
    <h2>Giao diện</h2>
    
    <div class="appearance-section">
      <h3>Chế độ hiển thị</h3>
      <div class="theme-options">
        <div 
          class="theme-option"
          :class="{ active: appearance.theme === 'light' }"
          @click="appearance.theme = 'light'"
        >
          <div class="theme-preview light-theme"></div>
          <span>Sáng</span>
        </div>
        <div 
          class="theme-option"
          :class="{ active: appearance.theme === 'dark' }"
          @click="appearance.theme = 'dark'"
        >
          <div class="theme-preview dark-theme"></div>
          <span>Tối</span>
        </div>
        <div 
          class="theme-option"
          :class="{ active: appearance.theme === 'system' }"
          @click="appearance.theme = 'system'"
        >
          <div class="theme-preview system-theme"></div>
          <span>Theo hệ thống</span>
        </div>
      </div>
    </div>
    
    <div class="appearance-section">
      <h3>Màu sắc chủ đạo</h3>
      <div class="color-options">
        <div 
          v-for="(color, index) in themeColors" 
          :key="index"
          class="color-option"
          :class="{ active: appearance.accentColor === color.value }"
          :style="{ backgroundColor: color.color }"
          @click="appearance.accentColor = color.value"
        ></div>
      </div>
    </div>
    
    <div class="appearance-section">
      <h3>Cỡ chữ</h3>
      <div class="font-size-slider">
        <span class="font-size-label small">A</span>
        <input 
          type="range" 
          min="12" 
          max="20" 
          v-model="appearance.fontSize" 
          class="slider" 
        />
        <span class="font-size-label large">A</span>
      </div>
    </div>
    
    <div class="form-actions">
      <button @click="saveAppearance" class="btn-primary">Lưu cài đặt</button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue';


// Danh sách màu sắc chủ đạo
const themeColors = [
  { value: 'blue', color: '#0095f6' },
  { value: 'red', color: '#ed4956' },
  { value: 'purple', color: '#8a3ab9' },
  { value: 'green', color: '#4caf50' },
  { value: 'orange', color: '#ff9800' },
  { value: 'pink', color: '#e91e63' },
];

// State cho cài đặt giao diện
const appearance = ref({
  theme: 'light',
  accentColor: 'blue',
  fontSize: 16,
});

const emit = defineEmits(['save-appearance']);

const saveAppearance = () => {
  // Lưu cài đặt giao diện
  console.log('Đang lưu cài đặt giao diện:', appearance.value);
  // Áp dụng theme
  document.documentElement.setAttribute('data-theme', appearance.value.theme);
  // Áp dụng màu sắc
  document.documentElement.style.setProperty('--accent-color', getAccentColor());
  // Áp dụng font size
  document.documentElement.style.setProperty('--base-font-size', `${appearance.value.fontSize}px`);
  
  alert('Cài đặt giao diện đã được lưu!');
};
</script>

<style scoped>
.settings-panel h2 {
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 22px;
  font-weight: 600;
  color: #262626;
}

.appearance-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #dbdbdb;
}

.appearance-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
}

.theme-options {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.color-options {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border: 2px solid #262626;
}

.theme-options {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.theme-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid #dbdbdb;
  transition: border-color 0.2s;
}

.theme-option.active .theme-preview {
  border: 2px solid var(--accent-color, #0095f6);
}

.light-theme {
  background-color: #ffffff;
}

.dark-theme {
  background-color: #121212;
}

.system-theme {
  background: linear-gradient(to right, #ffffff 50%, #121212 50%);
}

.color-options {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border: 2px solid #262626;
}

.font-size-slider {
  display: flex;
  align-items: center;
  gap: 15px;
}

.font-size-label {
  font-weight: 600;
}

.font-size-label.small {
  font-size: 12px;
}

.font-size-label.large {
  font-size: 20px;
}

</style>