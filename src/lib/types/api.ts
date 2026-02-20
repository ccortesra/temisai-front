export interface ConstitutionChunk {
    id: string;
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
    constitution_chunks: ConstitutionChunk[] | null;
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
    doc_id?: string | null;
}

export interface ThreadChatResponse {
    thread_id: string;
    user_message: MessageResponse;
    assistant_message: MessageResponse;
    agent_response: AgentDocumentReport;
}

export interface ThreadCreate {
    title?: string | null;
}

export interface ThreadResponse {
    id: string;
    user_id: string;
    title?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface ThreadUpdate {
    title: string;
}

export interface ChatRequest {
    query: string;
    doc_id?: string | null;
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
