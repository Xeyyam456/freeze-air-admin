import type { Piece } from "./Piece";
import type { Tool } from "./Tool";
import type { DepotEmployee } from "./DepotEmployee";

export type PieceRowProps = { piece: Piece; tool: Tool; employees: DepotEmployee[]; canManage: boolean; writeoffPending: boolean };
