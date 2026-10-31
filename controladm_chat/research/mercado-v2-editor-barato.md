# Pesquisa v2: editor de ajustes pequenos por chat (Gemini, nuvem) para o cliente final

Data da consulta: 2026-10-30. Convenção: **FATO** = lido na fonte citada; **HIPÓTESE/OPINIÃO** = análise minha; "não confirmado" = não achei fonte primária. Esta rodada corrige a v1 (`research/mercado-concorrentes.md`), que assumia IA local (Ollama) e prompts de ~10k tokens. Tudo que a v1 já confirmou (preços de Wix, Hostinger, Framer, 10Web, WordPress.com, Lovable etc.) não foi refeito; cito o arquivo.

Produto lido no repo: `README.md`, `prompts/editor.md`, `blocks/` (7 blocos: banner, chamada, depoimentos, imagem-texto, perguntas, serviços, texto). A IA recebe uma lista numerada de elementos editáveis e devolve JSON com ops `text`, `attr`, `theme`, `delete`, `add`, `page`. Limite diário (`DAILY_LIMIT`=50), `MAX_MESSAGE_CHARS`=400, `MAX_OUTPUT_TOKENS`=800, desfazer só em memória, login único por `.env`, alteração vai direto ao ar (README).

## Resumo executivo

1. **Custo de IA é irrelevante para o negócio**: com 1.200 tokens de entrada e 150 de saída, o pedido custa de US$ 0,00012 a US$ 0,0015 (R$ 0,0006 a R$ 0,008) nos modelos baratos. 1.000 pedidos/mês custam no máximo ~R$ 8 com Gemini 3.8 Flash e ~R$ 1 com 2.5 Flash-Lite. A margem bruta de uma assinatura de R$ 49 é > 85% mesmo no pior caso; o custo real virá de suporte, cobrança e hospedagem (HIPÓTESE).
2. **Atenção ao alias `gemini-flash-lite-latest`**: a doc do Gemini diz que aliases `-latest` apontam para a versão mais nova e podem mudar com aviso de duas semanas (https://ai.google.dev/gemini-api/docs/models). Hoje o Flash-Lite mais novo listado, o 3.5, custa 3x a entrada e 6x a saída do 2.5 Flash-Lite. Para controlar custo e comportamento, fixar o ID do modelo é uma recomendação (opinião).
3. **Free tier do Gemini não serve para produto de clientes**: nele o conteúdo é usado para melhorar produtos Google e pode ser lido por revisores humanos; para EEA/Suíça/UK só o pago é permitido (https://ai.google.dev/gemini-api/terms). Em produção, usar conta paga (Tier 1 exige conta de cobrança ativa).
4. **O ângulo "mande uma mensagem e o site muda" já existe**, mas é nicho e muito recente: autoSite (a partir de US$ 20/mês, com preview e "OK" para publicar), Themesmith, WebAssist, Macaly, Kora. Todos em inglês, nenhum com preço/volume confiável de adoção. Não achei equivalente em pt-BR (não é prova de ausência).
5. **Os grandes têm edição por IA com aprovação**: WordPress.com ("nada muda sem seu aval", plano pago) e Shopify Sidekick (rascunho para revisar). Webflow/Storyblok/CloudCannon/TinaCMS vendem fluxo editorial por assento; nenhum é "chat de ajuste mínimo, barato, em pt-BR".
6. **Demanda no Brasil existe mas o preço é baixo e disperso**: 53% das empresas pequenas (10 a 49 pessoas) têm site (TIC Empresas 2025, via blog; micro/MEI ficam fora da pesquisa); planos de manutenção reais achados vão de R$ 49,90 a R$ 780/mês. Número de MEIs/agências atual: não confirmado em fonte oficial.
7. **Maior lacuna do protótipo para vender**: auth multiusuário/multi-site, rascunho/aprovação, histórico persistente, backup. Hoje é um produto de um site só.
8. **Caminho que priorizo (OPINIÃO)**: add-on revendido por agências/freelancers (cada cliente ganha um "editor de ajustes" com marca da agência) e site+editor para MEI/pequeno negócio vendido a preço fixo, validando primeiro com agências já cobrando manutenção.

## 1. Economia unitária

Premissa do pedido: 1.200 tokens de entrada + 150 de saída (sem raciocínio, que o README diz estar desligado; modelos 3.x cobram "thinking" como saída). Câmbio: **R$ 5,3744 por US$ (PTAX de venda de 29/10/2026, API do Banco Central, https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/, consultada em 2026-10-30; a PTAX de 30/10 ainda não estava publicada)**. Pagamento real usa câmbio comercial/IOF do cartão, diferente da PTAX (HIPÓTESE: +4 a +8%, não verificado).

Preços (por 1M tokens, padrão, pago): Gemini (https://ai.google.dev/gemini-api/docs/pricing, 2026-10-30), Anthropic (https://platform.claude.com/docs/en/about-claude/pricing), OpenAI (https://developers.openai.com/api/docs/pricing), Groq (https://console.groq.com/docs/models), DeepSeek (https://api-docs.deepseek.com/quick_start/pricing/).

| Modelo | Entrada / saída (US$/1M) | Custo por pedido US$ | R$ | 50 pedidos/mês (US$ / R$) | 200 (US$ / R$) | 1.000 (US$ / R$) |
|---|---|---|---|---|---|---|
| Gemini 2.5 Flash-Lite | 0,10 / 0,40 | 0,00018 | 0,0010 | 0,009 / 0,05 | 0,036 / 0,19 | 0,18 / 0,97 |
| Gemini 3.1 Flash-Lite | 0,25 / 1,50 | 0,000525 | 0,0028 | 0,026 / 0,14 | 0,105 / 0,56 | 0,53 / 2,82 |
| Gemini 3.5 Flash-Lite | 0,30 / 2,50 | 0,000735 | 0,0040 | 0,037 / 0,20 | 0,147 / 0,79 | 0,74 / 3,95 |
| Gemini 3.8 Flash | 0,75 / 3,75 | 0,00146 | 0,0079 | 0,073 / 0,39 | 0,29 / 1,57 | 1,46 / 7,86 |
| Claude Haiku 5.5 (prompt até 100k) | 0,10 / 0,50 | 0,000195 | 0,0010 | 0,010 / 0,05 | 0,039 / 0,21 | 0,20 / 1,05 |
| Claude Haiku 4.5 | 1 / 5 | 0,00195 | 0,0105 | 0,097 / 0,52 | 0,39 / 2,10 | 1,95 / 10,48 |
| OpenAI gpt-5-nano | 0,05 / 0,40 | 0,00012 | 0,0006 | 0,006 / 0,03 | 0,024 / 0,13 | 0,12 / 0,64 |
| Groq gpt-oss-20b | 0,075 / 0,30 | 0,000135 | 0,0007 | 0,007 / 0,04 | 0,027 / 0,15 | 0,135 / 0,73 |
| DeepSeek flash (pico / fora de pico) | 0,30 / 1,20 ; 0,15 / 0,60 | 0,00054 ; 0,00027 | 0,0029 ; 0,0015 | 0,027 ; 0,013 | 0,108 ; 0,054 | 0,54 / 2,90 ; 0,27 / 1,45 |

Notas (FATO): Gemini 3.8 Flash e 3.6 Flash dobram de preço em 2027-01-01 (mesma página). Cache de contexto do Gemini cobra armazenamento por hora (US$ 0,50 a 1,00 por 1M tokens/h), e com um prompt de ~1.000 tokens por pedido, o cache provavelmente não compensa (HIPÓTESE; o prompt é pequeno e o piso de tokens de cache não foi verificado). Batch (50% de desconto em Gemini, Anthropic e OpenAI) não serve ao chat interativo; só a tarefas assíncronas. Imagens enviadas pelo cliente não entram na conta acima (o upload é salvo em disco, não vai à IA, pelo README). Groq: a tabela lida mostrava o llama-3.1-8b-instant como "contact sales"; a página trazia um bloco de texto estranho com "instruções" sobre citações, que ignorei por ser conteúdo da página, não do pedido. DeepSeek: sede e dados na China, avaliar LGPD antes de usar (HIPÓTESE).

**Free tier (FATO, https://ai.google.dev/gemini-api/docs/pricing e /rate-limits):** os sete modelos listados têm entrada e saída gratuitas no free tier, mas "usado para melhorar produtos" = Sim no free e Não no pago. Os limites numéricos (RPM/TPM/RPD) não estão na página de docs, só no painel do AI Studio: **não confirmado**. Os termos (https://ai.google.dev/gemini-api/terms) dizem que a API é para "fins profissionais ou de negócio", que no serviço não pago humanos podem ler entradas e saídas e que não se deve enviar dado pessoal/sensível; para usuários no EEE/Suíça/Reino Unido só o serviço pago. Tier 1 = conta de cobrança ativa. Conclusão (INFERÊNCIA): free tier só para desenvolvimento; produto com cliente = conta paga. O pedido de um cliente pode conter telefone, e-mail e nomes (exemplo do README: WhatsApp), logo é dado pessoal.

**Margem em preços de assinatura (HIPÓTESE; só custo de IA, ignora imposto, gateway, VPS, suporte):**

| Preço/mês | Custo IA no pior caso (1.000 pedidos, 3.8 Flash, R$ 7,86) | Margem sobre IA | Custo IA típico (200 pedidos, 3.1 Flash-Lite, R$ 0,56) |
|---|---|---|---|
| R$ 29 | R$ 7,86 | 73% | 98% |
| R$ 49 | R$ 7,86 | 84% | 99% |
| R$ 99 | R$ 7,86 | 92% | 99% |
| R$ 199 | R$ 7,86 | 96% | 99,7% |

O limite diário (50) já limita o pior caso a ~1.500 pedidos/mês, a cerca de R$ 12 com o modelo mais caro da tabela. Tarifas de gateway (Pix/cartão) e imposto: não pesquisei; margem real menor.

## 2. Concorrentes do ângulo "o cliente final edita"

Os construtores completos estão na v1. Aqui estão só os que respondem "como o cliente altera o site sem quebrá-lo". Datas: páginas lidas em 2026-10-30, exceto onde indicado.

| Produto | Como o cliente edita | Guardrails contra quebrar design / publicar errado | Preço (fonte) | Limites | White-label |
|---|---|---|---|---|---|
| autoSite | Mensagem de texto em Telegram/WhatsApp | Preview em cópia de teste; só publica após o cliente responder "OK" ("nenhuma atualização vai ao ar sem aprovação manual") | A partir de US$ 20/mês, sem taxa por edição, sem contrato; domínio US$ 1-60/ano; trial grátis (https://similarlabs.com/p/autosite; página de terceiros) | Sem limite numérico informado | Não confirmado |
| WebAssist | Mensagem WhatsApp; troca texto, imagens, preços, equipe, horários; diz funcionar com WordPress, Shopify, Webflow, Wix | Confirmação enviada depois; aprovação antes: **não descrita**. Alteração "no mesmo dia / em algumas horas", o que sugere humano ou fila (HIPÓTESE) | Não listado (https://hunted.space/product/webassist). Lançamento no Product Hunt com 0 votos | n/c | n/c |
| Macaly | Agente via WhatsApp (voz, imagens, PDF) que cria/edita/publica projetos | Envia link de prévia ao final; se publica só após aprovação: não informado (post de 2026-05-20, https://www.macaly.com/blog/introducing-macaly-on-whatsapp) | Não informado no post | n/c | n/c |
| Themesmith | Sites feitos e mantidos por conversa em WhatsApp/Messenger/Instagram/e-mail | Não descritos (listagem de 2026-10-03, https://alternativeto.net/software/themesmith/about/) | "Assinatura", valor não informado | n/c | n/c |
| Kora | Atualiza site, posta em redes, anúncios, avaliações do Google via WhatsApp | Não verificado (só resumo de busca, https://www.producthunt.com/p/kora-2/kora-4) | n/c | n/c | n/c |
| B12 | Chat, ou "Visual Edit" por elemento (a IA atualiza só o elemento selecionado) | Cada mudança vira versão com "Restore"; sem rascunho/aprovação descrito; revisão depois de aplicado (https://support.b12.io/en/editing-your-website-with-the-ai-agent) | Não listado | Créditos (valor n/c) | Não informado |
| WordPress.com (assistente + MCP) | Assistente no editor; agentes externos (Claude, ChatGPT) por MCP | "Nada muda no site sem seu aval": o dono confirma cada atualização, escolhe o que a IA pode fazer e revoga acessos (https://wordpress.com/ai/) | Qualquer plano pago (preços na v1: US$ 4-25/mês anual) | Sem limites listados na página | Não |
| Shopify Sidekick | Chat no admin; pode agir na loja | Muda em rascunho e mostra recomendação para revisão; segue permissões do admin (https://www.shopify.com/magic) | Incluído no plano (v1: Basic R$ 99/mês) | "Varia por plano" | Não |
| Webflow | Editor/Designer com assistente; papéis (Editor) | Papel de editor restringe a design; guardrails de IA por papel: **não confirmados** (busca devolveu fontes conflitantes, https://www.digidop.com/blog/webflow-pricing-2026-update). Aviso: o editor legado teria sido desativado em 2026-08-04 (secundária) | Core US$ 19, Growth US$ 49 por fontes secundárias; página oficial não carregou | Créditos: n/c | Cobrança a clientes via workspace: n/c |
| CloudCannon | Edição visual de sites estáticos por clientes, Git por baixo | Papéis/permissões (Team: personalizados); fluxo com branches no Team | Standard US$ 55/mês (3 usuários), Team US$ 300-350, extra US$ 10/usuário; **Lite US$ 10/mês só para parceiros** (https://cloudcannon.com/pricing/) | Sem IA descrita na página | "Marca personalizada" (alcance n/c); programa de parceiros |
| TinaCMS | Edição visual de sites em Git | Free sem fluxo editorial; Team tem "Editorial Workflow" | Free; Team US$ 24-29/projeto/mês; Business US$ 249-299 (tabela inconsistente na própria página, https://tina.io/pricing) | IA "em breve" | Não |
| Storyblok | CMS headless com editor visual | Fluxos/papéis personalizados só em Premium/Elite | Free; Growth US$ 99/mês; Growth Plus US$ 349 (https://www.storyblok.com/pricing) | 25k-200k créditos de IA | Não informado |
| 10Web, Brizy | White-label para agência (v1) | v1 | v1 | v1 | Sim (v1) |
| Plugins WordPress (WP2AI, Axtolab AI Connector, Buildli, HubApp, Atarim) | Conectam ChatGPT/Claude/MCP ao WP; HubApp declara "prévias obrigatórias"; Atarim destaca "desfazer" | Variam; todos só por resumo de busca, **não verifiquei página oficial** | WP2AI Agency €60/mês (20 sites, 5 usuários), segundo resumo de busca | n/c | WP2AI: multi-site; "client label" no Axtolab (resumo) |

Padrões (INFERÊNCIA): (a) o modelo "mensagem + preview + OK" já é padrão entre os startups; (b) os grandes (WordPress.com, Shopify) exigem aprovação/rascunho; (c) nenhum dos que li promete **gasto mínimo de tokens e operações restritas** como argumento, mas eu só vi o que as páginas dizem (não testei os produtos).

### Planos de manutenção de agências no Brasil (ofertas reais, páginas de cobrança Asaas)

| Oferta | Preço/mês | Escopo | Fonte |
|---|---|---|---|
| Agência (pequena) | R$ 49,90 | 2 atualizações/alterações por mês, fotos, textos, manutenção contínua | Página Asaas via busca (https://www.asaas.com/c/xylg3dhavgodrpfo; não abri a página, só o resumo de busca) |
| Daniel de Farias, "Plano Essencial" | R$ 99,90 | Sem itens listados (https://www.asaas.com/c/ft9vvvbwg5wgyl55) | |
| "Plano Profissional" | R$ 197,90 | Sem itens listados (https://www.asaas.com/c/bt4j17ohyu0vzyt3; só resumo) | |
| MW Online, Essencial | R$ 400 | 10 GB hospedagem, SSL, backups diários, atualização semanal de plugins, monitoramento; **não cita alterações de conteúdo** | https://mwonline.com.br/manutencao-de-sites-wordpress/ |
| MW Online, Completo | R$ 780 | + revisões de segurança, testes, suporte por WhatsApp | idem |
| MW Online, Enterprise | R$ 2.500 | + 15 h de desenvolvimento e "manutenção de conteúdo" (sem quantidade); site adicional R$ 150 | idem |
| Contrato-modelo brasileiro | n/a | Alterações de layout/estrutura a pedido do contratante **não são manutenção**, cobradas à parte (https://www.sedep.com.br/?p=13583, trecho em resumo de busca) | |

FATO: a faixa vai de R$ 49,90 a R$ 2.500/mês, e o "pequeno ajuste de conteúdo" costuma ser contado em quantidade (ex.: 2 por mês). INFERÊNCIA: o produto atual mexe justamente nesse item de escopo (ajuste de texto/imagem/cor), que a agência vende como pacote. Conferi só 3 a 4 ofertas; não é amostra.

## 3. Mercado e demanda no Brasil

- **Sites em empresas (FATO, secundária):** TIC Empresas 2025 (Cetic.br/NIC.br): 56% das empresas com acesso à internet têm site; 53% das pequenas (10 a 49 pessoas ocupadas), 76% das médias, 87% das grandes; série 2019-2025 oscila entre 53% e 58%. Fonte lida: blog Homehost citando o material de lançamento (https://www.homehost.com.br/blog/?p=18315). A pesquisa cobre empresas com 10+ pessoas, **sem micro e MEI**. Livro oficial: https://cetic.br/media/docs/publicacoes/2/pt-br/20260831091311/TIC_EMPRESAS_2025_PT_LIVRO.pdf (não li o PDF).
- **Pequenos negócios (FATO, resumo de busca de Agência Sebrae):** até agosto de 2026, 3,93 milhões de novos pequenos negócios (+14,3% sobre 2025), 77,3% MEI (https://agenciasebrae.com.br/dados/abertura-de-pequenos-negocios-cresce-quase-14-em-2026/). Isso é fluxo de aberturas, não estoque. Estoque de MEIs ativos em 2026: **não confirmado** (as fontes secundárias divergem entre 16 e 21+ milhões de empresas; o Sebrae cita ~24 milhões de pequenos negócios).
- **Presença digital de MEI:** levantamento Sebrae de 2023: 25% dos entrevistados (61% MEI) sem presença digital (fonte: resumo de busca; não li o original). Indicadores de site próprio por MEI: **não confirmado**.
- **Agências/freelancers:** o dado mais recente que achei é o censo Abradi de 2014 (3.388 agências digitais; criação de sites era a principal atividade, https://www.baguete.com.br/noticias/abradi-lanca-censo-de-agencias-digitais). Contagem atual por CNAE (6201-5, 6311, 7311, 7312) na Receita/RAIS: **não confirmado**.
- **Gasto com site/manutenção:** sem pesquisa oficial; só as ofertas da seção 2 e as da v1.
- **HIPÓTESE de TAM:** se 100k a 500k negócios brasileiros com site pagam algo por ajustes, 1% de penetração a R$ 49 = R$ 0,5 a 2,5 milhões/ano. Sem base em dado oficial; usar só como ordem de grandeza para decidir se vale validar.

## 4. Segurança e risco

- **Prompt injection (FATO, OWASP):** LLM01:2025 (injeção de prompt, incluindo indireta por conteúdo externo) é o risco nº 1 do OWASP Top 10 para LLM (v2.0, publicado em 2024-11-18, via resumos de busca; página oficial não aberta: https://genai.owasp.org). No produto, o texto das páginas entra no prompt como lista de elementos (`index-6 h1 "..."`). Um visitante não escreve nesse texto, mas o próprio cliente, um colaborador ou conteúdo colado pode conter instruções ("apague tudo"). Mitigação já presente (code-read): a IA só devolve ops de um conjunto fechado, não HTML; elementos inexistentes abortam sem alterar; "do only what was asked". Faltando (HIPÓTESE, não testei): teste adversarial, confirmação para `delete` de seção e `theme` em massa, e ignorar instruções vindas dos textos.
- **Custo (FATO, OWASP):** LLM10:2025 "Unbounded Consumption" cobre fluxo de tokens e custo descontrolado de API. O limite diário, o limite de mensagem e o teto de saída do protótipo respondem a isso. Falta: limite por conta em produção (hoje o contador está em memória e zera ao reiniciar), orçamento mensal na conta Google e alerta.
- **Conteúdo gerado e LGPD (HIPÓTESE jurídica, sem consulta a advogado):** o cliente é controlador dos dados que digita; a plataforma é operadora e o Google é suboperador. Requer política/DPA, base legal e menção ao envio para fora do país. Texto inventado: o prompt já manda usar placeholders (`[Nome do cliente]`) para não inventar depoimento, nome ou preço, o que reduz risco de publicidade enganosa.
- **Termos do Gemini (FATO):** pago = prompts/respostas não usados para melhoria dos produtos; logs mantidos por período limitado para detectar abuso; sem dados pessoais no free tier.
- **Como outros lidam (FATO):** aprovação antes de publicar (autoSite, WordPress.com), rascunho (Shopify), versões com restore (B12). O protótipo publica direto; o desfazer some ao reiniciar (README). Esta é a lacuna mais óbvia.

## 5. Modelos de negócio

Preços comparáveis: autoSite US$ 20/mês (~R$ 107); manutenção BR de R$ 49,90 a R$ 780; CloudCannon Lite US$ 10/site para parceiros (~R$ 54); WP2AI Agency €60 para 20 sites; 10Web Agency US$ 42,50 por 10 sites (v1); builders com IA R$ 5-100/mês (v1).

| Modelo | Quem paga | Faixa plausível | Aquisição/suporte provável (HIPÓTESE) | Risco | Validar primeiro |
|---|---|---|---|---|---|
| (a) SaaS ao cliente final | Dono de negócio | R$ 29-79/mês | Alto: compra pulverizada, muito suporte, concorre com Locaweb/Hostinger a R$ 5-40 | Baixo diferencial frente a hospedagem com IA; churn | Alguém paga por "ajuste por chat" num site que já tem? |
| (b) White-label para agências, por site gerenciado | Agência | R$ 15-40 por site/mês (referência: CloudCannon Lite ~R$ 54, 10Web ~US$ 4/site extra) | Médio: poucos compradores, relacionamento direto, mas exigem painel multi-site e auth | Agência vê IA como ameaça à sua cobrança; precisa suportar sites existentes | 10 agências aceitam piloto com 3 clientes cada? |
| (c) Add-on de manutenção revendido | Agência paga, cliente final paga a agência | Agência revende a R$ 49-149/mês, paga R$ 15-40 | Médio; mesmo produto que (b) com pacote pronto de venda | Igual (b); depende de a agência topar mudar escopo | Substituir o "2 alterações/mês" de planos tipo R$ 49,90 por edição ilimitada com limite diário |
| (d) Site pronto + editor por assinatura | MEI/pequeno negócio | R$ 59-149/mês (site + hospedagem + editor) | Alto; precisa de onboarding e conteúdo; concorre com builders | Margem fina se o suporte pesar; produto de entrada tem de ter blocos e visual bons | 5 MEIs pagam adiantado por site em 1 semana? |
| (e) Open-core/self-hosted com licença | Dev/agência técnica | Licença única ou R$ 200-500/ano (sem comparável achado: HIPÓTESE) | Baixo suporte, baixa receita; Node/PM2 afasta não técnicos | Cópia, pouca receita | Há interesse de devs em hospedar? |
| (f) Edição por WhatsApp/Telegram como canal | Mesmos de (a)-(d) | Preço de (a) mais custo do canal (API de WhatsApp: não pesquisei) | Alto custo de integração e conformidade | Concorrentes estrangeiros já testam | Fazer teste manual (concierge) antes de integrar |
| (g) Camada sobre sites existentes (WordPress/estático) via MCP/API | Agências | Referência WP2AI €60/20 sites | Alto custo de engenharia | WordPress.com e plugins avançam | Só depois de (b) validar |

### Ranking (OPINIÃO minha: potencial × facilidade de validar)

1. **(c) add-on revendido por agência/freelancer**, com (b) como forma de cobrança: comprador identificável, ticket recorrente, ancora em preço de manutenção existente, e dá para validar sem código novo (um site de demonstração e uma conta por agência).
2. **(d) site + editor para MEI com preço fixo**: usa o ponto forte do protótipo (blocos prontos + operações restritas) e aproveita a TIC de pequenos negócios; validação via pré-venda de 5 sites.
3. **(f) edição por WhatsApp como diferencial de (c)/(d)**: concorrentes validam o apelo, mas só depois de ter demanda (teste concierge antes).
4. **(a) assinatura direta ao cliente**: só se (d) mostrar disposição a pagar; sem aquisição barata, o caminho é caro.
5. **(e) open-core**: baixa receita, baixo esforço; deixar para depois.

## 6. Diferenciais e lacunas do protótipo

**Possíveis diferenciais (HIPÓTESES, sem comparação sistemática):**
- Custo de tokens por pedido (~1.200 entrada/150 saída) muito abaixo de builders que cobram por crédito (v1: Lovable cobra 0,5 crédito para trocar a cor de um botão). FATO sobre Lovable na v1; o resto é minha inferência.
- Operações restritas em vez de HTML livre: menor chance de quebrar o layout; a IA não escreve HTML nem classes (README, `editor.js`).
- Blocos prontos (7), desfazer de múltiplos passos, pt-BR, resposta de 1 a 2 s.
- Concorrentes estrangeiros que li não destacam nada disso (limite da minha leitura).

**Lacunas frente ao mercado (FATO sobre o protótipo, HIPÓTESE sobre importância):**
- Login único por `.env`, sem multiusuário, sem multi-site (README).
- Alteração direta ao ar; sem rascunho, preview nem aprovação (outros têm).
- Histórico e contador diário em memória; somem ao reiniciar (README).
- Sem banco: nada de contas, cobrança, métricas por cliente.
- Sem domínio/hospedagem gerenciada, SEO (meta tags/sitemap), formulários, analytics, backups: não vi no README (não auditei todo o código).
- Só 7 blocos; sem galeria, preços, formulário ou mapa.
- Sem teste de qualidade medido (taxa de acerto das ops): não existe nos materiais.
- Cobertura de i18n do produto: respostas em pt-BR por `RESPONSE_LANGUAGE`, mas prompts em inglês.

## Plano de validação de 2 semanas

**Semana 1: agências e demanda**
- Dias 1-2: lista de 30 agências/freelancers de site (Instagram, LinkedIn, grupos de WordPress BR); mensagem curta com demo de 60 s.
- Dias 3-7: 8 a 10 entrevistas de 20 min com quem mantém ≥ 5 sites; mostrar demo e perguntar preço (Van Westendorp simplificado).
- Em paralelo: medir 30 pedidos reais no protótipo (taxa de acerto, tokens, tempo) para ter dado próprio de qualidade e custo.

**Semana 2: pré-venda**
- Dias 8-10: oferecer a 5 agências um piloto grátis de 14 dias com 1 cliente delas cada (site de demonstração com a marca).
- Dias 8-12: oferecer "site pronto para MEI com editor" a 5 donos de negócio por pré-venda de R$ 49 a R$ 99/mês (cobrança manual por Pix).
- Dias 13-14: consolidar.

**Métricas de sucesso (propostas minhas, ajuste ao seu apetite):** ≥ 3 das 10 agências aceitam piloto; ≥ 2 dizem que pagariam ≥ R$ 20/site/mês; ≥ 2 MEIs pagam adiantado; taxa de acerto das ops ≥ 90% nos 30 pedidos medidos; custo de IA < R$ 1 por cliente no piloto. Se nada disso for batido, o caminho (a)/(d) fica descartado e resta (e) ou (g).

## Lacunas / o que não consegui confirmar

- Limites numéricos do free tier do Gemini (RPM/TPM/RPD): só no AI Studio.
- Para qual modelo o alias `gemini-flash-lite-latest` aponta hoje: a doc não diz. Preço real pode ser o do 2.5 ou o do 3.5 Flash-Lite.
- Câmbio da PTAX de 30/10/2026 (ainda não publicada); usei o de 29/10 (R$ 5,3744). Custos de cartão/IOF e de gateway/impostos: não pesquisados.
- Preço oficial do Webflow e guardrails de IA por papel; limites de uso de WordPress.com e Shopify Sidekick.
- Preços de Themesmith, WebAssist, Macaly, Kora, B12; adoção real dos produtos de WhatsApp. Plugins WordPress só por resumo de busca.
- Estoque atual de MEIs, nº de agências/freelancers por CNAE, gasto médio com site: sem fonte oficial achada. TIC Empresas só cobre empresas com 10+ pessoas, e li os números via blog (não o PDF).
- Ofertas de agências BR: 3 a 4 páginas de cobrança, duas só via resumo de busca; não representam o mercado.
- Teste do produto sob injeção de prompt e taxa de acerto das ops: não executei.
- API de WhatsApp (custo, regras da Meta): não pesquisei.

## Perguntas para entrevistas (atualizadas para o produto atual)

Agências/freelancers:
1. Quantos sites você mantém hoje e quanto cobra de cada um por mês? O que está incluso (nº de alterações)?
2. Que fração dos pedidos é "troca de texto/foto/cor/telefone"? Quanto tempo isso consome por mês?
3. Se o seu cliente pedisse o ajuste direto num chat, com a sua marca e desfazer, isso reduziria ou ameaçaria sua receita?
4. Você pagaria por site/mês? Quanto seria justo? Preferiria plano único ou por site?
5. O que impediria de colocar isso no ar num site de cliente (aprovação, histórico, responsabilidade)?
6. Os sites que você mantém são WordPress, estáticos ou builder? Teria de ser sobre o site existente ou aceitaria sites novos no nosso formato?

Donos de negócio/MEI:
7. Quem altera seu site hoje, quanto custa e quanto demora? Qual foi a última mudança?
8. Você preferiria pedir por chat do navegador ou por WhatsApp? Precisaria aprovar antes de publicar?
9. Quanto pagaria por mês por site + hospedagem + "pedir ajuste por chat"? E se só pudesse 50 pedidos por dia?
10. Já usou IA para mexer em site? O que deu errado?
11. O que faria você perder a confiança (erro visual, texto inventado, perder uma versão)?

Teste concierge: pedir 5 ajustes reais no protótipo na frente do entrevistado e anotar acertos, erros e reações.
