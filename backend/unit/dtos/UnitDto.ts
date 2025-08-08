// ABOUTME: 단원(Unit) 생성/조회에 사용하는 DTO 정의

export interface CreateUnitRequestDto {
  name: string;
  vidUrl: string;
}

export interface CreateUnitResponseDto {
  id: number;
  name: string;
  vidUrl: string;
  createdAt: Date;
}
