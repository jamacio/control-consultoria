<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle) ?></title>
  <meta name="description" content="Control Consultoria - Descomplicando a vida do empresário. Consultoria empresarial, recrutamento e seleção, gestão estratégica, departamento pessoal e fiscal, treinamento e desenvolvimento.">
  <meta name="theme-color" content="#373670">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="icon" type="image/x-icon" href="<?= $baseUrl ?>/favicon.ico">
  <link rel="stylesheet" href="<?= $baseUrl ?>/assets/css/style.css">
</head>
<body>
  <div class="cursor-follower" id="cursorFollower"></div>

  <header class="header" id="header">
    <nav class="nav container">
      <a href="<?= $baseUrl ?>/" class="logo">
        <img src="<?= $baseUrl ?>/assets/images/logo-control.png" alt="Control Consultoria" class="logo-img" onerror="this.style.display='none'">
        <span class="logo-icon" style="display:none"><i class="fas fa-chart-line"></i></span>
        <span class="logo-text">Control <span class="logo-accent">Consultoria</span></span>
      </a>

      <div class="nav-toggle" id="navToggle">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul class="nav-links">
        <li><a href="<?= $baseUrl ?>/" class="<?= $currentPage === 'home' ? 'active' : '' ?>">Home</a></li>
        <li><a href="<?= $baseUrl ?>/sobre" class="<?= $currentPage === 'sobre' ? 'active' : '' ?>">Sobre</a></li>
        <li><a href="<?= $baseUrl ?>/servicos" class="<?= $currentPage === 'servicos' ? 'active' : '' ?>">Serviços</a></li>
        <li><a href="<?= $baseUrl ?>/contato" class="<?= $currentPage === 'contato' ? 'active' : '' ?>">Contato</a></li>
      </ul>
    </nav>
  </header>

  <main>
