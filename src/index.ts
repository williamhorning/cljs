import type {
  CloudlinkClientOptions,
  CloudlinkEvents,
  CloudlinkPacket,
  CloudlinkUser,
} from "./types.ts";

/** A client for Cloudlink servers */
class CloudlinkClient {
  /** Socket used to connect to the Cloudlink server */
  private readonly socket: typeof WebSocket.prototype;
  /** Event listeners */
  private readonly listeners: {
    [key in keyof CloudlinkEvents]?: ((data: CloudlinkEvents[key]) => void)[];
  } = {};
  /** The options used to connect to cloudlink */
  readonly options: CloudlinkClientOptions;
  /** The client IP returned by the server */
  client_ip = "";
  /** The user object given by the server */
  client_obj = {} as Partial<CloudlinkUser>;
  /** The MOTD provided by the server */
  motd = "";
  /** The version of the server */
  server_ver = "";
  /** The users currently connected to the server */
  ulist = [] as Partial<CloudlinkUser>[];
  /** Whether the socket is alive */
  alive = true;

  /**
   * Connect to a Cloudlink server
   * @param opts The options to connect to the server
   */
  static async connect(
    opts: CloudlinkClientOptions | string,
  ): Promise<CloudlinkClient> {
    const options = typeof opts === "string" ? { url: opts, log: false } : opts;
    const socket =
      new (globalThis.WebSocket ? WebSocket : ((await import("ws")).default))(
        options.url,
      );
    await new Promise((resolve) => socket.onopen = resolve);
    return new CloudlinkClient(socket, options);
  }

  /**
   * Send a packet to the server
   * @param packet The packet to send to the server
   */
  send(packet: CloudlinkPacket) {
    if (!this.alive) {
      throw new Error("socket is not connected");
    }
    this.socket.send(JSON.stringify(packet));
  }

  /**
   * Listen for an event
   * @param event The event to listen for
   * @param listener The listener for the event
   */
  on<T extends keyof CloudlinkEvents>(
    event: T,
    listener: (data: CloudlinkEvents[T]) => void,
  ) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]?.push(listener);
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    this.socket.close();
    this.alive = false;
  }

  /**
   * Setup event listeners
   * @private
   */
  private constructor(
    socket: typeof WebSocket.prototype,
    options: CloudlinkClientOptions,
  ) {
    this.options = options;
    this.socket = socket;

    this.log("connected to cloudlink server", this.socket.url);

    this.send({
      cmd: "handshake",
      val: { language: "typescript", version: "4.1.2" },
    });

    this.log("sent handshake packet");

    this.emit("socket_open", undefined);

    this.socket.addEventListener("close", (closeEvent) => {
      this.log("socket closed", closeEvent);
      this.alive = false;
      this.emit("socket_close", {
        clean: closeEvent.wasClean,
        code: closeEvent.code,
      });
    });

    this.socket.addEventListener("error", (errorEvent) => {
      this.alive = false;
      this.log("socket error", errorEvent);
      this.emit("socket_error", errorEvent);
    });

    this.socket.addEventListener(
      "message",
      (message) => this.handle_message(JSON.parse(message.data)),
    );
  }

  /**
   * Log various stuff
   * @private
   */
  private log(...args: unknown[]) {
    if (this.options.log) {
      console.debug("[Cloudlink]", ...args);
    }
  }

  /**
   * Emit an event
   * @private
   */
  private emit<T extends keyof CloudlinkEvents, V extends CloudlinkEvents[T]>(
    event: T,
    data: V,
  ) {
    this.listeners[event]?.forEach((listener) => listener(data));
  }

  /**
   * Handle a message from the server
   * @private
   */
  private handle_message(data: CloudlinkPacket) {
    this.log("received packet", data);

    this.emit(`cmd-${data.cmd}`, data);

    if (data.listener) this.emit(`listener-${data.listener}`, data);

    if (data.cmd === "motd") {
      this.motd = data.val as string;
    } else if (data.cmd === "server_version") {
      this.server_ver = data.val as string;
    } else if (data.cmd === "client_ip") {
      this.client_ip = data.val as string;
    } else if (data.cmd === "client_obj") {
      this.client_obj = data.val as unknown as CloudlinkUser;
    } else if (data.cmd === "ulist") {
      if (data.mode! === "add") {
        this.ulist.push(data.val as unknown as CloudlinkUser);
      } else if (data.mode! === "remove") {
        this.ulist = this.ulist.filter((u) => u.id !== data.val);
      } else {
        this.ulist = data.val as unknown as CloudlinkUser[];
      }
    }
  }
}

export { CloudlinkClient, CloudlinkClient as default };
