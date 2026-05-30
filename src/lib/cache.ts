// src/lib/cache.ts
class DataCache {
  private orders: any[] | null = null;
  private lastFetch: number = 0;
  private ttl: number = 5 * 60 * 1000; // 5 минут (было 1 минута)

  getOrders() {
    if (this.orders && Date.now() - this.lastFetch < this.ttl) {
      console.log('📦 Загрузка из кэша');
      return this.orders;
    }
    return null;
  }

  setOrders(data: any[]) {
    console.log('💾 Сохранение в кэш');
    this.orders = data;
    this.lastFetch = Date.now();
  }

  clearOrders() {
    console.log('🗑️ Кэш очищен');
    this.orders = null;
    this.lastFetch = 0;
  }
}

export const cache = new DataCache();