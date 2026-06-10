# Guia Git — Subindo Melhorias no Squad Stark

> Para colaboradores do repositório `treinamento-orquestradores-stark-gestoresdetrafego`.
> Siga esse fluxo toda vez que quiser subir mudanças no squad.

---

## Contexto

O repositório tem uma branch principal chamada `main` que é a versão oficial do squad. Ninguém edita o `main` diretamente — cada colaborador cria uma branch própria com suas mudanças, sobe para o GitHub e abre um Pull Request. Depois de revisado, o PR é mergeado no `main`.

Isso garante que as mudanças de um não sobrescrevem as do outro.

---

## Pré-requisitos

- Git instalado na máquina
- Repositório clonado localmente
- Acesso de colaborador ao repositório no GitHub (pedir ao Gustavo se não tiver)

Se ainda não clonou o repositório:
```powershell
git clone https://github.com/gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego.git
cd treinamento-orquestradores-stark-gestoresdetrafego
```

---

## Passo 1 — Atualizar o main local antes de começar

Sempre antes de criar uma branch nova, garanta que seu `main` local está atualizado com o GitHub:

```powershell
git checkout main
git pull origin main
```

Se aparecer mensagem de conflito aqui, me chama antes de continuar.

---

## Passo 2 — Criar sua branch

Crie uma branch com seu nome e uma descrição curta do que você vai mudar:

```powershell
git checkout -b feat/vinicius-[descricao-curta]
```

Exemplos:
```powershell
git checkout -b feat/vinicius-novos-clientes
git checkout -b feat/vinicius-ajuste-alerta-monitor
git checkout -b feat/vinicius-template-relatorio
```

> Nunca trabalhe direto no `main`. Sempre em uma branch sua.

---

## Passo 3 — Fazer suas modificações

Edite os arquivos normalmente no VS Code ou pelo Claude Code. Quando terminar, continue para o próximo passo.

---

## Passo 4 — Verificar o que foi modificado

```powershell
git status
```

Vai mostrar todos os arquivos que você criou, editou ou deletou. Revise a lista antes de commitar — confirme que está subindo só o que quer.

---

## Passo 5 — Adicionar os arquivos ao commit

Para adicionar tudo de uma vez (recomendado para mudanças no squad):

```powershell
git add squads/gestor-trafego-stark/
```

Se quiser adicionar arquivo por arquivo:
```powershell
git add squads/gestor-trafego-stark/agents/alerta-monitor.md
git add squads/gestor-trafego-stark/data/clientes.yaml
```

Verifique o que está staged:
```powershell
git status
```
Os arquivos em verde estão prontos para commitar. Os em vermelho ainda não foram adicionados.

---

## Passo 6 — Commitar

```powershell
git commit -m "feat(stark): [descrição do que foi feito]"
```

Exemplos de mensagens boas:
```powershell
git commit -m "feat(stark): adicionar meta_ad_account_id dos clientes Vinicius"
git commit -m "fix(stark): corrigir threshold CPL clientes cirurgia corporal"
git commit -m "feat(stark): onboarding Dr. Matheus Ocampo e Dr. Joel Abdala"
```

> Use `feat:` para novidades e `fix:` para correções.

---

## Passo 7 — Subir a branch para o GitHub

```powershell
git push origin feat/vinicius-[descricao-curta]
```

Se for a primeira vez subindo essa branch, o Git vai mostrar uma mensagem confirmando a criação. Se der erro de autenticação, configure o token do GitHub:
```powershell
git config --global credential.helper store
```
E tente o push novamente — vai pedir usuário e token (não senha).

---

## Passo 8 — Abrir o Pull Request no GitHub

1. Acessa: `https://github.com/gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego`
2. O GitHub vai mostrar um banner amarelo: **"feat/vinicius-... had recent pushes — Compare & pull request"**
3. Clica em **Compare & pull request**
4. Confere:
   - **base:** `main`
   - **compare:** `feat/vinicius-[sua-branch]`
5. Escreve um título descritivo
6. Clica em **Create pull request**

---

## Passo 9 — Verificar conflitos

Na página do PR, o GitHub mostra um dos dois estados:

**✅ "No conflicts with base branch"** — pode ser mergeado sem problema. Avisa o Gustavo para revisar e fazer o merge.

**⚠️ "This branch has conflicts"** — existe conflito com o `main`. Isso significa que você e o Gustavo editaram o mesmo arquivo. Siga o Passo 10.

---

## Passo 10 — Resolver conflitos (se houver)

Primeiro, atualize sua branch com o `main` mais recente:

```powershell
git checkout main
git pull origin main
git checkout feat/vinicius-[sua-branch]
git merge main
```

O Git vai apontar quais arquivos têm conflito. Abre cada um no VS Code — vai aparecer assim:

```
<<<<<<< HEAD (sua versão)
conteúdo que você escreveu
=======
conteúdo que está no main
>>>>>>> main
```

Edite o arquivo mantendo o que deve ficar (pode ser sua versão, a do main, ou uma combinação das duas). Depois:

```powershell
git add [arquivo-resolvido]
git commit -m "fix: resolver conflito merge main"
git push origin feat/vinicius-[sua-branch]
```

O PR vai atualizar automaticamente e o conflito some.

---

## Passo 11 — Merge

Após o PR ser aprovado (pelo Gustavo ou por você mesmo se tiver permissão):

1. Clica em **Merge pull request**
2. Clica em **Confirm merge**
3. Pode deletar a branch depois — clica em **Delete branch**

---

## Passo 12 — Atualizar seu main local após o merge

Depois que o PR for mergeado, atualize seu `main` local:

```powershell
git checkout main
git pull origin main
```

A partir daí seu main local está igual ao GitHub com todas as mudanças suas e do Gustavo.

---

## Resumo do fluxo

```
git checkout main
git pull origin main
git checkout -b feat/vinicius-[descricao]

[faz as mudanças]

git add squads/gestor-trafego-stark/
git commit -m "feat(stark): [descrição]"
git push origin feat/vinicius-[descricao]

[abre PR no GitHub]
[avisa Gustavo]
[merge após aprovação]

git checkout main
git pull origin main
```

---

## Dúvidas frequentes

**Posso fazer vários commits antes de abrir o PR?**
Sim. Pode commitar várias vezes na mesma branch e só abrir o PR quando estiver pronto.

**Esqueci de criar uma branch e editei direto no main. E agora?**
```powershell
git stash
git checkout -b feat/vinicius-[descricao]
git stash pop
git add .
git commit -m "feat(stark): [descrição]"
git push origin feat/vinicius-[descricao]
```

**Como vejo o que o Gustavo subiu no main?**
```powershell
git checkout main
git pull origin main
git log --oneline -10
```

**Como vejo quais branches existem no GitHub?**
```powershell
git branch -r
```

---

*Dúvidas: falar com Gustavo Radler*
