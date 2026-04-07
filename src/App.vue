<template>
  <div class="container-fluid">
    <header class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand">AppFormulaire</router-link>
        <nav class="navbar-nav ms-auto">
          <router-link to="/" class="nav-link">Accueil</router-link>
          <router-link to="/builder" class="nav-link">Builder</router-link>
          <router-link to="/runner" class="nav-link">Runner</router-link>
          <router-link to="/admin" class="nav-link">Admin</router-link>
        </nav>
      </div>
    </header>

    <main class="py-4">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// Root component
</script>

<style scoped>
header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

main {
  min-height: calc(100vh - 60px);
}
</style>
