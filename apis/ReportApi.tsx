import axiosInstance from "../app/utils/axiosInstance";


export interface CreateReportDto {
  moduleId: string;
  reason: string;
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
  // Only send moduleId and reason, backend sets reportedBy
  const response = await axiosInstance.post<GetReportDto>("/api/reports", {
    moduleId: dto.moduleId,
    reason: dto.reason,
  });
  return response.data;
}
