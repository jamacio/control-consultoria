<?php $subjects = [
  'consultoria' => 'Consultoria Empresarial',
  'recrutamento' => 'Recrutamento & Seleção',
  'gestao' => 'Gestão Estratégica',
  'fiscal' => 'Departamento Fiscal',
  'pessoal' => 'Departamento Pessoal',
  'treinamento' => 'Treinamento & Desenvolvimento',
  'outro' => 'Outro',
]; ?>

<section class="page-hero">
  <div class="container">
    <div class="page-hero-content reveal">
      <span class="hero-badge">Contato</span>
      <h1 class="page-title">Entre em <span class="gradient-text">Contato</span></h1>
      <p class="page-subtitle">Estamos prontos para atender você e sua empresa</p>
    </div>
  </div>
</section>

<section class="contact-section section">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-info reveal">
        <h2 class="section-title">Vamos <span class="gradient-text">Conversar</span></h2>
        <p class="section-text">Utilize um dos canais abaixo ou preencha o formulário para falar conosco.</p>

        <div class="contact-cards">
          <div class="contact-card">
            <div class="contact-card-icon">
              <i class="fab fa-whatsapp"></i>
            </div>
            <div class="contact-card-text">
              <h4>WhatsApp</h4>
              <a href="https://wa.me/5511961371183" target="_blank" rel="noopener">(11) 96137-1183</a>
            </div>
          </div>

          <div class="contact-card">
            <div class="contact-card-icon">
              <i class="far fa-envelope"></i>
            </div>
            <div class="contact-card-text">
              <h4>E-mail</h4>
              <a href="mailto:control01@outlook.com.br">control01@outlook.com.br</a>
            </div>
          </div>

          <div class="contact-card">
            <div class="contact-card-icon">
              <i class="fab fa-instagram"></i>
            </div>
            <div class="contact-card-text">
              <h4>Instagram</h4>
              <a href="https://www.instagram.com/controlconsultoria1/" target="_blank" rel="noopener">@controlconsultoria1</a>
            </div>
          </div>

          <div class="contact-card">
            <div class="contact-card-icon">
              <i class="fab fa-linkedin-in"></i>
            </div>
            <div class="contact-card-text">
              <h4>LinkedIn</h4>
               <a href="https://www.linkedin.com/company/control-c-gerenciamento-empresarial-ltda/" target="_blank" rel="noopener">Control Consultoria</a>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-form-wrapper reveal">
        <form class="contact-form" id="contactForm">
          <div class="form-group">
            <label for="name">Nome</label>
            <input type="text" id="name" name="name" placeholder="Seu nome completo" required>
          </div>
          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" placeholder="seu@email.com" required>
          </div>
          <div class="form-group">
            <label for="phone">Telefone</label>
            <input type="tel" id="phone" name="phone" placeholder="(11) 99999-9999">
          </div>
          <div class="form-group">
            <label for="subject">Assunto</label>
            <select id="subject" name="subject">
              <option value="">Selecione um assunto</option>
              <option value="consultoria">Consultoria Empresarial</option>
              <option value="recrutamento">Recrutamento & Seleção</option>
              <option value="gestao">Gestão Estratégica</option>
              <option value="fiscal">Departamento Fiscal</option>
              <option value="pessoal">Departamento Pessoal</option>
              <option value="treinamento">Treinamento & Desenvolvimento</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div class="form-group">
            <label for="message">Mensagem</label>
            <textarea id="message" name="message" rows="5" placeholder="Como podemos ajudar sua empresa?" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-full">
            Enviar via WhatsApp <i class="fab fa-whatsapp"></i>
          </button>
        </form>
      </div>

<script>
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const subjects = {
    'consultoria': 'Consultoria Empresarial', 'recrutamento': 'Recrutamento & Seleção',
    'gestao': 'Gestão Estratégica', 'fiscal': 'Departamento Fiscal',
    'pessoal': 'Departamento Pessoal', 'treinamento': 'Treinamento & Desenvolvimento', 'outro': 'Outro'
  };
  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const phone = this.phone.value.trim();
  const subject = this.subject.value;
  const message = this.message.value.trim();
  if (!name || !email || !message) { alert('Preencha nome, e-mail e mensagem.'); return; }
  const subjectLabel = subjects[subject] || subject || 'Sem assunto';
  const text = "Olá! Vim pelo site.\n\n"
    + "Nome: " + name + "\n"
    + "E-mail: " + email + "\n"
    + (phone ? "Telefone: " + phone + "\n" : "")
    + "Assunto: " + subjectLabel + "\n\n"
    + "Mensagem:\n" + message;
  window.open('https://wa.me/5511961371183?text=' + encodeURIComponent(text), '_blank');
});
</script>
    </div>
  </div>
</section>