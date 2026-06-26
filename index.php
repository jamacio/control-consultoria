<?php
$baseUrl = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');

$allowed = [
  'home', 'sobre', 'servicos', 'contato',
  'consultoria-empresarial', 'recrutamento-selecao',
  'gestao-estrategica', 'departamento-fiscal',
  'departamento-pessoal', 'treinamento-desenvolvimento'
];

$requestPath = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$requestPath = $requestPath === 'index.php' ? '' : $requestPath;

$page = $_GET['page'] ?? (in_array($requestPath, $allowed) ? $requestPath : 'home');

if (!in_array($page, $allowed)) {
  $page = 'home';
}

$currentPage = $page;
if (in_array($page, ['consultoria-empresarial', 'recrutamento-selecao', 'gestao-estrategica', 'departamento-fiscal', 'departamento-pessoal', 'treinamento-desenvolvimento'])) {
  $currentPage = 'servicos';
}

$pageTitle = match ($page) {
  'home' => 'Control Consultoria - Descomplicando a vida do empresário',
  'sobre' => 'Sobre Nós - Control Consultoria',
  'servicos' => 'Serviços - Control Consultoria',
  'contato' => 'Contato - Control Consultoria',
  'consultoria-empresarial' => 'Consultoria Empresarial - Control Consultoria',
  'recrutamento-selecao' => 'Recrutamento & Seleção - Control Consultoria',
  'gestao-estrategica' => 'Gestão Estratégica - Control Consultoria',
  'departamento-fiscal' => 'Departamento Fiscal - Control Consultoria',
  'departamento-pessoal' => 'Departamento Pessoal - Control Consultoria',
  'treinamento-desenvolvimento' => 'Treinamento & Desenvolvimento - Control Consultoria',
  default => 'Control Consultoria',
};

include __DIR__ . '/partials/header.php';

$pageFile = __DIR__ . '/pages/' . $page . '.php';
if (file_exists($pageFile)) {
  include $pageFile;
} else {
  include __DIR__ . '/pages/home.php';
}

include __DIR__ . '/partials/footer.php';
