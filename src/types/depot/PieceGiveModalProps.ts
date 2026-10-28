import type { Piece } from "./Piece";
import type { Tool } from "./Tool";
import type { DepotEmployee } from "./DepotEmployee";

export type PieceGiveModalProps = { piece: Piece; tool: Tool; employees: DepotEmployee[]; onClose: () => void };
