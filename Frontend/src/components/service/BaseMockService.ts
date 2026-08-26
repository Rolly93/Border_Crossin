import { IBaseService } from "./IBaseService";

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

}