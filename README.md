<div align="center">
  <img src="public/pwa-192x192.png" width="120" alt="Caderno de Retoma de Contexto Logo" />
  <h1>Caderno de Retoma de Contexto</h1>
  <p><strong>O teu contexto, sem atrito. Uma PWA offline-first para recuperar rapidamente a concentração após interrupções.</strong></p>
</div>

---

O **Caderno de Retoma de Contexto** é uma Progressive Web App (PWA) de código aberto construída com React, TypeScript, Dexie.js (IndexedDB) e Tailwind CSS v4. Foi concebido para ser uma ferramenta anti-fricção que capta rapidamente o teu estado mental sempre que precisares de interromper uma tarefa (uma reunião inesperada, final do dia de trabalho, etc.), permitindo que retomes o contexto exato onde paraste mais tarde.

## ✨ Funcionalidades

- 🧠 **Captura de Estado Mental**: Regista exatamente o que estavas a pensar, onde paraste e qual é o próximo passo exato.
- ⚡ **Offline-First & PWA**: Funciona 100% offline. Guarda os teus dados localmente no browser usando o IndexedDB.
- 🔒 **Privacidade Total**: Sem servidores, sem tracking. Os teus dados de contexto nunca saem do teu computador (exportação/importação manual via ficheiros JSON locais).
- 🏷️ **Contexto Estruturado**: Marcação de prioridade, alertas de "erros a evitar" e registo de bloqueadores ativos.
- 📱 **Design Responsivo & Nativo**: Interface desenhada com Tailwind CSS que se adapta a Mobile e Desktop. Pode ser instalada como aplicação nativa através do teu browser.

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)

### Instalação

1. Clona o repositório:
   ```bash
   git clone https://github.com/TEU_USERNAME/caderno-de-retoma.git
   cd caderno-de-retoma
   ```

2. Instala as dependências:
   ```bash
   npm install
   ```

3. Inicia o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abre `http://localhost:5173` no teu browser.

## 🛠 Tech Stack

- **Framework**: React 18 & Vite
- **Linguagem**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Base de Dados**: Dexie.js (Wrapper para IndexedDB)
- **Routing**: React Router v6
- **Ícones**: Lucide React
- **PWA**: vite-plugin-pwa

## 🤝 Como Contribuir

Se sentires falta de alguma funcionalidade, fica à vontade para contribuir! Faz um Fork do projeto, cria a tua *branch* de feature e submete um *Pull Request*. 

## 📄 Licença

Este projeto está licenciado ao abrigo da [MIT License](LICENSE).
