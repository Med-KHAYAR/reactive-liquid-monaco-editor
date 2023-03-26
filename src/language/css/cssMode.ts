/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { WorkerManager } from './workerManager';
import type { CSSWorker } from './cssWorker';
import { LanguageServiceDefaults } from './monaco.contribution';
import * as languageFeatures from '../common/lspLanguageFeatures';
import { Uri, IDisposable, languages } from '../../fillers/monaco-editor-core';

export type CssProviders = {
	CompletionAdapter?: languageFeatures.CompletionAdapter<CSSWorker>;
	HoverAdapter?: languageFeatures.HoverAdapter<CSSWorker>;
	DocumentHighlightAdapter?: languageFeatures.DocumentHighlightAdapter<CSSWorker>;
	DefinitionAdapter?: languageFeatures.DefinitionAdapter<CSSWorker>;
	ReferenceAdapter?: languageFeatures.ReferenceAdapter<CSSWorker>;
	DocumentSymbolAdapter?: languageFeatures.DocumentSymbolAdapter<CSSWorker>;
	RenameAdapter?: languageFeatures.RenameAdapter<CSSWorker>;
	DocumentColorAdapter?: languageFeatures.DocumentColorAdapter<CSSWorker>;
	FoldingRangeAdapter?: languageFeatures.FoldingRangeAdapter<CSSWorker>;
	DiagnosticsAdapter?: languageFeatures.DiagnosticsAdapter<CSSWorker>;
	SelectionRangeAdapter?: languageFeatures.SelectionRangeAdapter<CSSWorker>;
	DocumentFormattingEditProvider?: languageFeatures.DocumentFormattingEditProvider<CSSWorker>;
	DocumentRangeFormattingEditProvider?: languageFeatures.DocumentRangeFormattingEditProvider<CSSWorker>;
};

export function setupMode(defaults: LanguageServiceDefaults): IDisposable {
	const disposables: IDisposable[] = [];
	const providers: IDisposable[] = [];

	const client = new WorkerManager(defaults);
	disposables.push(client);

	const worker: languageFeatures.WorkerAccessor<CSSWorker> = (
		...uris: Uri[]
	): Promise<CSSWorker> => {
		return client.getLanguageServiceWorker(...uris);
	};

	function registerProviders(): void {
		const { languageId, modeConfiguration } = defaults;

		disposeAll(providers);

		if (modeConfiguration.completionItems) {
			providers.push(
				languages.registerCompletionItemProvider(
					languageId,
					new languageFeatures.CompletionAdapter(worker, ['/', '-', ':'])
				)
			);
		}
		if (modeConfiguration.hovers) {
			providers.push(
				languages.registerHoverProvider(languageId, new languageFeatures.HoverAdapter(worker))
			);
		}
		if (modeConfiguration.documentHighlights) {
			providers.push(
				languages.registerDocumentHighlightProvider(
					languageId,
					new languageFeatures.DocumentHighlightAdapter(worker)
				)
			);
		}
		if (modeConfiguration.definitions) {
			providers.push(
				languages.registerDefinitionProvider(
					languageId,
					new languageFeatures.DefinitionAdapter(worker)
				)
			);
		}
		if (modeConfiguration.references) {
			providers.push(
				languages.registerReferenceProvider(
					languageId,
					new languageFeatures.ReferenceAdapter(worker)
				)
			);
		}
		if (modeConfiguration.documentSymbols) {
			providers.push(
				languages.registerDocumentSymbolProvider(
					languageId,
					new languageFeatures.DocumentSymbolAdapter(worker)
				)
			);
		}
		if (modeConfiguration.rename) {
			providers.push(
				languages.registerRenameProvider(languageId, new languageFeatures.RenameAdapter(worker))
			);
		}
		if (modeConfiguration.colors) {
			providers.push(
				languages.registerColorProvider(
					languageId,
					new languageFeatures.DocumentColorAdapter(worker)
				)
			);
		}
		if (modeConfiguration.foldingRanges) {
			providers.push(
				languages.registerFoldingRangeProvider(
					languageId,
					new languageFeatures.FoldingRangeAdapter(worker)
				)
			);
		}
		if (modeConfiguration.diagnostics) {
			providers.push(
				new languageFeatures.DiagnosticsAdapter(languageId, worker, defaults.onDidChange)
			);
		}
		if (modeConfiguration.selectionRanges) {
			providers.push(
				languages.registerSelectionRangeProvider(
					languageId,
					new languageFeatures.SelectionRangeAdapter(worker)
				)
			);
		}
		if (modeConfiguration.documentFormattingEdits) {
			providers.push(
				languages.registerDocumentFormattingEditProvider(
					languageId,
					new languageFeatures.DocumentFormattingEditProvider(worker)
				)
			);
		}
		if (modeConfiguration.documentRangeFormattingEdits) {
			providers.push(
				languages.registerDocumentRangeFormattingEditProvider(
					languageId,
					new languageFeatures.DocumentRangeFormattingEditProvider(worker)
				)
			);
		}
	}

	registerProviders();

	disposables.push(asDisposable(providers));

	return asDisposable(disposables);
}
export function setupCssWithProviders(defaults: LanguageServiceDefaults): {
	worker: languageFeatures.WorkerAccessor<CSSWorker>;
	providers: CssProviders;
} {
	const disposables: IDisposable[] = [];
	const providers: IDisposable[] = [];
	let exportedProviders: CssProviders = {};

	const client = new WorkerManager(defaults);
	disposables.push(client);

	const worker: languageFeatures.WorkerAccessor<CSSWorker> = (
		...uris: Uri[]
	): Promise<CSSWorker> => {
		return client.getLanguageServiceWorker(...uris);
	};

	function registerProviders(): void {
		const { languageId, modeConfiguration } = defaults;

		disposeAll(providers);

		if (modeConfiguration.completionItems) {
			const completionAdapter = new languageFeatures.CompletionAdapter(worker, ['/', '-', ':']);
			exportedProviders.CompletionAdapter = completionAdapter;
			providers.push(languages.registerCompletionItemProvider(languageId, completionAdapter));
		}
		if (modeConfiguration.hovers) {
			const hoverAdapter = new languageFeatures.HoverAdapter(worker);
			exportedProviders.HoverAdapter = hoverAdapter;
			providers.push(languages.registerHoverProvider(languageId, hoverAdapter));
		}
		if (modeConfiguration.documentHighlights) {
			const documentHighlightAdapter = new languageFeatures.DocumentHighlightAdapter(worker);
			exportedProviders.DocumentHighlightAdapter = documentHighlightAdapter;
			providers.push(
				languages.registerDocumentHighlightProvider(languageId, documentHighlightAdapter)
			);
		}
		if (modeConfiguration.definitions) {
			const definitionAdapter = new languageFeatures.DefinitionAdapter(worker);
			exportedProviders.DefinitionAdapter = definitionAdapter;
			providers.push(languages.registerDefinitionProvider(languageId, definitionAdapter));
		}
		if (modeConfiguration.references) {
			const referenceAdapter = new languageFeatures.ReferenceAdapter(worker);
			exportedProviders.ReferenceAdapter = referenceAdapter;
			providers.push(languages.registerReferenceProvider(languageId, referenceAdapter));
		}
		if (modeConfiguration.documentSymbols) {
			const documentSymbolAdapter = new languageFeatures.DocumentSymbolAdapter(worker);
			exportedProviders.DocumentSymbolAdapter = documentSymbolAdapter;
			providers.push(languages.registerDocumentSymbolProvider(languageId, documentSymbolAdapter));
		}
		if (modeConfiguration.rename) {
			const renameAdapter = new languageFeatures.RenameAdapter(worker);
			exportedProviders.RenameAdapter = renameAdapter;
			providers.push(languages.registerRenameProvider(languageId, renameAdapter));
		}
		if (modeConfiguration.colors) {
			const documentColorAdapter = new languageFeatures.DocumentColorAdapter(worker);
			exportedProviders.DocumentColorAdapter = documentColorAdapter;
			providers.push(languages.registerColorProvider(languageId, documentColorAdapter));
		}
		if (modeConfiguration.foldingRanges) {
			const foldingRangeAdapter = new languageFeatures.FoldingRangeAdapter(worker);
			exportedProviders.FoldingRangeAdapter = foldingRangeAdapter;
			providers.push(languages.registerFoldingRangeProvider(languageId, foldingRangeAdapter));
		}
		if (modeConfiguration.diagnostics) {
			const diagnosticsAdapter = new languageFeatures.DiagnosticsAdapter(
				languageId,
				worker,
				defaults.onDidChange
			);
			exportedProviders.DiagnosticsAdapter = diagnosticsAdapter;
			providers.push(diagnosticsAdapter);
		}
		if (modeConfiguration.selectionRanges) {
			const selectionRangeAdapter = new languageFeatures.SelectionRangeAdapter(worker);
			exportedProviders.SelectionRangeAdapter = selectionRangeAdapter;
			providers.push(languages.registerSelectionRangeProvider(languageId, selectionRangeAdapter));
		}
		if (modeConfiguration.documentFormattingEdits) {
			const documentFormattingEditProvider = new languageFeatures.DocumentFormattingEditProvider(
				worker
			);
			exportedProviders.DocumentFormattingEditProvider = documentFormattingEditProvider;
			providers.push(
				languages.registerDocumentFormattingEditProvider(languageId, documentFormattingEditProvider)
			);
		}
		if (modeConfiguration.documentRangeFormattingEdits) {
			const documentRangeFormattingEditProvider =
				new languageFeatures.DocumentRangeFormattingEditProvider(worker);
			exportedProviders.DocumentRangeFormattingEditProvider = documentRangeFormattingEditProvider;
			providers.push(
				languages.registerDocumentRangeFormattingEditProvider(
					languageId,
					documentRangeFormattingEditProvider
				)
			);
		}
	}

	registerProviders();

	disposables.push(asDisposable(providers));

	// return worker

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
export * from '../common/lspLanguageFeatures';
