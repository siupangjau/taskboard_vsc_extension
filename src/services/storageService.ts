import * as vscode from 'vscode';
import { BoardFile } from '../types';

export interface WorkspaceState {
  lastOpenedFile?: BoardFile;
  recentFiles: string[];
  columnOrder: string[];
}

export class StorageService {
  private static readonly MAX_RECENT_FILES = 5;
  private static readonly LAST_OPENED_FILE_KEY = 'lastOpenedFile';
  private static readonly BOARD_STATE_KEY = 'boardState';

  constructor(private workspaceState: vscode.Memento) {
    // Initialize default state if needed
    if (!this.getState()) {
      this.setState({
        recentFiles: [],
        columnOrder: ['todo', 'in-progress', 'done']
      });
    }
  }

  getState(): WorkspaceState {
    return this.workspaceState.get<WorkspaceState>(StorageService.BOARD_STATE_KEY, {
      recentFiles: [],
      columnOrder: ['todo', 'in-progress', 'done']
    });
  }

  setState(state: WorkspaceState): Thenable<void> {
    return this.workspaceState.update(StorageService.BOARD_STATE_KEY, state);
  }

  async updateLastOpenedFile(filePath: string): Promise<void> {
    const state = this.getState();
    state.recentFiles = [
      filePath,
      ...state.recentFiles.filter(f => f !== filePath)
    ].slice(0, StorageService.MAX_RECENT_FILES);

    await this.setState(state);
  }

  async updateColumnOrder(columnOrder: string[]): Promise<void> {
    const state = this.getState();
    state.columnOrder = columnOrder;
    await this.setState(state);
  }

  getLastOpenedFile(): BoardFile | undefined {
    return this.workspaceState.get<BoardFile>(StorageService.LAST_OPENED_FILE_KEY);
  }

  getRecentFiles(): string[] {
    return this.getState().recentFiles;
  }

  getColumnOrder(): string[] {
    return this.getState().columnOrder;
  }

  async clearState(): Promise<void> {
    await this.workspaceState.update(StorageService.BOARD_STATE_KEY, undefined);
    await this.workspaceState.update(StorageService.LAST_OPENED_FILE_KEY, undefined);
  }

  setLastOpenedFile(boardFile: BoardFile): Thenable<void> {
    return this.workspaceState.update(StorageService.LAST_OPENED_FILE_KEY, boardFile);
  }
} 