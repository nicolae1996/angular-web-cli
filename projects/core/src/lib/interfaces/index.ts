import { Observable, Subscription } from 'rxjs';
import {
    CliBackgroundColor,
    CliForegroundColor,
    CliLogLevel,
    CliProcessCommand,
    CliProvider,
    CliState,
    ICliUser,
    ICliUserSession,
} from '../models';
import { ICliExecutionContext } from './execution-context';
import {
    ICliCommandChildProcessor,
    ICliCommandProcessor,
} from './command-processor';

export interface ICliTerminalWriter {
    /**
     * Write text to the terminal
     * @param text The text to write
     */
    write(text: string): void;

    /**
     * Write text to the terminal followed by a newline
     * @param text The text to write
     */
    writeln(text?: string): void;

    /**
     * Write a success message to the terminal
     * @param messag The message to write
     * @returns void
     */
    writeSuccess: (message: string) => void;

    /**
     * Write an info message to the terminal
     * @param messag The message to write
     * @returns void
     */
    writeInfo: (message: string) => void;

    /**
     * Write an error message to the terminal
     * @param message The message to write
     * @returns void
     */
    writeError: (message: string) => void;

    /**
     * Write a warning message to the terminal
     * @param message The message to write
     * @returns void
     */
    writeWarning: (message: string) => void;

    /**
     * Write a message to the terminal with the specified color
     * @param message The message to write
     * @param color The color to use
     * @returns void
     */
    wrapInColor: (text: string, color: CliForegroundColor) => string;

    /**
     * Write a message to the terminal with the specified background color
     * @param message The message to write
     * @param color The background color to use
     * @returns void
     */
    wrapInBackgroundColor: (text: string, color: CliBackgroundColor) => string;

    /**
     * Write a JSON object to the terminal
     * @param json The JSON object to write
     * @returns void
     */
    writeJson: (json: any) => void;

    /**
     * Write content to a file
     * @param fileName The name of the file to write to
     * @param content The content to write to the file
     * @returns void
     */
    writeToFile: (fileName: string, content: string) => void;

    /**
     * Write an object array as a table to the terminal
     * @param objects The objects to write to the table
     * @returns void
     */
    writeObjectsAsTable(objects: any[]): void;

    /**
     * Write a table to the terminal
     * @param headers The headers of the table
     * @param rows The rows of the table
     * @returns void
     */
    writeTable(headers: string[], rows: string[][]): void;

    /**
     * Write a divider to the terminal
     * @param options The options for the divider
     * @returns void
     */
    writeDivider(options?: {
        color?: CliForegroundColor;
        length?: number;
        char?: string;
    }): void;
}

/**
 * Represents a clipboard for the CLI
 */
export interface ICliClipboard {
    /**
     * Write text to the clipboard
     * @param text The text to write to the clipboard
     * @returns void
     */
    write: (text: string) => Promise<void>;

    /**
     * Read text from the clipboard
     * @returns The text read from the clipboard
     */
    read: () => Promise<string>;
}

/**
 * Represents a service that executes commands
 */
export interface ICliCommandExecutorService {
    /**
     *
     * @param command
     * @param context
     */
    showHelp(
        command: CliProcessCommand,
        context: ICliExecutionContext,
    ): Promise<void>;

    /**
     * Execute a command
     * @param command The command to execute
     * @param context The context in which the command is executed
     */
    executeCommand(
        command: string,
        context: ICliExecutionContext,
    ): Promise<void>;
}

/**
 * Represents a registry for command processors
 */
export interface ICliCommandProcessorRegistry {
    /**
     * The processors registered with the registry
     */
    readonly processors: ICliCommandProcessor[];

    /**
     * Find a processor for a command
     * @param mainCommand
     * @param chainCommands
     */
    findProcessor(
        mainCommand: string,
        chainCommands: string[],
    ): ICliCommandProcessor | undefined;

    /**
     * Recursively searches for a processor matching the given command.
     * @param mainCommand The main command name.
     * @param chainCommands The remaining chain commands (if any).
     * @param processors The list of available processors.
     * @returns The matching processor or undefined if not found.
     */
    findProcessorInCollection(
        mainCommand: string,
        chainCommands: string[],
        processors: ICliCommandProcessor[],
    ): ICliCommandProcessor | undefined;

    /**
     * Get the root processor for a child processor
     * @param child The child processor
     */
    getRootProcessor(child: ICliCommandChildProcessor): ICliCommandProcessor;

    /**
     * Register a processor
     * @param processor
     */
    registerProcessor(processor: ICliCommandProcessor): void;

    /**
     * Unregister a processor
     * @param processor
     */
    unregisterProcessor(processor: ICliCommandProcessor): void;
}

export interface ICliExecutionProcess {
    /**
     * Indicates if the process has exited
     */
    exited?: boolean;

    /**
     * The exit code of the process
     */
    exitCode?: number;

    /**
     * Indicates if the process is running
     */
    running: boolean;

    /**
     * The data of the process
     */
    data: any | undefined;

    /**
     * Exit the process
     * @param code The exit code
     * @returns void
     */
    exit: (
        /**
         * The exit code
         */
        code?: number,

        /**
         * Options for exiting the process
         */
        options?: {
            /**
             * Indicates if the exit should be silent, i.e. not throw an error
             */
            silent?: boolean;
        },
    ) => void;

    /**
     * Output data from the process
     * @param data The data to output
     */
    output(data: any): void;
}

/**
 * Represents a key-value store for the CLI
 */
export interface ICliKeyValueStore {
    /**
     * Retrieves a value by key.
     * @param key - The key to retrieve the value for.
     * @returns A promise resolving to the value or undefined if not found.
     */
    get<T = any>(key: string): Promise<T | undefined>;

    /**
     * Sets a key-value pair in the store.
     * @param key - The key to set.
     * @param value - The value to store.
     * @returns A promise resolving when the value is stored.
     */
    set(key: string, value: any): Promise<void>;

    /**
     * Removes a key-value pair by key.
     * @param key - The key to remove.
     * @returns A promise resolving when the key is removed.
     */
    remove(key: string): Promise<void>;

    /**
     * Clears all key-value pairs from the store.
     * @returns A promise resolving when the store is cleared.
     */
    clear(): Promise<void>;
}

/**
 * Represents a store for storing data associated with commands
 */
export interface ICliStateStore {
    /**
     * Get the current state as an object.
     */
    getState(): CliState;

    /**
     * Update the state with new values. Supports partial updates.
     * @param newState Partial state to merge with the current state.
     */
    updateState(newState: Partial<CliState>): void;

    /**
     * Select a specific property or computed value from the state.
     * @param selector A function to project a slice of the state.
     * @returns Observable of the selected value.
     */
    select<K>(selector: (state: CliState) => K): Observable<K>;

    /**
     * Subscribe to state changes.
     * @param callback Callback function to handle state changes.
     * @returns Subscription object to manage the subscription.
     */
    subscribe(callback: (state: CliState) => void): Subscription;

    /**
     * Reset the state to its initial value.
     */
    reset(): void;

    /**
     * Persist the state to storage.
     */
    persist(): Promise<void>;

    /**
     * Initialize the state from storage.
     */
    initialize(): Promise<void>;
}

/**
 * Represents a service that manages user sessions in the CLI
 */
export interface ICliUserSessionService {
    /**
     * Gets the current user session
     * @returns An observable that emits the current user session
     */
    getUserSession(): Observable<ICliUserSession | undefined>;

    /**
     * Sets the current user session
     * @param session The session to set
     */
    setUserSession(session: ICliUserSession): Promise<void>;
}

/**
 * Represents a service that manages users in the CLI
 */
export interface ICliUsersStoreService {
    /**
     * Gets the current users
     * @returns An observable that emits the current users
     */
    getUsers(options?: {
        query?: string;
        skip?: number;
        take?: number;
    }): Observable<ICliUser[]>;

    /**
     * Creates a user
     * @param user The user to create
     */
    createUser(user: Omit<ICliUser, 'id'>): Promise<ICliUser>;

    /**
     * Gets a user by id
     * @param id The id of the user to get
     * @returns An observable that emits the user with the specified id
     */
    getUser(id: string): Observable<ICliUser | undefined>;
}

/**
 * Represents a service that pings the server
 */
export interface ICliPingServerService {
    /**
     * Pings the server
     */
    ping(): Promise<void>;
}

/**
 * Represents a module for the CLI
 */
export interface ICliUmdModule {
    /**
     * The name of the module
     */
    name: string;

    /**
     * The processors for the module
     */
    processors: ICliCommandProcessor[];
}

/**
 * Represents a logger for the CLI
 */
export interface ICliLogger {
    /**
     * Set the log level of the logger
     * @param level The log level to set
     * @returns void
     * @default CliLogLevel.ERROR
     */
    setCliLogLevel(level: CliLogLevel): void;

    /**
     * Log a message
     * @param args The arguments to log
     */
    log(...args: any[]): void;

    /**
     * Log a message
     * @param args The arguments to log
     */
    info(...args: any[]): void;

    /**
     * Log a message
     * @param args The arguments to log
     */
    warn(...args: any[]): void;

    /**
     * Log a message
     * @param args The arguments to log
     */
    error(...args: any[]): void;

    /**
     * Log a message
     * @param args The arguments to log
     */
    debug(...args: any[]): void;
}

/**
 * Represents a service provider for the CLI
 */
export interface ICliServiceProvider {
    /**
     * Get a service
     * @param service The service to get
     */
    get<T>(service: any): T;

    /**
     * Set a service
     * @param definition The definition of the service
     */
    set(definition: CliProvider | CliProvider[]): void;
}

export * from './execution-context';

export * from './command-processor';

export * from './progress-bars';

export * from './command-hooks';
