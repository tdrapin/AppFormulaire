<template>
  <div class="not-found-container">
    <div class="error-content">
      <div class="error-code">404</div>
      <h1>Page non trouvée</h1>
      <p class="error-message">Désolé, la page que vous recherchez n'existe pas ou a été supprimée.</p>
      
      <div class="mt-5">
        <router-link to="/" class="btn btn-primary btn-lg">
          <i class="fas fa-home"></i> Retour à l'accueil
        </router-link>
      </div>

      <div class="mt-5 pt-5 border-top">
        <h5>Pages disponibles:</h5>
        <div class="row mt-3">
          <div class="col-md-6">
            <ul class="list-unstyled">
              <li class="mb-2">
                <router-link to="/">
                  <i class="fas fa-home"></i> Accueil
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/builder">
                  <i class="fas fa-hammer"></i> Form Builder
                </router-link>
              </li>
            </ul>
          </div>
          <div class="col-md-6">
            <ul class="list-unstyled">
              <li class="mb-2">
                <router-link to="/runner">
                  <i class="fas fa-play"></i> Form Runner
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/admin">
                  <i class="fas fa-lock"></i> Administration
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 page - Not found
</script>
