# LDV Digital

Site com área administrativa em `/admin`. Depois do login, você usa um chat para pedir alterações no site em texto livre. Uma IA (Google Gemini) edita a página e a alteração vai direto para o ar.

## Início rápido (Docker + Makefile)

Do jeito recomendado, o site roda num container Docker que tem só o Node 22 (Alpine) e as dependências do servidor. O `Makefile` guarda os comandos do Docker.

### 1. Instale o Docker e o make

No Ubuntu/Debian (VPS ou computador):

```bash
curl -fsSL https://get.docker.com | sh   # Docker + Docker Compose
sudo apt-get install -y make
```

Confira se instalou:

```bash
docker compose version
make --version
```

### 2. Configure o `.env`

```bash
cp .env.example .env
```

Abra o `.env`, coloque a `GEMINI_API_KEY` ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)) e troque a senha do admin e o `SESSION_SECRET`:

```env
PORT=4000
DOCKER_IMAGE=ldv-chat
ADMIN_USER=admin
ADMIN_PASSWORD=troque-esta-senha
SESSION_SECRET=troque-por-um-texto-aleatorio-longo
GEMINI_API_KEY=sua-chave-aqui
GEMINI_MODEL=gemini-flash-lite-latest
RESPONSE_LANGUAGE=Brazilian Portuguese
```

### 3. Inicie o servidor

```bash
make up
```

Pronto, o site está no ar:

| Página       | Endereço                     |
| ------------ | ---------------------------- |
| Site público | http://localhost:4000        |
| Área admin   | http://localhost:4000/admin  |

A porta é o `PORT` do `.env`. O container volta sozinho se cair e quando o servidor reinicia.

### Comandos

```bash
make up      # gera a imagem e sobe em segundo plano (rode de novo depois de mudar o código)
make watch   # o mesmo, mostrando os logs no terminal (Ctrl+C para parar)
make stop    # para o container
make down    # para e remove o container
```

A pasta `public/` é a do projeto, montada no container: as alterações do chat aparecem na hora nos seus arquivos e ficam prontas para o `git commit`.

Vários sites no mesmo servidor: cada um na sua pasta, com um `PORT` diferente no `.env`. Todos usam a mesma imagem (`DOCKER_IMAGE`), que fica uma vez só no disco.

### Sobre o `.env`

O modelo padrão é o `gemini-flash-lite-latest` (`GEMINI_MODEL`). Cada pedido gasta ~1.000–1.400 tokens de entrada e ~60–200 de resposta, e leva 1 a 2 s.

`RESPONSE_LANGUAGE` define o idioma das respostas da IA no chat. Escreva o nome do idioma em inglês: `Brazilian Portuguese`, `English`, `Spanish` etc. Os prompts da IA (`prompts/`) estão em inglês, porque o modelo gasta menos tokens e segue melhor as instruções assim. Os textos novos do site seguem o idioma que a página já usa.

> Não há banco de dados. O login usa o `ADMIN_USER` e o `ADMIN_PASSWORD` do `.env` (para trocar a senha, mude o `.env` e rode `make up`). O histórico de alterações fica na memória: dá para desfazer tudo o que foi feito desde que o servidor ligou.

## Rodando sem Docker

Precisa do [Node.js](https://nodejs.org) 22 ou mais novo.

```bash
npm install
cp .env.example .env   # e preencha como no passo 2
npm start
```

O terminal vai mostrar:

```
Site:  http://localhost:4000
Admin: http://localhost:4000/admin  (modelo: gemini-flash-lite-latest)
```

Para desenvolver, use `npm run dev`. Assim o servidor reinicia sozinho quando você salva um arquivo.

## Rodando na VPS sem Docker (PM2)

Para o site continuar no ar depois de fechar o terminal, voltar sozinho se cair e subir quando a VPS reiniciar, use o [PM2](https://pm2.keymetrics.io):

```bash
npm install -g pm2
cd /var/www/ldv_chat
pm2 start npm --name ldv -- start
pm2 save
pm2 startup     # mostra um comando: copie e rode ele
```

No dia a dia:

```bash
pm2 logs ldv       # ver os logs ([gemini], [ops]…)
pm2 restart ldv    # depois de atualizar o código ou o .env
pm2 stop ldv       # parar
```

> O histórico do **Desfazer** e o contador de pedidos do dia ficam na memória: zeram a cada `pm2 restart`. As alterações no site continuam salvas.

Antes, confira na VPS:

- **Node 22 ou mais novo** (`node -v`). O Ubuntu vem com o Node 18, que dá `node: bad option: --env-file-if-exists`. Para trocar:
  ```bash
  apt-get remove -y nodejs npm && apt-get autoremove -y
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  ```
- **Só as dependências do servidor.** O Tailwind não roda no servidor (veja [CSS do site](#css-do-site)), então na VPS instale sem as de desenvolvimento:
  ```bash
  npm ci --omit=dev
  ```
- **O `.env` criado na VPS** (ele não vai para o git), com a `GEMINI_API_KEY`, a senha do admin e o `SESSION_SECRET`.

## Acessando o site

| Página          | Endereço                      |
| --------------- | ----------------------------- |
| Site público    | http://localhost:4000         |
| Área admin      | http://localhost:4000/admin   |

Para acessar de outro aparelho na mesma rede (celular, por exemplo), troque `localhost` pelo IP do computador onde o servidor está rodando, ex: `http://192.168.0.10:4000/admin`.

## Fazendo login

1. Acesse **http://localhost:4000/admin**.
2. Vai aparecer a tela **"Área administrativa"**.
3. Digite o **usuário** e a **senha** que estão no `.env` (`ADMIN_USER` e `ADMIN_PASSWORD`).
   - Se você não criou o `.env`, os padrões são usuário `admin` e senha `admin123`.
4. Clique em **Entrar**. A página do chat de edição do site vai abrir.

O login fica válido por 8 horas. Para sair, clique em **Sair** no canto superior direito.

> Se o servidor for reiniciado, você precisa fazer login de novo.

## Alterando o site pelo chat

O `/admin` é um chat no estilo das IAs web. Escreva o que quer mudar e aperte **Enter** (**Shift+Enter** pula linha). O chat foi feito para **ajustes pequenos** do cliente, com o menor gasto de tokens possível:

```
muda o título do banner para Sites prontos em uma semana
muda a cor principal para azul
adiciona uma seção de depoimentos na página inicial
na página de contato coloca o WhatsApp (11) 99999-0000
cria uma página Portfólio
cria uma notícia no blog. Título: Horário de fim de ano. Texto: ...
apaga a notícia Horário de fim de ano do blog
```

- **Imagens:** o clipe anexa uma imagem (PNG, JPG, WEBP ou GIF, até 5 MB), que vai para `public/img/uploads/`. Depois é só pedir "usa essa imagem como logo" ou "troca a imagem do banner por essa".
- **Seções novas** vêm prontas da pasta `blocks/` (banner, serviços, texto, imagem e texto, depoimentos, perguntas frequentes, chamada). A IA só escolhe o bloco e escreve os textos, então o layout que você entregou não quebra.
- **Blog:** as notícias ficam em `public/blog.json`, e a página `/blog` lê esse arquivo: lista paginada (6 por página, as mais novas primeiro) e cada notícia em `/blog/<slug>` (ex: `/blog/horario-de-fim-de-ano`). O `slug` fica no JSON: nasce do título, não muda quando o título é editado (para os links já compartilhados continuarem valendo) e o cliente pode trocá-lo pelo chat ("muda o endereço da notícia X para promocao-natal"). Pelo chat, o cliente cria, edita e apaga notícias (título, texto, imagem de capa, data e endereço) e mostra ou esconde as datas. Isso altera só o JSON, nunca o HTML. Sem imagem, título ou texto, entram uma capa, um título e um texto padrão, então o layout não quebra. A data padrão é o dia da criação.
- **O que a IA pode fazer:** trocar textos, links e imagens, mudar as 7 cores do tema, apagar elementos ou seções, adicionar blocos e criar páginas. Ela não mexe em classes nem escreve HTML.
- **Ver site** abre o site em outra aba; cada resposta tem o link da página alterada.
- **Desfazer** volta todos os arquivos que a última alteração mudou. Dá para clicar várias vezes, até o momento em que o servidor foi ligado.
- Se a IA errar o pedido (elemento que não existe, imagem que não existe), nada é alterado e aparece um aviso.

**Limites** (no `.env`): `DAILY_LIMIT` pedidos por dia (padrão 50; o contador fica na memória e zera à meia-noite ou ao reiniciar), `MAX_MESSAGE_CHARS` caracteres por mensagem (400; `MAX_POST_CHARS`, 2000, nos pedidos do blog, que trazem a notícia inteira) e `MAX_OUTPUT_TOKENS` tokens na resposta da IA (800).

## Como o site é organizado

| Arquivo | O que é |
| --- | --- |
| `public/cores.css` | As cores do site no `:root`, em CSS puro. É o arquivo que o chat altera ao trocar uma cor |
| `public/theme.css` | Entrada do Tailwind: liga as cores às classes (`bg-accent`…) e define as fontes |
| `public/site.css` | Gerado pelo Tailwind com `npm run build:css` e versionado no git. Não edite |
| `public/partials/header.html` | Header fixo no topo, com o logo e o menu principal |
| `public/partials/footer.html` | Footer com o menu do rodapé |
| `public/blog.json` | As notícias do blog. A página `blog.html` lê este arquivo, e o chat altera só ele |
| `public/img/` | Logo, imagem do banner e, em `uploads/`, as imagens enviadas pelo chat |
| `public/*.html` | Uma página por arquivo: `index.html` abre em `/`, `sobre.html` em `/sobre` |

Cada página tem `<!-- @header -->` e `<!-- @footer -->`, que o servidor troca pelos arquivos de `partials/`. Por isso mudar o menu é uma alteração só, e não uma por página. O link da página aberta fica marcado no menu.

### CSS do site

O Tailwind só é usado quando o design do site muda, nunca no servidor. A IA do chat não escreve classes: ela troca textos, insere blocos de `blocks/` e muda as cores do `cores.css`. Como o `site.css` já é gerado com as classes das páginas **e** dos blocos, tudo o que o chat faz já tem o CSS pronto.

Mudou classes num HTML de `public/` ou de `blocks/`? Gere o CSS de novo e faça o commit do `site.css`:

```bash
npm install          # uma vez, instala o Tailwind (devDependency)
npm run build:css
```

## Prompt da IA e economia de tokens

Cada pedido gasta ~900–1.300 tokens de entrada e ~60–260 de resposta. O que vai para a IA:

| Arquivo | O que define |
| --- | --- |
| `prompts/editor.md` | O prompt inteiro: as operações (`text`, `attr`, `theme`, `delete`, `add`, `page`) e como achar o logo, o banner e a página certa. Lido a cada pedido, vale sem reiniciar |
| `blocks/*.html` | Os blocos de seção. A primeira linha (`<!-- Nome: campo, campo -->`) diz os campos, e cada `{{}}` recebe um texto. Um bloco novo nesta pasta já aparece para a IA |
| `editor.js` | Monta a lista de elementos que a IA vê e aplica as operações no HTML |

- A IA vê só a página citada no pedido (ou a inicial), mais header e footer. "todas as páginas" / "site todo" manda todas.
- A lista de elementos tem só o que é editável (textos, links, imagens e onde começa cada seção), sem classes: `index-6 h1 "Seu negócio com um site…"`.
- O raciocínio ("thinking") do modelo fica desligado, porque também é cobrado.

A pasta `skills/` (design systems e regras de craft) não vai para o chat: ela serve para quem monta o layout com um agente de código.

Agentes de código (Claude Code, Copilot, Cursor…) encontram as regras do projeto pelo `AGENTS.md` / `CLAUDE.md` da raiz, que apontam para `skills/AGENTS.md`.

## Problemas comuns

- **"Não foi possível falar com a IA (Gemini)"**: confira a `GEMINI_API_KEY` no `.env` (e reinicie) e a conexão. O terminal mostra o erro que a API devolveu.
- **"Usuário ou senha inválidos"**: confira o `ADMIN_USER` e o `ADMIN_PASSWORD` do `.env` e reinicie o servidor depois de mudar.
- **A IA não fez tudo o que pedi**: peça uma coisa por vez e diga onde ("deixa o banner da página inicial verde", "troca o texto do botão do banner para X"), ou use **Desfazer última**. O terminal mostra as operações que a IA devolveu (`[ops]`) e os tokens gastos (`[gemini]`).
