import * as winston from 'winston';
import * as path from 'path';
import * as vscode from 'vscode';

export class LoggerService {
    private logger: winston.Logger;
    private static instance: LoggerService;

    private constructor(logPath: string) {
        // Create logs directory if it doesn't exist
        const logDir = path.dirname(logPath);

        // Configure winston logger
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            defaultMeta: { service: 'taskboard' },
            transports: [
                // Write all logs to the specified file
                new winston.transports.File({
                    filename: logPath,
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(({ timestamp, level, message, ...meta }) => {
                            return `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                        })
                    )
                }),
                // Write errors to a separate file
                new winston.transports.File({
                    filename: path.join(logDir, 'error.log'),
                    level: 'error'
                }),
                // Console output for development
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }

    public static initialize(context: vscode.ExtensionContext): LoggerService {
        if (!LoggerService.instance) {
            // Get user's preferred log location from settings
            const config = vscode.workspace.getConfiguration('taskboard');
            let logPath = config.get<string>('logPath');

            if (!logPath) {
                // Default to logs directory in extension storage
                logPath = path.join(context.globalStoragePath, 'logs', `taskboard-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
            }

            LoggerService.instance = new LoggerService(logPath);
        }
        return LoggerService.instance;
    }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            throw new Error('LoggerService must be initialized first');
        }
        return LoggerService.instance;
    }

    public info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    public error(message: string, error?: any): void {
        this.logger.error(message, error);
    }

    public warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    public debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }

    public getLogPath(): string {
        const fileTransport = this.logger.transports.find(
            (t): t is winston.transports.FileTransportInstance => t instanceof winston.transports.File
        );
        return fileTransport ? fileTransport.filename : '';
    }
} 