import { User } from './user.class';

export interface DialogConfig {
  type: 'add' | 'edit' | 'account';
  title: string;
  subtitle: string;
  contact?: User;
  isCurrentUser?: boolean;
}
