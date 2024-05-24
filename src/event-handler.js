"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const db_1 = require("./db");
const handler = async (event) => {
    await (0, db_1.persistEvents)("1234", [
        {
            name: event.name,
            payload: event.payload,
        },
    ]);
};
exports.handler = handler;
