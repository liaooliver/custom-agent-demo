import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../../services/todo.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { signal, computed } from '@angular/core';
import { TodoItem } from '../../models/todo-item.model';

describe('TodoListComponent - Create Functionality', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let todoServiceSpy: jasmine.SpyObj<TodoService>;
  let mockTodoListSignal: any;

  beforeEach(() => {
    // 建立模擬的 TodoService
    const spy = jasmine.createSpyObj('TodoService', ['addTodo']);
    mockTodoListSignal = signal<TodoItem[]>([]);
    spy.todoList = computed(() => [...mockTodoListSignal()].sort((a, b) => b.createdAt - a.createdAt));

    TestBed.configureTestingModule({
      imports: [TodoListComponent, FormsModule, DatePipe],
      providers: [
        { provide: TodoService, useValue: spy }
      ]
    });

    todoServiceSpy = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>;
    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty title input', () => {
      expect(component['newTodoTitle']()).toBe('');
    });
  });

  describe('addTodo Method - Valid Input', () => {
    it('should call todoService.addTodo with trimmed title when adding valid todo', () => {
      const title = 'Buy milk';
      const mockTodo: TodoItem = { id: '1', title, createdAt: Date.now() };
      todoServiceSpy.addTodo.and.returnValue(mockTodo);

      component['newTodoTitle'].set(title);
      component['addTodo']();

      expect(todoServiceSpy.addTodo).toHaveBeenCalledWith(title);
    });

    it('should clear input field after successfully adding todo', () => {
      const title = 'Buy milk';
      const mockTodo: TodoItem = { id: '1', title, createdAt: Date.now() };
      todoServiceSpy.addTodo.and.returnValue(mockTodo);

      component['newTodoTitle'].set(title);
      component['addTodo']();

      expect(component['newTodoTitle']()).toBe('');
    });

    it('should not clear input field if service returns null', () => {
      const title = 'Buy milk';
      todoServiceSpy.addTodo.and.returnValue(null);

      component['newTodoTitle'].set(title);
      component['addTodo']();

      expect(component['newTodoTitle']()).toBe(title);
    });

    it('should trim whitespace from title before adding', () => {
      const titleWithSpaces = '  Buy milk  ';
      const trimmedTitle = 'Buy milk';
      const mockTodo: TodoItem = { id: '1', title: trimmedTitle, createdAt: Date.now() };
      todoServiceSpy.addTodo.and.returnValue(mockTodo);

      component['newTodoTitle'].set(titleWithSpaces);
      component['addTodo']();

      expect(component['newTodoTitle']()).toBe('');
    });
  });

  describe('addTodo Method - Invalid Input', () => {
    it('should not call todoService.addTodo when title is empty', () => {
      component['newTodoTitle'].set('');
      component['addTodo']();

      expect(todoServiceSpy.addTodo).not.toHaveBeenCalled();
    });

    it('should not call todoService.addTodo when title contains only whitespace', () => {
      component['newTodoTitle'].set('   ');
      component['addTodo']();

      expect(todoServiceSpy.addTodo).not.toHaveBeenCalled();
    });

    it('should not clear input when service returns null (validation failure)', () => {
      const title = 'Buy milk';
      todoServiceSpy.addTodo.and.returnValue(null);

      component['newTodoTitle'].set(title);
      component['addTodo']();

      expect(component['newTodoTitle']()).toBe(title);
      expect(todoServiceSpy.addTodo).toHaveBeenCalledWith(title.trim());
    });
  });

  describe('Keyboard Input - Enter Key', () => {
    it('should add todo when Enter key is pressed with valid title', () => {
      const title = 'Buy milk';
      const mockTodo: TodoItem = { id: '1', title, createdAt: Date.now() };
      todoServiceSpy.addTodo.and.returnValue(mockTodo);

      component['newTodoTitle'].set(title);
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component['onInputKeydown'](event);

      expect(todoServiceSpy.addTodo).toHaveBeenCalledWith(title);
      expect(component['newTodoTitle']()).toBe('');
    });

    it('should not add todo when Enter key is pressed with empty title', () => {
      component['newTodoTitle'].set('');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component['onInputKeydown'](event);

      expect(todoServiceSpy.addTodo).not.toHaveBeenCalled();
    });

    it('should not trigger add action for other keys', () => {
      const title = 'Buy milk';
      component['newTodoTitle'].set(title);

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component['onInputKeydown'](event);

      expect(todoServiceSpy.addTodo).not.toHaveBeenCalled();
      expect(component['newTodoTitle']()).toBe(title);
    });
  });

  describe('Template Integration', () => {
    it('should disable add button when input is empty', () => {
      component['newTodoTitle'].set('');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.add-btn');
      expect(button.disabled).toBe(true);
    });

    it('should enable add button when input has valid text', () => {
      component['newTodoTitle'].set('Buy milk');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.add-btn');
      expect(button.disabled).toBe(false);
    });

    it('should disable add button when input has only whitespace', () => {
      component['newTodoTitle'].set('   ');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.add-btn');
      expect(button.disabled).toBe(true);
    });

    it('should update input field when user types', () => {
      const input = fixture.nativeElement.querySelector('.todo-input');
      input.value = 'Buy milk';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component['newTodoTitle']()).toBe('Buy milk');
    });

    it('should add todo when button is clicked', () => {
      const title = 'Buy milk';
      const mockTodo: TodoItem = { id: '1', title, createdAt: Date.now() };
      todoServiceSpy.addTodo.and.returnValue(mockTodo);

      component['newTodoTitle'].set(title);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.add-btn');
      button.click();

      expect(todoServiceSpy.addTodo).toHaveBeenCalledWith(title);
      expect(component['newTodoTitle']()).toBe('');
    });

    it('should display empty message when todo list is empty', () => {
      fixture.detectChanges();

      const emptyMessage = fixture.nativeElement.querySelector('.empty-message');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('目前沒有待辦事項');
    });

    it('should display todos in the list when todoList is not empty', () => {
      const mockTodos: TodoItem[] = [
        { id: '1', title: 'Buy milk', createdAt: Date.now() },
        { id: '2', title: 'Write report', createdAt: Date.now() + 1000 }
      ];
      mockTodoListSignal.set(mockTodos);
      fixture.detectChanges();

      const todoItems = fixture.nativeElement.querySelectorAll('.todo-item');
      expect(todoItems.length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive add attempts', () => {
      const title = 'Buy milk';
      const mockTodo: TodoItem = { id: '1', title, createdAt: Date.now() };
      todoServiceSpy.addTodo.and.returnValue(mockTodo);

      component['newTodoTitle'].set(title);
      component['addTodo']();
      component['addTodo']();
      component['addTodo']();

      expect(todoServiceSpy.addTodo).toHaveBeenCalledTimes(1);
    });

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(1000);
      const mockTodo: TodoItem = { id: '1', title: longTitle, createdAt: Date.now() };
      todoServiceSpy.addTodo.and.returnValue(mockTodo);

      component['newTodoTitle'].set(longTitle);
      component['addTodo']();

      expect(todoServiceSpy.addTodo).toHaveBeenCalledWith(longTitle);
    });

    it('should handle special characters in title', () => {
      const specialTitle = '買牛奶 & 寫報告 @#$%';
      const mockTodo: TodoItem = { id: '1', title: specialTitle, createdAt: Date.now() };
      todoServiceSpy.addTodo.and.returnValue(mockTodo);

      component['newTodoTitle'].set(specialTitle);
      component['addTodo']();

      expect(todoServiceSpy.addTodo).toHaveBeenCalledWith(specialTitle);
    });
  });

  describe('trackById Function', () => {
    it('should return todo id for tracking', () => {
      const todo: TodoItem = { id: 'test-id', title: 'Test', createdAt: Date.now() };
      const result = component['trackById'](0, todo);

      expect(result).toBe('test-id');
    });

    it('should have consistent tracking for same todo', () => {
      const todo: TodoItem = { id: 'test-id', title: 'Test', createdAt: Date.now() };
      const result1 = component['trackById'](0, todo);
      const result2 = component['trackById'](0, todo);

      expect(result1).toBe(result2);
    });
  });
});
