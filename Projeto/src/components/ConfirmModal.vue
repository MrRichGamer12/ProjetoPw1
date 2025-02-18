<template>
    <div v-if="show" class="modal-overlay">
      <div class="modal">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button @click="$emit('cancel')" class="cancel-button">Cancelar</button>
          <button @click="$emit('confirm')" class="confirm-button">Confirmar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      show: Boolean,
      title: String,
      message: String,
    },
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
    color: #222;
  }
  
  .modal-title {
    font-size: 1.5em;
    font-weight: bold;
  }
  
  .modal-message {
    font-size: 1.1em;
    color: #333;
  }
  
  .modal-actions {
    margin-top: 15px;
  }
  
  button {
    padding: 10px 15px;
    margin: 5px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
  }
  
  .cancel-button {
    background: #ccc;
    color: #222;
  }
  
  .confirm-button {
    background: #d9534f;
    color: white;
  }
  </style>
  