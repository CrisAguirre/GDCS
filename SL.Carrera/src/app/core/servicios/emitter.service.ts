import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmitterService {

  public emitterSubscribeCV = new EventEmitter<any>();

  constructor() {
    //his.emitterProgressBar = new EventEmitter<any>();
  }

  /**
   * blockedTabs
   * progressBar
   * @param message 
   */
  public emitterCv(message: any): void {
    this.emitterSubscribeCV.emit(message);
    //this.emitterSubscribeCV.next(message);
    // this.emitterSubscribeCV = new EventEmitter<any>();
  }

  public unsubscribeEmitterCV(): void {
    this.emitterSubscribeCV = new EventEmitter<any>();
  }

}
