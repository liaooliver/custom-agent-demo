import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TodoService } from '../../services/todo.service';

/**
 * Todo List 元件，負責顯示待辦事項列表與新增功能
 */
@Component({
  selector: 'app-todo-list',
  imports: [FormsModule, DatePipe],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent {
  private readonly todoService = inject(TodoService);

  /** 新增輸入框的值 */
  protected readonly newTodoTitle = signal('');

  /** 待辦事項列表（來自 Service） */
  protected readonly todoList = this.todoService.todoList;

  /** 編輯模式中的待辦事項 ID */
  protected readonly editingId = signal<string | null>(null);

  /** 編輯中的標題值 */
  protected readonly editTitle = signal('');

  /**
   * 新增待辦事項
   */
  protected addTodo(): void {
    const title = this.newTodoTitle();
    if (!title.trim()) {
      return;
    }

    const result = this.todoService.addTodo(title);
    if (result) {
      this.newTodoTitle.set('');
    }
  }

  /**
   * 處理輸入框的鍵盤事件（Enter 新增）
   * @param event 鍵盤事件
   */
  protected onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.addTodo();
    }
  }

  /**
   * 追蹤函式，用於 @for 迴圈
   * @param item 待辦事項
   * @returns 待辦事項的唯一識別碼
   */
  protected trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  /**
   * 進入編輯模式
   * @param id 待辦事項的唯一識別碼
   * @param currentTitle 待辦事項的目前標題
   */
  protected startEdit(id: string, currentTitle: string): void {
    this.editingId.set(id);
    this.editTitle.set(currentTitle);
  }

  /**
   * 取消編輯
   */
  protected cancelEdit(): void {
    this.editingId.set(null);
    this.editTitle.set('');
  }

  /**
   * 儲存編輯
   * @param id 待辦事項的唯一識別碼
   */
  protected saveEdit(id: string): void {
    const newTitle = this.editTitle();
    if (!newTitle.trim()) {
      return;
    }

    if (this.todoService.updateTodo(id, newTitle)) {
      this.editingId.set(null);
      this.editTitle.set('');
    }
  }

  /**
   * 處理編輯框的鍵盤事件
   * @param event 鍵盤事件
   * @param id 待辦事項的唯一識別碼
   */
  protected onEditKeydown(event: KeyboardEvent, id: string): void {
    if (event.key === 'Enter') {
      this.saveEdit(id);
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }
}
