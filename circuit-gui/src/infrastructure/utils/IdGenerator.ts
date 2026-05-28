/**
 * ID 生成器
 * 生成唯一标识符
 */

export class IdGenerator {
  private static counter = 0;
  private static prefix = 'cg';

  /**
   * 生成唯一ID
   */
  static generate(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const counter = (++this.counter).toString(36);
    return `${this.prefix}_${timestamp}_${counter}_${random}`;
  }

  /**
   * 生成设备ID
   */
  static generateDeviceId(): string {
    return `${this.prefix}_dev_${this.generate()}`;
  }

  /**
   * 生成连接ID
   */
  static generateConnectionId(): string {
    return `${this.prefix}_conn_${this.generate()}`;
  }

  /**
   * 生成网络ID
   */
  static generateNetId(): string {
    return `${this.prefix}_net_${this.generate()}`;
  }

  /**
   * 生成引脚ID
   */
  static generatePinId(): string {
    return `${this.prefix}_pin_${this.generate()}`;
  }

  /**
   * 设置前缀
   */
  static setPrefix(prefix: string): void {
    this.prefix = prefix;
  }
}
