export interface ApiResponse<T> {
  isSuccess?: boolean;
  success?: boolean;
  data: T;
  errors: string[] | null;
}

export function isOk<T>(r: ApiResponse<T>): boolean {
  return r.isSuccess === true || r.success === true;
}
