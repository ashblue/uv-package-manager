import { IModelBase } from '../base/i-model-base';
import { IUserData } from './i-user-data';

// @SRC https://gist.github.com/brennanMKE/ee8ea002d305d4539ef6
export interface IModelUser extends IModelBase, IUserData {
  id: string;
}
