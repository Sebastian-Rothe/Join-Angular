import { User } from './user.class';

/**
 * Configuration interface for dialog components.
 * 
 * @description
 * This interface defines the structure for configuring dialog windows
 * in the application, particularly for user-related operations like
 * adding contacts, editing user information, and account management.
 * 
 * @interface DialogConfig
 * @property {('add' | 'edit' | 'account')} type - The type of dialog to display
 * @property {string} title - The main title of the dialog
 * @property {string} subtitle - The subtitle or additional context
 * @property {User} [contact] - Optional user data for contact-related dialogs
 * @property {boolean} [isCurrentUser] - Optional flag indicating if the dialog relates to the current user
 * 
 * @example
 * ```typescript
 * const config: DialogConfig = {
 *   type: 'edit',
 *   title: 'Edit Contact',
 *   subtitle: 'Change contact information',
 *   contact: userObject
 * };
 * ```
 */
export interface DialogConfig {
  type: 'add' | 'edit' | 'account';
  title: string;
  subtitle: string;
  contact?: User;
  isCurrentUser?: boolean;
}
