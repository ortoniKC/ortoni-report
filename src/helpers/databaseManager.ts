// databaseManager.ts
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { TestResultData } from '../types/testResults';
import { formatDateUTC, formatDateLocal } from '../utils/utils';

export class DatabaseManager {
  private db: Database | null = null;

  async initialize(dbPath: string): Promise<void> {
    try {
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      await this.createTables();
    } catch (error) {
      console.error('OrtoniReport: Error initializing database:', error);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      console.error('OrtoniReport: Database not initialized');
      return;
    }

    try {
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS test_runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          run_date TEXT
        );

        CREATE TABLE IF NOT EXISTS test_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          run_id INTEGER,
          test_id TEXT,
          status TEXT,
          duration TEXT,
          error_message TEXT,
          FOREIGN KEY (run_id) REFERENCES test_runs (id)
        );
      `);
    } catch (error) {
      console.error('OrtoniReport: Error creating tables:', error);
    }
  }

  async saveTestRun(): Promise<number | null> {
    if (!this.db) {
      console.error('OrtoniReport: Database not initialized');
      return null;
    }

    try {
      const runDate = formatDateUTC(new Date());
      const { lastID } = await this.db.run(`
        INSERT INTO test_runs (run_date)
        VALUES (?)
      `, [runDate]);

      return lastID!;
    } catch (error) {
      console.error('OrtoniReport: Error saving test run:', error);
      return null;
    }
  }

  async saveTestResults(runId: number, results: TestResultData[]): Promise<void> {
    if (!this.db) {
      console.error('OrtoniReport: Database not initialized');
      return;
    }

    try {
      const stmt = await this.db.prepare(`
        INSERT INTO test_results (run_id, test_id, status, duration, error_message)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const result of results) {
        await stmt.run([
          runId,
          `${result.filePath}:${result.projectName}:${result.title}`,
          result.status,
          result.duration,
          result.errors.join('\n')
        ]);
      }
      await stmt.finalize();
    } catch (error) {
      console.error('OrtoniReport: Error saving test results:', error);
    }
  }

  async getTestHistory(testId: string, limit: number = 10): Promise<any[]> {
    if (!this.db) {
      console.error('OrtoniReport: Database not initialized');
      return [];
    }

    try {
      const results = await this.db.all(`
        SELECT tr.status, tr.duration, tr.error_message, trun.run_date
        FROM test_results tr
        JOIN test_runs trun ON tr.run_id = trun.id
        WHERE tr.test_id = ?
        ORDER BY trun.run_date DESC
        LIMIT ?
      `, [testId, limit]);

      return results.map(result => ({
        ...result,
        run_date: formatDateLocal(result.run_date)
      }));
    } catch (error) {
      console.error('OrtoniReport: Error getting test history:', error);
      return [];
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
      } catch (error) {
        console.error('OrtoniReport: Error closing database:', error);
      } finally {
        this.db = null;
      }
    }
  }
}