# Mobile Arrows

Setas direcionais na **toolbar móvel** do Obsidian (a barra acima do teclado no
Android/iOS), para mover o cursor de texto como as setas do teclado no computador —
sem depender de toque preciso na tela.

## Comandos

| Comando | Ícone | Movimento |
| --- | --- | --- |
| Cursor para a esquerda / direita | ← → | um caractere |
| Cursor para cima / baixo | ↑ ↓ | uma linha visual |
| Palavra para a esquerda / direita | ⇤ ⇥ | uma palavra (equivale a Alt+←/→) |

Os comandos só aparecem em dispositivos móveis (`mobileOnly`) e só ficam ativos
com um editor em foco.

## Toolbar se configura sozinha

A configuração da toolbar móvel mora em `workspace-mobile.json`, que **não
sincroniza** pelo Syncthing (ver `.stignore` do vault). Por isso, ao carregar num
dispositivo móvel, o plugin tenta registrar os 6 comandos direto no plugin
interno `mobile-toolbar` (idempotente: não duplica em reloads).

Se o Obsidian mudar essa API interna e o registro automático falhar, o fallback
manual é: **Configurações → Barra de ferramentas móvel → adicionar** os comandos
"Cursor para…" / "Palavra para…".

## Desenvolvimento

```sh
npm install
npm run build        # typecheck + bundle em build/
npm run build:copy   # build + copia para ~/Documents/Vault/.obsidian/plugins/mobile-arrows
```

O vault real sincroniza por Syncthing — depois do `build:copy`, o plugin chega ao
celular já habilitado (o `community-plugins.json` também sincroniza).
