import { IBaseService, PaginatedResponse } from "./IBaseService";

export abstract class BaseMockService<T extends { id: number }> implements IBaseService<T> {
  constructor(protected mockData: T[]) { }

  protected delay(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAll(): Promise<T[]> {
    await this.delay(600);
    return [...this.mockData];
  }

  async update(id: number, data: T): Promise<T> {
    await this.delay(100);

    const index = this.mockData.findIndex((item) => item.id === id);

    console.log(index);


    if (index !== -1) {
      const updatedItem = { ...this.mockData[index], ...data, id }
      this.mockData[index] = updatedItem;
      return updatedItem;

    }
    throw new Error("Item not Found");

  }

  async insert(data: T): Promise<T> {
    await this.delay(100);

    const nextId =
      this.mockData.length > 0
        ? Math.max(...this.mockData.map((i) => i.id || 0)) + 1
        : 1;

    const newItem = { ...data, id: nextId };
    this.mockData.push(newItem);
    return newItem;
  }
  async delete(id: number): Promise<T> {
    await this.delay(100);

    const itemDelte = this.mockData.find((data) => data.id === id)
    if (!itemDelte) { throw new Error('Item no found'); }

    this.mockData = this.mockData.filter((data) => data.id !== id)
    return itemDelte
  }
  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<T>> {
    await this.delay(1000);
    const safeData = Array.isArray(this.mockData) ? this.mockData : [];

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