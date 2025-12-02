import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TodoListComponent } from './components/todo-list/todo-list.component';

/**
 * 應用程式根元件
 */
@Component({
  selector: 'app-root',
  imports: [TodoListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
