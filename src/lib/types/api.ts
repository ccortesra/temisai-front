export interface CodeChunk {
    id: string;
    code_name: string;
    articulo: string;
    breadcrumb: string;
    capitulo: string;
    content: string;
}

export interface DocumentChunk {
    id: string;
    content: string;
    page: number;
    bbox_left: number;
    bbox_top: number;
    bbox_right: number;
    bbox_bottom: number;
    document_id: string;
}

export interface AgentDocumentReport {
    retrieved_chunks: DocumentChunk[];
    most_relevant_chunks: DocumentChunk[];
    answer: string;
    law_chunks: CodeChunk[] | null;
}

export interface DocumentAPIReturn {
    id: string;
    filename: string;
    user_owner: string;
    created_at: string;
    chunks_storage_path?: string | null;
}

export interface MessageResponse {
    id: string;
    thread_id: string;
    role: string;
    content: string;
    created_at?: string | null;
}

export interface ThreadChatRequest {
    query: string;
}

export interface ThreadChatResponse {
    thread_id: string;
    user_message: MessageResponse;
    assistant_message: MessageResponse;
    agent_response: AgentDocumentReport;
}

export interface ThreadCreate {
    title?: string | null;
    doc_id?: string | null;
}

export interface ThreadResponse {
    id: string;
    user_id: string;
    doc_id?: string | null;
    title?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface ThreadUpdate {
    title: string;
}


export interface CodeDocumentResponse {
    doc_id: string;
    name: string;
}

export type TipoPeticion =
    | "informacion"
    | "consulta"
    | "queja"
    | "reclamo"
    | "sugerencia";

export type MedioRespuesta = "correo_electronico" | "fisico";

export interface SolicitanteInput {
    nombre_completo: string;
    tipo_documento: string;
    numero_documento: string;
    direccion_notificacion: string;
    correo_electronico: string;
    telefono?: string | null;
}

export interface DestinatarioInput {
    entidad: string;
    nombre_funcionario?: string | null;
    cargo_funcionario?: string | null;
    direccion?: string | null;
    correo?: string | null;
}

export interface AnexoInput {
    nombre: string;
    descripcion?: string | null;
}

export interface DerechoPeticionInput {
    tipo_peticion: TipoPeticion;
    solicitante: SolicitanteInput;
    destinatario: DestinatarioInput;
    ciudad: string;
    fecha: string;
    asunto: string;
    hechos: string[];
    peticiones: string[];
    anexos: AnexoInput[];
    medio_respuesta: MedioRespuesta;
}

export interface GeneratedDocContent {
    nombre_completo?: string | null;
    numero_documento?: string | null;
    correo?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    telefono?: string | null;
    peticiones: string[];
    finalidad?: string | null;
    anexos: AnexoInput[];
    hechos: string[];
}

export interface GeneratedDocResponse {
    gen_doc_id: string;
    document_type: string;
    created_at: string;
    content: GeneratedDocContent;
    text: string;
}

export interface SetPasswordRequest {
    access_token: string;
    refresh_token: string;
    password: string;
}

export interface SetPasswordResponse {
    message: string;
    access_token: string;
    token_type: string;
}

export interface HTTPValidationError {
    detail: ValidationError[];
}

export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
    input?: any;
    ctx?: Record<string, any>;
}
