import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

/**
 * @fileOverview A central event emitter for surfacing Firestore errors globally.
 */

class ErrorEmitter extends EventEmitter {}

export const errorEmitter = new ErrorEmitter();

export type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

declare interface ErrorEmitter {
  on<U extends keyof ErrorEvents>(event: U, listener: ErrorEvents[U]): this;
  emit<U extends keyof ErrorEvents>(event: U, ...args: Parameters<ErrorEvents[U]>): boolean;
}
