import { User } from './user.class';

export interface DialogConfig {
  type: 'account' | 'edit' | 'add';
  title: string;
  subtitle: string;
  contact?: User;
}
