<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle) ?></title>
  <meta name="description" content="<?= htmlspecialchars($pageDescription) ?>">
  <meta name="keywords" content="consultoria empresarial, recrutamento e seleção, gestão estratégica, departamento pessoal, treinamento corporativo, Viviane Andrade, control consultoria, São Paulo">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta name="theme-color" content="#373670">
  <meta name="author" content="Control Consultoria">
  <meta name="geo.region" content="BR-SP">
  <meta name="geo.placename" content="São Paulo">
  <link rel="canonical" href="<?= htmlspecialchars($pageCanonical) ?>">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Control Consultoria">
  <meta property="og:title" content="<?= htmlspecialchars($pageTitle) ?>">
  <meta property="og:description" content="<?= htmlspecialchars($pageDescription) ?>">
  <meta property="og:url" content="<?= htmlspecialchars($pageCanonical) ?>">
  <meta property="og:image" content="<?= $openGraphImage ?>">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">
  <meta property="og:image:alt" content="Logotipo Control Consultoria">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= htmlspecialchars($pageTitle) ?>">
  <meta name="twitter:description" content="<?= htmlspecialchars($pageDescription) ?>">
  <meta name="twitter:image" content="<?= $openGraphImage ?>">

  <!-- Preload & Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" as="style">

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" media="print" onload="this.media='all'">
  <link rel="icon" type="image/x-icon" href="<?= $baseUrl ?>/favicon.ico">
  <link rel="apple-touch-icon" href="<?= $baseUrl ?>/favicon.ico">
  <link rel="stylesheet" href="<?= $baseUrl ?>/assets/css/style.css">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": ["ProfessionalService", "LocalBusiness"],
      "@id": "<?= (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $baseUrl ?>/#organization",
      "name": "Control Consultoria",
      "alternateName": "Control Consultoria Gerenciamento Empresarial Ltda",
      "url": "<?= (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $baseUrl ?>/",
      "logo": "<?= $openGraphImage ?>",
      "image": "<?= $openGraphImage ?>",
      "description": "Consultoria empresarial especializada em gestão, recrutamento, departamento pessoal e consultoria humanizada. Descomplicando a vida do empresário desde 2019.",
      "founder": {
        "@type": "Person",
        "name": "Viviane Andrade",
        "jobTitle": "CEO & Fundadora"
      },
      "foundingDate": "2019",
      "email": "control01@outlook.com.br",
      "telephone": "+55-11-96137-1183",
      "areaServed": {
        "@type": "City",
        "name": "São Paulo",
        "sameAs": "https://pt.wikipedia.org/wiki/S%C3%A3o_Paulo"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "São Paulo",
        "addressRegion": "SP",
        "addressCountry": "BR"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "telephone": "+55-11-96137-1183",
        "availableLanguage": ["Portuguese"]
      },
      "sameAs": [
        "https://www.instagram.com/controlconsultoria1/",
        "https://www.facebook.com/controlconsultoria1/",
        "https://www.linkedin.com/company/control-c-gerenciamento-empresarial-ltda/"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Serviços de Consultoria",
        "itemListElement": [{
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Consultoria Empresarial"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Recrutamento & Seleção"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Gestão Estratégica"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Consultoria Humanizada"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Departamento Pessoal"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Treinamento & Desenvolvimento"
            }
          }
        ]
      }
    }
  </script>

  <!-- BreadcrumbList -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        <?php foreach ($breadcrumbItems as $i => $item): ?> {
            "@type": "ListItem",
            "position": <?= $i + 1 ?>,
            "name": "<?= htmlspecialchars($item['name']) ?>",
            "item": "<?= $item['url'] ? htmlspecialchars((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $item['url']) : htmlspecialchars($pageCanonical) ?>"
          }
          <?= $i < count($breadcrumbItems) - 1 ? ',' : '' ?><?php endforeach; ?>
        ]
    }
  </script>
</head>

<body>
  <div class="cursor-follower" id="cursorFollower"></div>

  <header class="header" id="header">
    <nav class="nav container" aria-label="Navegação principal">
      <a href="<?= $baseUrl ?>/" class="logo" aria-label="Control Consultoria - Página inicial">
        <img src="<?= $baseUrl ?>/assets/images/logo-control.png" alt="Control Consultoria - Logotipo" class="logo-img" width="40" height="40" onerror="this.style.display='none'">

        <span class="logo-text">Control <span class="logo-accent">Consultoria</span></span>
</a>

      <button class="nav-toggle" id="navToggle" aria-label="Abrir menu de navegação" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class="nav-links">
        <li><a href="<?= $baseUrl ?>/" class="<?= $currentPage === 'home' ? 'active' : '' ?>">Home</a></li>
        <li><a href="<?= $baseUrl ?>/sobre" class="<?= $currentPage === 'sobre' ? 'active' : '' ?>">Sobre</a></li>
        <li><a href="<?= $baseUrl ?>/servicos" class="<?= $currentPage === 'servicos' ? 'active' : '' ?>">Serviços</a></li>
        <li><a href="<?= $baseUrl ?>/contato" class="<?= $currentPage === 'contato' ? 'active' : '' ?>">Contato</a></li>
      </ul>
    </nav>
  </header>

  <main>