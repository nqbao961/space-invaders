import { InputComponent } from './input-component.js';

export class BotFighterInputComponent extends InputComponent {
  constructor() {
    super();
    this._shoot = true;
    this._down = true;
  }
}