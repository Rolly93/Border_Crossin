export type SftpSendStatus = "pending" | "sent" | "failed";

export interface ISftpSend {
  id: number;
  filename: string;
  status: SftpSendStatus;
  retries: number;
  sftp_log: string | null;
  sent_to: number;
  client_id: number;
  reference: string;
  shipment_event_id: number;
}

export interface SftpSendFilters {
  client_id?: number;
  reference?: string;
  status?: string;
}
