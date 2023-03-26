/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { WorkerManager } from './workerManager';
import type { TypeScriptWorker } from './tsWorker';
import { LanguageServiceDefaults } from './monaco.contribution';
import * as languageFeatures from './languageFeatures';
import { languages, IDisposable, Uri } from '../../fillers/monaco-editor-core';

export type TypeScriptProviders = {
	SuggestAdapter?: languageFeatures.SuggestAdapter;
	SignatureHelpAdapter?: languageFeatures.SignatureHelpAdapter;
	QuickInfoAdapter?: languageFeatures.QuickInfoAdapter;
	DocumentHighlightAdapter?: languageFeatures.DocumentHighlightAdapter;
	DefinitionAdapter?: languageFeatures.DefinitionAdapter;
	ReferenceAdapter?: languageFeatures.ReferenceAdapter;
	OutlineAdapter?: languageFeatures.OutlineAdapter;
	RenameAdapter?: languageFeatures.RenameAdapter;
	FormatAdapter?: languageFeatures.FormatAdapter;
	FormatOnTypeAdapter?: languageFeatures.FormatOnTypeAdapter;
	CodeActionAdaptor?: languageFeatures.CodeActionAdaptor;
	InlayHintsAdapter?: languageFeatures.InlayHintsAdapter;
	DiagnosticsAdapter?: languageFeatures.DiagnosticsAdapter;
};

let javaScriptWorker: (...uris: Uri[]) => Promise<TypeScriptWorker>;
let typeScriptWorker: (...uris: Uri[]) => Promise<TypeScriptWorker>;

export function setupTypeScript(defaults: LanguageServiceDefaults): void {
	typeScriptWorker = setupMode(defaults, 'typescript');
}

export function setupTypeScriptWithProviders(defaults: LanguageServiceDefaults) {
	return setupModeWithProviders(defaults, 'typescript');
}

export function setupJavaScript(defaults: LanguageServiceDefaults): void {
	javaScriptWorker = setupMode(defaults, 'javascript');
}

export function getJavaScriptWorker(): Promise<(...uris: Uri[]) => Promise<TypeScriptWorker>> {
	return new Promise((resolve, reject) => {
		if (!javaScriptWorker) {
			return reject('JavaScript not registered!');
		}

		resolve(javaScriptWorker);
	});
}

export function getTypeScriptWorker(): Promise<(...uris: Uri[]) => Promise<TypeScriptWorker>> {
	return new Promise((resolve, reject) => {
		if (!typeScriptWorker) {
			return reject('TypeScript not registered!');
		}

		resolve(typeScriptWorker);
	});
}

function setupMode(
	defaults: LanguageServiceDefaults,
	modeId: string
): (...uris: Uri[]) => Promise<TypeScriptWorker> {
	const disposables: IDisposable[] = [];
	const providers: IDisposable[] = [];

	const client = new WorkerManager(modeId, defaults);
	disposables.push(client);

	const worker = (...uris: Uri[]): Promise<TypeScriptWorker> => {
		return client.getLanguageServiceWorker(...uris);
	};

	const libFiles = new languageFeatures.LibFiles(worker);

	function registerProviders(): void {
		const { modeConfiguration } = defaults;

		disposeAll(providers);

		if (modeConfiguration.completionItems) {
			providers.push(
				languages.registerCompletionItemProvider(
					modeId,
					new languageFeatures.SuggestAdapter(worker)
				)
			);
		}
		if (modeConfiguration.signatureHelp) {
			providers.push(
				languages.registerSignatureHelpProvider(
					modeId,
					new languageFeatures.SignatureHelpAdapter(worker)
				)
			);
		}
		if (modeConfiguration.hovers) {
			providers.push(
				languages.registerHoverProvider(modeId, new languageFeatures.QuickInfoAdapter(worker))
			);
		}
		if (modeConfiguration.documentHighlights) {
			providers.push(
				languages.registerDocumentHighlightProvider(
					modeId,
					new languageFeatures.DocumentHighlightAdapter(worker)
				)
			);
		}
		if (modeConfiguration.definitions) {
			providers.push(
				languages.registerDefinitionProvider(
					modeId,
					new languageFeatures.DefinitionAdapter(libFiles, worker)
				)
			);
		}
		if (modeConfiguration.references) {
			providers.push(
				languages.registerReferenceProvider(
					modeId,
					new languageFeatures.ReferenceAdapter(libFiles, worker)
				)
			);
		}
		if (modeConfiguration.documentSymbols) {
			providers.push(
				languages.registerDocumentSymbolProvider(
					modeId,
					new languageFeatures.OutlineAdapter(worker)
				)
			);
		}
		if (modeConfiguration.rename) {
			providers.push(
				languages.registerRenameProvider(
					modeId,
					new languageFeatures.RenameAdapter(libFiles, worker)
				)
			);
		}
		if (modeConfiguration.documentRangeFormattingEdits) {
			providers.push(
				languages.registerDocumentRangeFormattingEditProvider(
					modeId,
					new languageFeatures.FormatAdapter(worker)
				)
			);
		}
		if (modeConfiguration.onTypeFormattingEdits) {
			providers.push(
				languages.registerOnTypeFormattingEditProvider(
					modeId,
					new languageFeatures.FormatOnTypeAdapter(worker)
				)
			);
		}
		if (modeConfiguration.codeActions) {
			providers.push(
				languages.registerCodeActionProvider(modeId, new languageFeatures.CodeActionAdaptor(worker))
			);
		}
		if (modeConfiguration.inlayHints) {
			providers.push(
				languages.registerInlayHintsProvider(modeId, new languageFeatures.InlayHintsAdapter(worker))
			);
		}
		if (modeConfiguration.diagnostics) {
			providers.push(new languageFeatures.DiagnosticsAdapter(libFiles, defaults, modeId, worker));
		}
	}

	registerProviders();

	disposables.push(asDisposable(providers));

	//return asDisposable(disposables);

	return worker;
}

function setupModeWithProviders(
	defaults: LanguageServiceDefaults,
	modeId: string
): { worker: (...uris: Uri[]) => Promise<TypeScriptWorker>; providers: TypeScriptProviders } {
	const disposables: IDisposable[] = [];
	const providers: IDisposable[] = [];
	const exportedProviders: TypeScriptProviders = {};

	const client = new WorkerManager(modeId, defaults);
	disposables.push(client);

	const worker = (...uris: Uri[]): Promise<TypeScriptWorker> => {
		return client.getLanguageServiceWorker(...uris);
	};

	const libFiles = new languageFeatures.LibFiles(worker);

	function registerProviders(): void {
		const { modeConfiguration } = defaults;

		disposeAll(providers);

		if (modeConfiguration.completionItems) {
			const suggestAdapter = new languageFeatures.SuggestAdapter(worker);
			exportedProviders.SuggestAdapter = suggestAdapter;
			providers.push(languages.registerCompletionItemProvider(modeId, suggestAdapter));
		}
		if (modeConfiguration.signatureHelp) {
			const signatureHelpAdapter = new languageFeatures.SignatureHelpAdapter(worker);
			exportedProviders.SignatureHelpAdapter = signatureHelpAdapter;
			providers.push(languages.registerSignatureHelpProvider(modeId, signatureHelpAdapter));
		}
		if (modeConfiguration.hovers) {
			const quickInfoAdapter = new languageFeatures.QuickInfoAdapter(worker);
			exportedProviders.QuickInfoAdapter = quickInfoAdapter;
			providers.push(languages.registerHoverProvider(modeId, quickInfoAdapter));
		}
		if (modeConfiguration.documentHighlights) {
			const documentHighlightAdapter = new languageFeatures.DocumentHighlightAdapter(worker);
			exportedProviders.DocumentHighlightAdapter = documentHighlightAdapter;
			providers.push(languages.registerDocumentHighlightProvider(modeId, documentHighlightAdapter));
		}
		if (modeConfiguration.definitions) {
			const definitionAdapter = new languageFeatures.DefinitionAdapter(libFiles, worker);
			exportedProviders.DefinitionAdapter = definitionAdapter;
			providers.push(languages.registerDefinitionProvider(modeId, definitionAdapter));
		}
		if (modeConfiguration.references) {
			const referenceAdapter = new languageFeatures.ReferenceAdapter(libFiles, worker);
			exportedProviders.ReferenceAdapter = referenceAdapter;
			providers.push(languages.registerReferenceProvider(modeId, referenceAdapter));
		}
		if (modeConfiguration.documentSymbols) {
			const outlineAdapter = new languageFeatures.OutlineAdapter(worker);
			exportedProviders.OutlineAdapter = outlineAdapter;
			providers.push(languages.registerDocumentSymbolProvider(modeId, outlineAdapter));
		}
		if (modeConfiguration.rename) {
			const renameAdapter = new languageFeatures.RenameAdapter(libFiles, worker);
			exportedProviders.RenameAdapter = renameAdapter;
			providers.push(languages.registerRenameProvider(modeId, renameAdapter));
		}
		if (modeConfiguration.documentRangeFormattingEdits) {
			const formatAdapter = new languageFeatures.FormatAdapter(worker);
			exportedProviders.FormatAdapter = formatAdapter;
			providers.push(languages.registerDocumentRangeFormattingEditProvider(modeId, formatAdapter));
		}
		if (modeConfiguration.onTypeFormattingEdits) {
			const formatOnTypeAdapter = new languageFeatures.FormatOnTypeAdapter(worker);
			exportedProviders.FormatOnTypeAdapter = formatOnTypeAdapter;
			providers.push(languages.registerOnTypeFormattingEditProvider(modeId, formatOnTypeAdapter));
		}
		if (modeConfiguration.codeActions) {
			const codeActionAdaptor = new languageFeatures.CodeActionAdaptor(worker);
			exportedProviders.CodeActionAdaptor = codeActionAdaptor;
			providers.push(languages.registerCodeActionProvider(modeId, codeActionAdaptor));
		}
		if (modeConfiguration.inlayHints) {
			const inlayHintsAdapter = new languageFeatures.InlayHintsAdapter(worker);
			exportedProviders.InlayHintsAdapter = inlayHintsAdapter;
			providers.push(languages.registerInlayHintsProvider(modeId, inlayHintsAdapter));
		}
		if (modeConfiguration.diagnostics) {
			const diagnosticsAdapter = new languageFeatures.DiagnosticsAdapter(
				libFiles,
				defaults,
				modeId,
				worker
			);
			exportedProviders.DiagnosticsAdapter = diagnosticsAdapter;
			providers.push(new languageFeatures.DiagnosticsAdapter(libFiles, defaults, modeId, worker));
		}
	}

	registerProviders();

	disposables.push(asDisposable(providers));

	//return asDisposable(disposables);

	return { worker: worker, providers: exportedProviders };
}

function asDisposable(disposables: IDisposable[]): IDisposable {
	return { dispose: () => disposeAll(disposables) };
}

function disposeAll(disposables: IDisposable[]) {
	while (disposables.length) {
		disposables.pop()!.dispose();
	}
}

export { WorkerManager } from './workerManager';
export * from './languageFeatures';
