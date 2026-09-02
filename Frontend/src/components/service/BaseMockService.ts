import { IBaseService, PaginatedResponse } from "./IBaseService";

export abstract class BaseMockService<T extends { id: number }> implements IBaseService<T> {
  protected items: T[]
  constructor(protected mockData: T[]) {
    this.items = mockData
  }

  protected delay(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAll(): Promise<T[]> {
    await this.delay(600);
    return [...this.items];
  }

  async update(id: number, data: T): Promise<T> {
    await this.delay(100);

    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      const updatedItem = { ...this.items[index], ...data, id }
      this.items[index] = updatedItem;
      return updatedItem;

    }
    throw new Error("Item not Found");

  }

  async insert(data: T): Promise<T> {
    await this.delay(100);

    const nextId =
      this.items.length > 0
        ? Math.max(...this.items.map((i) => i.id || 0)) + 1
        : 1;

    const newItem = { ...data, id: nextId };
    this.items.push(newItem);
    return newItem;
  }
  async delete(id: number): Promise<T> {
    await this.delay(100);

    const itemDelte = this.items.find((data) => data.id === id)
    if (!itemDelte) { throw new Error('Item no found'); }

    this.items = this.items.filter((data) => data.id !== id)
    return itemDelte
  }
  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<T>> {
    await this.delay(1000);
    const safeData = Array.isArray(this.items) ? this.items : [];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = safeData.slice(startIndex, endIndex);
    return {
      data,
      totalRecords: safeData.length,
      hasNextPage: endIndex < safeData.length,
      page, limit
    }
  }



}