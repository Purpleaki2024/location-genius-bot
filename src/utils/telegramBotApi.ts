
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

// Default Telegram API base URL
const DEFAULT_API_BASE = 'https://api.telegram.org/bot';

// Class to manage Telegram Bot API interactions
export class TelegramBotApi {
  private token: string;
  private apiBaseUrl: string;

  constructor(config: TelegramBotConfig) {
    this.token = config.token;
    this.apiBaseUrl = config.apiBaseUrl || DEFAULT_API_BASE;
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
