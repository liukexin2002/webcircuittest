/**
 * 命令模式基础接口
 * 定义所有操作命令的规范
 */

export interface Command {
  /**
   * 执行命令
   */
  execute(): void;

  /**
   * 撤销命令
   */
  undo(): void;

  /**
   * 获取命令描述
   */
  getDescription(): string;
}

/**
 * 复合命令 - 组合多个命令
 */
export class CompositeCommand implements Command {
  private commands: Command[];
  private description: string;

  constructor(commands: Command[], description: string = 'Composite Operation') {
    this.commands = [...commands];
    this.description = description;
  }

  execute(): void {
    for (const command of this.commands) {
      command.execute();
    }
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  getDescription(): string {
    return this.description;
  }

  /**
   * 添加命令到组合
   */
  addCommand(command: Command): void {
    this.commands.push(command);
  }
}
