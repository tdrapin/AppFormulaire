<template>
  <div class="admin-container">
    <section class="section-header">
      <h1>Espace de gestion</h1>
      <p class="lead">Gérez et exploitez les données des formulaires</p>
    </section>

    <div class="row mt-4 mb-5">
      <div class="col-md-3">
        <div class="card stats-card text-center">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Formulaires</h6>
            <p class="stats-number">0</p>
            <small class="text-muted">Total créés</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card text-center">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Réponses</h6>
            <p class="stats-number">0</p>
            <small class="text-muted">Reçues</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card text-center">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Utilisateurs</h6>
            <p class="stats-number">0</p>
            <small class="text-muted">Actifs</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card text-center">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Taux</h6>
            <p class="stats-number">0%</p>
            <small class="text-muted">Complétion</small>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header bg-danger text-white">
            <h5 class="mb-0"><i class="fas fa-table"></i> Données des formulaires</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Formulaire</th>
                    <th>Réponses</th>
                    <th>Dernier remplissage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                      Aucune donnée disponible
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0"><i class="fas fa-cog"></i> Paramètres</h5>
          </div>
          <div class="card-body">
            <div class="list-group list-group-flush">
              <button type="button" class="list-group-item list-group-item-action">
                <i class="fas fa-users"></i> Gérer les utilisateurs
              </button>
              <button type="button" class="list-group-item list-group-item-action">
                <i class="fas fa-cogs"></i> Configuration
              </button>
              <button type="button" class="list-group-item list-group-item-action">
                <i class="fas fa-download"></i> Exporter les données
              </button>
              <button type="button" class="list-group-item list-group-item-action">
                <i class="fas fa-lock"></i> Sécurité
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0"><i class="fas fa-bell"></i> Logs</h5>
          </div>
          <div class="card-body">
            <p class="text-muted text-center py-3">Aucune activité récente</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Admin page - Data management and settings
</script>
