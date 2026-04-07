<template>
  <div class="home">
    <h1>Bienvenue sur AppFormulaire</h1>
    <p>Plateforme de création et gestion de formulaires techniques</p>

    <div class="row mt-4">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Form Builder</h5>
            <p class="card-text">Créez et éditez vos formulaires</p>
            <router-link to="/builder" class="btn btn-primary">Accéder</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Form Runner</h5>
            <p class="card-text">Remplissez les formulaires</p>
            <router-link to="/runner" class="btn btn-primary">Accéder</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Administration</h5>
            <p class="card-text">Gérez et exploitez les données</p>
            <router-link to="/admin" class="btn btn-primary">Accéder</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home page
</script>

<style scoped>
.home {
  text-align: center;
}

.card {
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
