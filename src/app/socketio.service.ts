import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { environment } from "src/environments/environment";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SocketioService {
  private socket;
  private sid;
  private sidListener = new Subject<string>();

  constructor() {}

  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.socket.on("sid", (sid) => {
      this.sid = sid;
      localStorage.setItem("sid", sid);
      this.sidListener.next(sid);
    });
    let sid = localStorage.getItem("sid");
    this.socket.emit("register", sid);
    localStorage.setItem("sid", this.socket.id);
  }

  getSocket() {
    return this.socket;
  }

  getSidListener() {
    return this.sidListener;
  }

  getSessionId() {
    return this.sid;
  }
}
