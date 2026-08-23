import { Editor, EditorCommandName, Plugin } from "obsidian";

interface MoveCommand {
	id: string;
	name: string;
	icon: string;
	exec: EditorCommandName;
}

const MOVE_COMMANDS: MoveCommand[] = [
	{ id: "cursor-left", name: "Cursor para a esquerda", icon: "arrow-left", exec: "goLeft" },
	{ id: "cursor-right", name: "Cursor para a direita", icon: "arrow-right", exec: "goRight" },
	{ id: "cursor-up", name: "Cursor para cima", icon: "arrow-up", exec: "goUp" },
	{ id: "cursor-down", name: "Cursor para baixo", icon: "arrow-down", exec: "goDown" },
	{ id: "word-left", name: "Palavra para a esquerda", icon: "arrow-left-to-line", exec: "goWordLeft" },
	{ id: "word-right", name: "Palavra para a direita", icon: "arrow-right-to-line", exec: "goWordRight" },
];

/**
 * Plugin interno do Obsidian que desenha a toolbar acima do teclado no mobile.
 * A config dela mora em workspace-mobile.json — que NÃO sincroniza pelo
 * Syncthing (ver .stignore do vault) — então cada aparelho teria que adicionar
 * os comandos na mão. Para evitar isso, registramos os comandos direto aqui.
 * É API interna: qualquer mudança de formato cai no catch e o caminho manual
 * (Configurações → Barra de ferramentas móvel) continua funcionando.
 */
interface MobileToolbarInstance {
	options?: Record<string, unknown>;
	saveSettings?: () => void;
	reconfigure?: () => void;
	load?: () => void;
}

interface MobileToolbarPluginRecord {
	instance?: MobileToolbarInstance;
	saveSettings?: () => void;
}

export default class MobileArrowsPlugin extends Plugin {
	async onload() {
		for (const cmd of MOVE_COMMANDS) {
			this.addCommand({
				id: cmd.id,
				name: cmd.name,
				icon: cmd.icon,
				mobileOnly: true,
				editorCallback: (editor: Editor) => {
					editor.exec(cmd.exec);
					editor.focus();
				},
			});
		}

		this.app.workspace.onLayoutReady(() => {
			this.addToMobileToolbar();
		});
	}

	private addToMobileToolbar() {
		try {
			const internal = (this.app as unknown as {
				internalPlugins?: {
					plugins?: Record<string, MobileToolbarPluginRecord>;
					getPluginById?: (id: string) => MobileToolbarPluginRecord | null;
				};
			}).internalPlugins;

			const record = internal?.plugins?.["mobile-toolbar"] ?? internal?.getPluginById?.("mobile-toolbar") ?? undefined;
			const instance = record?.instance;
			const options = instance?.options;
			if (!options) {
				return; // toolbar móvel desativada (ou desktop): nada a fazer
			}

			// Nome do campo varia entre versões do Obsidian; aceita os dois conhecidos.
			const key = ["toolbarCommands", "toolbar"].find((candidate) =>
				Array.isArray(options[candidate]),
			);
			if (!key) {
				return;
			}

			const list = options[key] as unknown[];
			let changed = false;
			for (const cmd of MOVE_COMMANDS) {
				const fullId = `mobile-arrows:${cmd.id}`;
				if (!list.includes(fullId)) {
					list.push(fullId);
					changed = true;
				}
			}
			if (!changed) {
				return;
			}

			// Persiste e redesenha; os métodos variam por versão, chama o que existir.
			instance?.saveSettings?.();
			record?.saveSettings?.();
			instance?.reconfigure?.();
			instance?.load?.();
			this.app.workspace.trigger("mobile-toolbar:refresh" as never);
			console.log("[mobile-arrows] comandos adicionados à toolbar móvel");
		} catch (error) {
			console.warn("[mobile-arrows] não consegui registrar na toolbar móvel:", error);
		}
	}
}
