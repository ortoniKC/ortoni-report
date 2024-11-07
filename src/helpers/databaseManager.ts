// databaseManager.ts
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { TestResultData } from '../types/testResults';
import { formatDateUTC, formatDateLocal } from '../utils/utils';

export class DatabaseManager {
  private db: Database | null = null;

  async initialize(dbPath: string): Promise<void> {
    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

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
  }

  async saveTestRun(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const runDate = formatDateUTC(new Date());
    const { lastID } = await this.db.run(`
      INSERT INTO test_runs (run_date)
      VALUES (?)
    `, [runDate]);

    return lastID!;
  }

  async saveTestResults(runId: number, results: TestResultData[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

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
  }

  async getTestHistory(testId: string, limit: number = 10): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

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
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}