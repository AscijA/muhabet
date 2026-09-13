import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";
import { ReadableStream, TransformStream, WritableStream } from "node:stream/web";
import { clearImmediate, setImmediate } from "node:timers";

Object.assign(globalThis, {
  TextDecoder,
  TextEncoder,
  ReadableStream,
  TransformStream,
  WritableStream,
  clearImmediate,
  setImmediate,
});
