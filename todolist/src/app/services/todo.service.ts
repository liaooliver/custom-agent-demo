import { Injectable, signal, computed } from '@angular/core';
import { TodoItem } from '../models/todo-item.model';

/** localStorage 儲存的 key */
const STORAGE_KEY = 'todoList';

/**
 * Todo Service，負責管理待辦事項的 CRUD 操作與 localStorage 存取
 */
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  /** 待辦事項列表的 Signal 狀態 */
  private readonly _todoList = signal<TodoItem[]>(this.loadFromStorage());

  /** 公開的唯讀待辦事項列表（依建立時間降序排列，最新在最上方） */
  readonly todoList = computed(() =>
    [...this._todoList()].sort((a, b) => b.createdAt - a.createdAt)
  );

  /**
   * 新增待辦事項
   * @param title 待辦事項標題
   * @returns 新增的待辦事項，若標題為空則回傳 null
   */
  addTodo(title: string): TodoItem | null {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return null;
    }

    const now = Date.now();
    const newTodo: TodoItem = {
      id: now.toString(),
      title: trimmedTitle,
      createdAt: now
    };

    this._todoList.update(list => [...list, newTodo]);
    this.saveToStorage();

    return newTodo;
  }

  /**
   * 從 localStorage 載入待辦事項列表
   * @returns 待辦事項陣列
   */
  private loadFromStorage(): TodoItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as TodoItem[];
      }
    } catch (error) {
      console.error('載入 localStorage 失敗:', error);
    }
    return [];
  }

  /**
   * 將待辦事項列表儲存至 localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._todoList()));
    } catch (error) {
      console.error('儲存至 localStorage 失敗:', error);
    }
  }
}
