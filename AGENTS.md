# Instruções do projeto

## O que é o projeto?

Gestor de finanças pessoais com um painel para consultar informações financeiras e registar despesas e receitas.

A definição da média do mês anterior ainda precisa de ser esclarecida. Antes de implementar ou alterar esse cálculo, confirma com o utilizador qual a métrica pretendida.

## Tecnologias

- Backend: Node.js, TypeScript e Express.
- Frontend: React, TypeScript e Tailwind CSS.
- Base de dados: MongoDB.
- Controlo de versões: Git e GitHub.
- Ferramentas pretendidas: Prettier para formatação.

## Estilo de código

- Usa nomes explícitos e descritivos para variáveis e funções.
- Segue o idioma Português e as convenções do código existente no ficheiro. Evita renomear código apenas para uniformizar o idioma.
- Usa Prettier quando estiver configurado. Até lá, mantém a formatação existente.
- Não reescrevas código funcional sem uma razão relacionada com o pedido.
- Não adiciones dependências desnecessárias.

## Âmbito das alterações

- Se o utilizador indicar ficheiros específicos, pede autorização antes de alterar outros ficheiros. Explica quais pretendes alterar, o que vais fazer e porquê.
- Se o pedido não indicar ficheiros específicos, altera apenas os necessários para o cumprir.
- Respeita as alterações existentes do utilizador.

## Validação

Executa os comandos na raiz do projeto, onde está o `package.json`.

- Após cada conjunto de alterações de código, executa `npm run check` antes de dar o trabalho por concluído.
- Se algum comando falhar, explica a causa identificada e como resolver. Se a causa ainda não for conhecida, indica o que falta investigar.
- Para alterações apenas de documentação, revê o conteúdo e a formatação; não é necessário executar verificações de código.
