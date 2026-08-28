/**
 * Client for interacting with Google Sheets API.
 * Provides methods for reading and writing spreadsheet data.
 */

import type {OAuth2Client} from 'google-auth-library';
import {google, sheets_v4} from 'googleapis';
import {authorize} from './auth';

export class SheetsClient {
  private auth: OAuth2Client | null = null;
  private sheets: sheets_v4.Sheets | null = null;

  /**
   * Authenticate with Google Sheets API.
   */
  async authenticate(): Promise<void> {
    if (this.auth) {
      return; // Already authenticated
    }

    this.auth = await authorize();
    this.sheets = google.sheets({version: 'v4', auth: this.auth});
  }

  /**
   * Ensure the client is authenticated before making requests.
   */
  private async ensureAuth(): Promise<void> {
    if (!this.auth || !this.sheets) {
      await this.authenticate();
    }
  }

  /**
   * Get values from a spreadsheet range.
   */
  async getValues(spreadsheetId: string, range: string): Promise<unknown[][]> {
    await this.ensureAuth();

    if (!this.sheets) {
      throw new Error('Sheets client not initialized');
    }

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || [];
  }

  /**
   * Update values in a spreadsheet range.
   */
  async updateValues(
    spreadsheetId: string,
    range: string,
    values: unknown[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<sheets_v4.Schema$UpdateValuesResponse> {
    await this.ensureAuth();

    if (!this.sheets) {
      throw new Error('Sheets client not initialized');
    }

    const response = await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: {
        values,
      },
    });

    return response.data;
  }

  /**
   * Append values to a spreadsheet.
   */
  async appendValues(
    spreadsheetId: string,
    range: string,
    values: unknown[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<sheets_v4.Schema$AppendValuesResponse> {
    await this.ensureAuth();

    if (!this.sheets) {
      throw new Error('Sheets client not initialized');
    }

    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: {
        values,
      },
    });

    return response.data;
  }

  /**
   * Get multiple ranges at once (batch operation).
   */
  async batchGet(
    spreadsheetId: string,
    ranges: string[]
  ): Promise<Record<string, unknown[][]>> {
    await this.ensureAuth();

    if (!this.sheets) {
      throw new Error('Sheets client not initialized');
    }

    const response = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const result: Record<string, unknown[][]> = {};
    response.data.valueRanges?.forEach((valueRange, index) => {
      result[ranges[index]] = valueRange.values || [];
    });

    return result;
  }

  /**
   * Update multiple ranges at once (batch operation).
   */
  async batchUpdate(
    spreadsheetId: string,
    data: Array<{range: string; values: unknown[][]}>,
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<sheets_v4.Schema$BatchUpdateValuesResponse> {
    await this.ensureAuth();

    if (!this.sheets) {
      throw new Error('Sheets client not initialized');
    }

    const response = await this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption,
        data: data.map((item) => ({
          range: item.range,
          values: item.values,
        })),
      },
    });

    return response.data;
  }

  /**
   * Clear values in a range.
   */
  async clearValues(
    spreadsheetId: string,
    range: string
  ): Promise<sheets_v4.Schema$ClearValuesResponse> {
    await this.ensureAuth();

    if (!this.sheets) {
      throw new Error('Sheets client not initialized');
    }

    const response = await this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });

    return response.data;
  }

  /**
   * Get spreadsheet metadata.
   */
  async getSpreadsheet(
    spreadsheetId: string
  ): Promise<sheets_v4.Schema$Spreadsheet> {
    await this.ensureAuth();

    if (!this.sheets) {
      throw new Error('Sheets client not initialized');
    }

    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
    });

    return response.data;
  }

  /**
   * Get all sheet names in a spreadsheet.
   */
  async getSheetNames(spreadsheetId: string): Promise<string[]> {
    const spreadsheet = await this.getSpreadsheet(spreadsheetId);
    return (
      spreadsheet.sheets?.map((sheet) => sheet.properties?.title || '') || []
    );
  }

  /**
   * Create a new spreadsheet.
   */
  async createSpreadsheet(
    title: string,
    sheets: Array<{title: string}> = [{title: 'Sheet1'}]
  ): Promise<sheets_v4.Schema$Spreadsheet> {
    await this.ensureAuth();

    if (!this.sheets) {
      throw new Error('Sheets client not initialized');
    }

    const response = await this.sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
        sheets: sheets.map((sheet) => ({
          properties: {
            title: sheet.title,
          },
        })),
      },
    });

    return response.data;
  }

  /**
   * Perform advanced batch update operations (formatting, adding sheets, etc.).
   */
  async batchUpdateSpreadsheet(
    spreadsheetId: string,
    requests: sheets_v4.Schema$Request[]
  ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
    await this.ensureAuth();

    if (!this.sheets) {
      throw new Error('Sheets client not initialized');
    }

    const response = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests,
      },
    });

    return response.data;
  }

  /**
   * Add a new sheet to an existing spreadsheet.
   */
  async addSheet(
    spreadsheetId: string,
    title: string
  ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
    const requests: sheets_v4.Schema$Request[] = [
      {
        addSheet: {
          properties: {
            title,
          },
        },
      },
    ];

    return this.batchUpdateSpreadsheet(spreadsheetId, requests);
  }

  /**
   * Delete a sheet from a spreadsheet.
   */
  async deleteSheet(
    spreadsheetId: string,
    sheetId: number
  ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
    const requests: sheets_v4.Schema$Request[] = [
      {
        deleteSheet: {
          sheetId,
        },
      },
    ];

    return this.batchUpdateSpreadsheet(spreadsheetId, requests);
  }
}
