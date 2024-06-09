/** Values that can be returned by the server */
export type CloudlinkValue = string |
  number |
  boolean |
{ [key: string]: CloudlinkValue; } |
  CloudlinkValue[];

/** Options for the Cloudlink client */
export interface CloudlinkClientOptions {
  /** The URL of the Cloudlink server */
  url: string | URL;
  /** Whether to log debug information */
  log: boolean;
};

/** A user connected to the Cloudlink server */
export interface CloudlinkUser {
  /** Snowflake ID */
  id: string;
  /** Username */
  name?: string;
  /** UUID */
  uuid: string;
}

/** A packet sent to or received from the Cloudlink server */
export interface CloudlinkPacket {
  cmd: string;
  val?: CloudlinkValue;
  mode?: "add" | "remove" | "set";
  name?: string;
  id?: string;
  relay?: string;
  listener?: string;
  rooms?: string[];
  origin?: CloudlinkUser;
  details?: string;
}

/** Events emitted by the Cloudlink client */
export type CloudlinkEvents = {
  "socket_open": void;
  "socket_close": { clean: boolean; code: number; };
  "socket_error": Event;
  [key: `cmd-${string}`]: CloudlinkPacket;
  [key: `listener-${string}`]: CloudlinkPacket;
};
