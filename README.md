# Flávia Nails — site de agendamento

Site estático (HTML + CSS + JavaScript puro, **sem build**) com formulário de
agendamento que envia a mensagem pronta para o WhatsApp da Flávia.

```
index.html      → a página
styles.css      → visual (cores, fontes, layout)
config.js       → ⚙️ número do WhatsApp, Instagram, serviços e horários
app.js          → lógica do formulário e do link do WhatsApp
assets/         → imagens (hero-nails.jpg, favicon.png, logo.jpg)
lovable-source/ → projeto React original exportado do Lovable (não é publicado)
```

## Como o WhatsApp funciona

A cliente preenche o formulário e clica em **Confirmar agendamento**. O site monta
um link `https://wa.me/<número>?text=<mensagem>` e abre o WhatsApp já com o texto
pronto — nome, telefone, serviço, data, horário e acompanhantes. A cliente toca em
enviar e a mensagem chega **direto no WhatsApp da Flávia**, na conversa normal.

Isso é o *WhatsApp Click to Chat*, o mecanismo oficial da Meta para sites. É
gratuito, não precisa de servidor, não precisa de aprovação e funciona no celular
e no computador.

> A *WhatsApp Business Cloud API* (envio automático, chatbot, mensagens em massa)
> é outra coisa: exige conta Meta Business verificada, um número dedicado, um
> servidor rodando 24h para receber os webhooks e custa por conversa. O GitHub
> Pages só hospeda arquivos estáticos, então não roda esse servidor. Se um dia for
> necessário, dá para acrescentar sem trocar o site.

## Mudar número, preços ou horários

Abra `config.js`, edite e publique:

```bash
git add -A && git commit -m "atualiza dados" && git push
```

O site online atualiza em cerca de 1 minuto.

## Colocar no ar (GitHub Pages)

1. Crie um repositório **público** em https://github.com/new — por exemplo
   `flavianails`. Não marque "Add a README".
2. No terminal, dentro desta pasta:

```bash
git remote add origin https://github.com/flavianails-nails/flavianails.git
git branch -M main
git push -u origin main
```

3. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, escolha `main` e a pasta `/ (root)` e clique em **Save**.
4. Em 1–2 minutos o site fica em
   `https://flavianails-nails.github.io/flavianails/`.

## Ver o site no computador antes de publicar

```bash
python -m http.server 8765
```

Depois abra http://127.0.0.1:8765 no navegador.
