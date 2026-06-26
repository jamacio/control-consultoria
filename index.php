<?php
$baseUrl = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$fullUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

$allowed = [
  'home', 'sobre', 'servicos', 'contato',
  'consultoria-empresarial', 'recrutamento-selecao',
  'gestao-estrategica', 'departamento-fiscal',
  'departamento-pessoal', 'treinamento-desenvolvimento'
];

$requestPath = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$requestPath = $requestPath === 'index.php' ? '' : $requestPath;

$page = in_array($requestPath, $allowed) ? $requestPath : 'home';

if (!in_array($page, $allowed)) {
  $page = 'home';
}

$currentPage = $page;
if (in_array($page, ['consultoria-empresarial', 'recrutamento-selecao', 'gestao-estrategica', 'departamento-fiscal', 'departamento-pessoal', 'treinamento-desenvolvimento'])) {
  $currentPage = 'servicos';
}

$pageTitle = match ($page) {
  'home' => 'Control Consultoria - Descomplicando a vida do empresário',
  'sobre' => 'Sobre Nós - Control Consultoria | Nossa História',
  'servicos' => 'Serviços - Control Consultoria | Consultoria Empresarial',
  'contato' => 'Contato - Control Consultoria | Fale Conosco',
  'consultoria-empresarial' => 'Consultoria Empresarial - Control Consultoria | Estratégia e Gestão',
  'recrutamento-selecao' => 'Recrutamento & Seleção - Control Consultoria | Talentos',
  'gestao-estrategica' => 'Gestão Estratégica - Control Consultoria | Decisões Inteligentes',
  'departamento-fiscal' => 'Departamento Fiscal - Control Consultoria | Planejamento Tributário',
  'departamento-pessoal' => 'Departamento Pessoal - Control Consultoria | Gestão de Pessoas',
  'treinamento-desenvolvimento' => 'Treinamento & Desenvolvimento - Control Consultoria | Capacitação',
  default => 'Control Consultoria',
};

$pageDescription = match ($page) {
  'home' => 'Control Consultoria descomplica a gestão empresarial para pequenos e médios empresários. Soluções em consultoria, recrutamento, gestão estratégica, departamento fiscal e pessoal.',
  'sobre' => 'Conheça a história da Control Consultoria, fundada por Viviane Andrade em 2019. Saiba como descomplicamos a gestão empresarial.',
  'servicos' => 'Conheça todos os serviços da Control Consultoria: consultoria empresarial, recrutamento e seleção, gestão estratégica, departamento fiscal e departamento pessoal.',
  'contato' => 'Entre em contato com a Control Consultoria. WhatsApp, e-mail, Instagram e LinkedIn. Estamos prontos para atender sua empresa.',
  'consultoria-empresarial' => 'Consultoria empresarial com soluções estratégicas em gestão, processos e governança. Transforme seu negócio com a Control Consultoria.',
  'recrutamento-selecao' => 'Processo seletivo especializado com análise de perfil, triagem curricular e assessments. Encontre os melhores talentos com a Control Consultoria.',
  'gestao-estrategica' => 'Transforme dados em decisões estratégicas. Gestão de custos, relatórios gerenciais e planejamento financeiro com a Control Consultoria.',
  'departamento-fiscal' => 'Planejamento tributário, apuração de impostos e obrigações acessórias. Gestão fiscal completa com a Control Consultoria.',
  'departamento-pessoal' => 'Gestão de folha de pagamento, admissão, rescisão e eSocial. Departamento pessoal completo com a Control Consultoria.',
  'treinamento-desenvolvimento' => 'Programas de treinamento corporativo em liderança, atendimento, comunicação e gestão. Capacite sua equipe com a Control Consultoria.',
  default => 'Control Consultoria - Descomplicando a vida do empresário.',
};

$pageCanonical = ($page === 'home')
  ? (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $baseUrl . '/'
  : (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $baseUrl . '/' . $page;

$servicePages = ['consultoria-empresarial', 'recrutamento-selecao', 'gestao-estrategica', 'departamento-fiscal', 'departamento-pessoal', 'treinamento-desenvolvimento'];

$breadcrumbItems = [['name' => 'Home', 'url' => $baseUrl . '/']];

if ($page === 'sobre') {
  $breadcrumbItems[] = ['name' => 'Sobre Nós', 'url' => ''];
} elseif ($page === 'servicos') {
  $breadcrumbItems[] = ['name' => 'Serviços', 'url' => ''];
} elseif ($page === 'contato') {
  $breadcrumbItems[] = ['name' => 'Contato', 'url' => ''];
} elseif (in_array($page, $servicePages)) {
  $breadcrumbItems[] = ['name' => 'Serviços', 'url' => $baseUrl . '/servicos'];
  $serviceNames = [
    'consultoria-empresarial' => 'Consultoria Empresarial',
    'recrutamento-selecao' => 'Recrutamento & Seleção',
    'gestao-estrategica' => 'Gestão Estratégica',
    'departamento-fiscal' => 'Departamento Fiscal',
    'departamento-pessoal' => 'Departamento Pessoal',
    'treinamento-desenvolvimento' => 'Treinamento & Desenvolvimento',
  ];
  $breadcrumbItems[] = ['name' => $serviceNames[$page] ?? $page, 'url' => ''];
}

$openGraphImage = $baseUrl . '/assets/images/logo-control.png';

include __DIR__ . '/partials/header.php';

$pageFile = __DIR__ . '/pages/' . $page . '.php';
if (file_exists($pageFile)) {
  include $pageFile;
} else {
  include __DIR__ . '/pages/home.php';
}

include __DIR__ . '/partials/footer.php';
