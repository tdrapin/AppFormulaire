<template>
  <div class="runner-container">
    <section class="section-header">
      <h1>Remplisseur de formulaires</h1>
      <p class="lead">Remplissez et soumettez les formulaires</p>
    </section>

    <div class="row mt-5">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0"><i class="fas fa-wpforms"></i> Formulaires disponibles</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info" role="alert">
              <i class="fas fa-info-circle"></i> Aucun formulaire disponible actuellement.
            </div>
            <p class="text-muted">Les formulaires créés apparaîtront ici.</p>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0"><i class="fas fa-search"></i> Rechercher</h5>
          </div>
          <div class="card-body">
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="Chercher un formulaire..." aria-label="Search">
              <button class="btn btn-primary" type="button"><i class="fas fa-search"></i></button>
            </div>
            <div class="list-group">
              <p class="text-muted text-center py-3">Aucune correspondance</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header bg-secondary text-white">
            <h5 class="mb-0"><i class="fas fa-history"></i> Récents</h5>
          </div>
          <div class="card-body">
            <p class="text-muted text-center py-3">Aucun formulaire consulté récemment</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Runner page - Form submission and completion
</script>
