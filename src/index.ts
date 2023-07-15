import { ws } from "./ws.js";

type anything = string | number | { [key: string]: any } | any[];

export type CloudlinkClientOptions = {
  url: string | URL;
  log: boolean;
};

export type CloudlinkPacket = {
  cmd: string;
  name?: string | number;
  val?: any;
  id?: anything;
  rooms?: anything | anything[];
  listener?: string | number;
  code?: string;
  code_id?: number;
};

export class CloudlinkClient {
  private _websocket: typeof ws.prototype;
  motd?: string;
  ulist?: (string | { [key: string]: any })[];
  server_ver: string;
  options: CloudlinkClientOptions;
  listeners: { event: string; callback: Function }[] = [];
  constructor(options: CloudlinkClientOptions) {
    this.options = options;
    this._setup();
  }
  get status() {
    return this._websocket.readyState;
  }
  send(packet: CloudlinkPacket) {
    this._websocket.send(JSON.stringify(packet));
  }
  emit(event: string, data?: any) {
    if (this.options.log)
      console.log(`[Cloudlink] Emitting "${event}" event:`, data);
    for (let listener of this.listeners) {
      if (!(listener.event === event)) continue;
      listener.callback(data);
    }
  }
  on(event: string, callback: Function) {
    if (this.options.log)
      console.log(`[Cloudlink] Registered "${event}" handler:`, callback);
    this.listeners.push({ event, callback });
  }
  messageHandle(data: CloudlinkPacket) {
    if (data.cmd == "ulist" && data.val.method) {
      if (data.val.method == "set") {
        this.ulist = data.val.val;
      } else if (
        data.val.method == "add" &&
        !this.ulist.includes(data.val.val)
      ) {
        this.ulist.push(data.val.val);
      } else if (
        data.val.method == "remove" &&
        this.ulist.includes(data.val.val)
      ) {
        this.ulist.splice(this.ulist.indexOf(data.val.val), 1);
      }
    } else if (data.cmd == "ulist") {
      this.ulist = data.val;
    } else if (data.cmd == "motd") {
      this.motd = data.val;
    } else if (data.cmd == "server_version") {
      this.server_ver = data.val;
    }
    this.emit(data.cmd, data);
    this.emit("packet", data);
  }
  connect(options?: CloudlinkClientOptions) {
    this.options = options || this.options;
    this._setup();
  }
  disconnect() {
    this._websocket.close();
    delete this.motd;
    delete this.ulist;
    delete this.server_ver;
  }
  private _setup() {
    this._websocket = new ws(this.options.url);
    this._websocket.addEventListener("open", () => {
      while (this._websocket.readyState !== 1) {}
      this.emit("open");
      this.send({ cmd: "handshake" });
    });
    this._websocket.addEventListener("close", (closeEvent) => {
      this.emit("close", {
        clean: closeEvent.wasClean,
        code: closeEvent.code,
      });
    });
    this._websocket.addEventListener("error", (errorEvent) => {
      this.emit("wserror", errorEvent);
    });
    this._websocket.addEventListener("message", (message) =>
      this.messageHandle(JSON.parse(message.data))
    );
  }
}

export default CloudlinkClient;
