
/**
 * Telegram Bot API Utilities
 */

// Types for Telegram Bot API
export interface TelegramBotConfig {
  token: string;
  apiBaseUrl?: string;
}

export interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
  error_code?: number;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
    entities?: {
      offset: number;
      length: number;
      type: string;
    }[];
  };
}

export interface TelegramCommand {
  command: string;
  description: string;
}

export type CommandHandler = (message: TelegramUpdate['message'], args: string) => Promise<TelegramMessage>;

// Default Telegram API base URL
const DEFAULT_API_BASE = 'https://api.telegram.org/bot';

// Class to manage Telegram Bot API interactions
export class TelegramBotApi {
  private token: string;
  private apiBaseUrl: string;
  private commandHandlers: Map<string, CommandHandler> = new Map();

  constructor(config: TelegramBotConfig) {
    this.token = config.token;
    this.apiBaseUrl = config.apiBaseUrl || DEFAULT_API_BASE;
  }

  // Register command handler
  registerCommand(command: string, handler: CommandHandler) {
    this.commandHandlers.set(command.toLowerCase(), handler);
    return this;
  }

  // Process incoming update
  async processUpdate(update: TelegramUpdate): Promise<void> {
    if (!update.message || !update.message.text) {
      return;
    }

    const message = update.message;
    const text = message.text.trim();

    // Check if text is a command (starts with /)
    if (text.startsWith('/')) {
      const parts = text.split(' ');
      const command = parts[0].substring(1).toLowerCase(); // Remove '/' and convert to lowercase
      const args = parts.slice(1).join(' ');

      const handler = this.commandHandlers.get(command);

      if (handler) {
        try {
          const response = await handler(message, args);
          await this.sendMessage(response);
        } catch (error) {
          console.error(`Error handling command ${command}:`, error);
          await this.sendMessage({
            chat_id: message.chat.id,
            text: 'Sorry, there was an error processing your command.'
          });
        }
      } else {
        // Unknown command
        await this.sendMessage({
          chat_id: message.chat.id,
          text: `Sorry, I don't recognize the command "${command}". Try /help for available commands.`
        });
      }
    } else {
      // Process as a location search query
      await this.processLocationQuery(message);
    }
  }

  // Process a location query (non-command)
  private async processLocationQuery(message: TelegramUpdate['message']) {
    if (!message || !message.text) return;
    
    const query = message.text.trim();
    
    try {
      await this.sendMessage({
        chat_id: message.chat.id,
        text: `Searching for locations matching "${query}"...`
      });
      
      // This will be implemented in locationService
      const locationHandler = this.commandHandlers.get('location');
      if (locationHandler) {
        const response = await locationHandler(message, query);
        await this.sendMessage(response);
      }
    } catch (error) {
      console.error('Error processing location query:', error);
      await this.sendMessage({
        chat_id: message.chat.id,
        text: 'Sorry, there was an error searching for that location.'
      });
    }
  }

  // Set up webhook
  async setWebhook(url: string): Promise<TelegramResponse> {
    try {
      const response = await this.callMethod('setWebhook', { url });
      return response;
    } catch (error) {
      console.error('Error setting webhook:', error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete webhook
  async deleteWebhook(): Promise<TelegramResponse> {
    try {
      const response = await this.callMethod('deleteWebhook');
      return response;
    } catch (error) {
      console.error('Error deleting webhook:', error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Set commands
  async setCommands(commands: TelegramCommand[]): Promise<TelegramResponse> {
    try {
      const response = await this.callMethod('setMyCommands', { commands });
      return response;
    } catch (error) {
      console.error('Error setting commands:', error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test the bot token by getting bot information
  async testConnection(): Promise<TelegramResponse> {
    try {
      const response = await this.callMethod('getMe');
      return response;
    } catch (error) {
      console.error('Error testing Telegram bot connection:', error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send a message to a chat
  async sendMessage(message: TelegramMessage): Promise<TelegramResponse> {
    try {
      const response = await this.callMethod('sendMessage', message);
      return response;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get available commands 
  async getMyCommands(): Promise<TelegramResponse> {
    try {
      const response = await this.callMethod('getMyCommands');
      return response;
    } catch (error) {
      console.error('Error getting commands:', error);
      return {
        ok: false,
        description: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generic method to call any Telegram Bot API method
  private async callMethod(method: string, params?: any): Promise<TelegramResponse> {
    const url = `${this.apiBaseUrl}${this.token}/${method}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: params ? JSON.stringify(params) : undefined,
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to call Telegram API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create a Telegram Bot API instance
export const createTelegramBotApi = (token: string): TelegramBotApi => {
  return new TelegramBotApi({ token });
};
