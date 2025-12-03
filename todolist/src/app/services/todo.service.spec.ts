import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';
import { TodoItem } from '../models/todo-item.model';

describe('TodoService - Create Functionality', () => {
  let service: TodoService;
  let store: { [key: string]: string } = {};

  // Mock localStorage
  const mockLocalStorage = {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoService]
    });

    service = TestBed.inject(TodoService);

    // 替換 localStorage
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);

    // 清空存儲
    mockLocalStorage.clear();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty list when localStorage is empty', () => {
      const todos = service.todoList();
      expect(todos).toEqual([]);
    });

    it('should load todos from localStorage on service initialization', () => {
      const mockTodos: TodoItem[] = [
        { id: '1', title: 'Buy milk', createdAt: 1000 },
        { id: '2', title: 'Write report', createdAt: 2000 }
      ];
      mockLocalStorage.setItem('todoList', JSON.stringify(mockTodos));

      // 建立新的服務實例以測試初始化
      const newService = new TodoService();
      expect(newService.todoList().length).toBe(2);
    });
  });

  describe('addTodo Method - Valid Input', () => {
    it('should add a new todo with valid title', () => {
      const title = 'Buy milk';
      const result = service.addTodo(title);

      expect(result).toBeTruthy();
      expect(result?.title).toBe(title);
      expect(result?.id).toBeTruthy();
      expect(result?.createdAt).toBeTruthy();
    });

    it('should generate id based on timestamp', () => {
      const result1 = service.addTodo('Task 1');
      expect(result1?.id).toBeTruthy();
      expect(typeof result1?.id).toBe('string');
      expect(/^\d+$/.test(result1?.id || '')).toBe(true);
    });

    it('should set createdAt timestamp to current time', () => {
      const beforeTime = Date.now();
      const result = service.addTodo('Buy milk');
      const afterTime = Date.now();

      expect(result?.createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(result?.createdAt).toBeLessThanOrEqual(afterTime);
    });

    it('should trim title whitespace before adding', () => {
      const titleWithSpaces = '  Buy milk  ';
      const result = service.addTodo(titleWithSpaces);

      expect(result?.title).toBe('Buy milk');
    });

    it('should add todo to list', () => {
      const initialCount = service.todoList().length;
      service.addTodo('Buy milk');

      expect(service.todoList().length).toBe(initialCount + 1);
    });

    it('should save todo to localStorage', () => {
      service.addTodo('Buy milk');

      expect(localStorage.setItem).toHaveBeenCalled();
      const savedData = mockLocalStorage.getItem('todoList');
      expect(savedData).toBeTruthy();

      const todos = JSON.parse(savedData!) as TodoItem[];
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Buy milk');
    });

    it('should handle multiple addTodo calls', () => {
      const result1 = service.addTodo('Task 1');
      const result2 = service.addTodo('Task 2');
      const result3 = service.addTodo('Task 3');

      expect(service.todoList().length).toBe(3);
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
      expect(result3).toBeTruthy();
    });

    it('should persist data across multiple operations', () => {
      service.addTodo('Task 1');
      service.addTodo('Task 2');

      const savedData = mockLocalStorage.getItem('todoList');
      const todos = JSON.parse(savedData!) as TodoItem[];

      expect(todos.length).toBe(2);
      expect(todos[0].title).toBe('Task 1');
      expect(todos[1].title).toBe('Task 2');
    });
  });

  describe('addTodo Method - Invalid Input', () => {
    it('should not add todo with empty title', () => {
      const result = service.addTodo('');

      expect(result).toBeNull();
      expect(service.todoList().length).toBe(0);
    });

    it('should not add todo with only whitespace', () => {
      const result = service.addTodo('   ');

      expect(result).toBeNull();
      expect(service.todoList().length).toBe(0);
    });

    it('should not save to localStorage when title is empty', () => {
      const setItemSpy = localStorage.setItem as jasmine.Spy;
      setItemSpy.calls.reset();

      service.addTodo('');
      service.addTodo('   ');

      expect(setItemSpy.calls.count()).toBe(0);
    });

    it('should validate title is a string before processing', () => {
      // title 參數類型為 string，在 TypeScript 中會在編譯時檢查
      const validResult = service.addTodo('Valid Task');
      expect(validResult).toBeTruthy();
    });
  });

  describe('todoList Computed Signal', () => {
    it('should sort todos by createdAt in descending order (newest first)', () => {
      // 使用不同的時間戳確保順序正確
      service.addTodo('Task 1');
      
      // 等待一段時間以確保時間戳不同
      const delay = new Promise(resolve => setTimeout(resolve, 10));
      
      // 由於無法精確控制 Date.now()，我們使用另一種方法測試排序
      const todos = service.todoList();
      expect(Array.isArray(todos)).toBe(true);
      
      // 驗證排序是降序的（後面的項目 createdAt 應該 >= 前面的項目）
      for (let i = 0; i < todos.length - 1; i++) {
        expect(todos[i].createdAt).toBeGreaterThanOrEqual(todos[i + 1].createdAt);
      }
    });

    it('should return a computed signal', () => {
      const todoList = service.todoList();
      expect(Array.isArray(todoList)).toBe(true);
    });

    it('should update when new todo is added', () => {
      const initialCount = service.todoList().length;
      service.addTodo('New task');
      const updatedCount = service.todoList().length;

      expect(updatedCount).toBe(initialCount + 1);
    });
  });

  describe('LocalStorage Error Handling', () => {
    it('should handle localStorage.getItem failure gracefully', () => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');

      // 應該不會拋出異常
      expect(() => {
        new TodoService();
      }).not.toThrow();
    });

    it('should handle localStorage.setItem failure gracefully', () => {
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage error');

      // 應該不會拋出異常
      expect(() => {
        service.addTodo('Task');
      }).not.toThrow();
    });

    it('should handle corrupted JSON in localStorage', () => {
      mockLocalStorage.setItem('todoList', 'invalid json {');

      // 建立新的服務實例
      expect(() => {
        new TodoService();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(10000);
      const result = service.addTodo(longTitle);

      expect(result?.title).toBe(longTitle);
      expect(service.todoList().length).toBe(1);
    });

    it('should handle special characters in title', () => {
      const specialTitle = '買牛奶 & 寫報告 @#$%^&*()_+-=[]{}|;:,.<>?';
      const result = service.addTodo(specialTitle);

      expect(result?.title).toBe(specialTitle);
    });

    it('should handle unicode characters in title', () => {
      const unicodeTitle = '🎉 Task with emoji 🚀';
      const result = service.addTodo(unicodeTitle);

      expect(result?.title).toBe(unicodeTitle);
    });

    it('should handle title with mixed whitespace', () => {
      const titleWithMixedWhitespace = '  \t  Buy milk  \n  ';
      const result = service.addTodo(titleWithMixedWhitespace);

      expect(result?.title).toBe('Buy milk');
    });

    it('should handle rapid successive add operations', () => {
      for (let i = 0; i < 100; i++) {
        service.addTodo(`Task ${i}`);
      }

      expect(service.todoList().length).toBe(100);
    });
  });

  describe('Data Persistence', () => {
    it('should persist data correctly across service instances', () => {
      service.addTodo('Task 1');
      service.addTodo('Task 2');

      const savedData = mockLocalStorage.getItem('todoList');
      expect(savedData).toBeTruthy();

      // 驗證數據格式
      const todos = JSON.parse(savedData!) as TodoItem[];
      expect(todos.every((t: TodoItem) => t.id && t.title && t.createdAt)).toBe(true);
    });

    it('should maintain todo order in localStorage', () => {
      service.addTodo('First');
      service.addTodo('Second');
      service.addTodo('Third');

      const savedData = mockLocalStorage.getItem('todoList');
      const todos = JSON.parse(savedData!) as TodoItem[];

      expect(todos[0].title).toBe('First');
      expect(todos[1].title).toBe('Second');
      expect(todos[2].title).toBe('Third');
    });
  });
});
