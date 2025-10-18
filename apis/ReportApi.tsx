import axiosInstance from "../app/utils/axiosInstance";

export interface CreateReportDto {
  moduleId: string;
  reason: string;
  reportedBy?: string; // Will be set by backend from token/session
}

export interface GetReportDto {
  id: string;
  moduleId: string;
  reason: string;
  reportedBy: string;
  reportDate: string;
  status: string;
}

export async function createReport(dto: CreateReportDto): Promise<GetReportDto> {
  const response = await axiosInstance.post<GetReportDto>("/api/reports", dto);
  return response.data;
}
