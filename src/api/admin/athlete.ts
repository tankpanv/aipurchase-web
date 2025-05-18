import { fetchApi } from '../fetch'

// 运动员基本信息接口
export interface Athlete {
  id: number
  name?: string
  real_name?: string
  gender?: 0 | 1 | 2 // 0: 未知, 1: 男, 2: 女
  birthDate?: string
  birthday?: string
  idNumber?: string
  id_card?: string
  phone?: string
  email?: string
  avatar?: string
  avatar_url?: string
  status?: 0 | 1 // 0: 禁用, 1: 正常
  athlete_status?: number | boolean // 0: 未认证, 1: 待审核, 2: 已认证
  createTime?: string
  create_time?: string
  updateTime?: string
  update_time?: string
  nickname?: string
  height?: number
  weight?: number
  is_volunteer?: boolean
  volunteer_status?: number
  is_athlete?: boolean
  city?: string
  province?: string
  country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  has_chronic_disease?: boolean
  disease_desc?: string
  openid?: string
  last_login?: string
}
export interface AthleteResponse {
  code: number
  message: string
  data: Athlete
}
// 运动员健康数据接口
export interface AthleteHealth {
  id: number
  athleteId: number
  height: number
  weight: number
  bloodPressure: string
  heartRate: number
  bloodOxygen: number
  temperature: number
  testTime: string
  status: number
  remark: string
  createTime: string
  updateTime: string
}

// 分页查询参数接口
export interface PageParam {
  page: number
  size: number
  keyword?: string
  status?: number | null
  [key: string]: string | number | null | undefined
}

// 分页响应接口
export interface PageResponse<T> {
  code: number
  message: string
  data: {
    pageNum: number
    pageSize: number
    totalPage: number
    total: number
    list: T[]
  }
}
/**
 * 获取运动员列表
 * @param params 分页参数
 */
export function getAthleteList(params: PageParam) {
  return fetchApi<PageResponse<Athlete>>('/api/admin/athlete/list', {
    method: 'GET',
    params,
  })
}

/**
 * 获取运动员详情
 * @param id 运动员ID
 */
export function getAthleteDetail(id: number) {
  return fetchApi<AthleteResponse>(`/api/admin/athlete/${id}`, {
    method: 'GET',
  })
}

/**
 * 添加运动员
 * @param data 运动员信息
 */
export function addAthlete(data: Omit<Athlete, 'id' | 'createTime' | 'updateTime'>) {
  return fetchApi<AthleteResponse>('/api/admin/athlete', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 更新运动员信息
 * @param id 运动员ID
 * @param data 运动员信息
 */
export function updateAthlete(id: number, data: Partial<Athlete>) {
  return fetchApi<AthleteResponse>(`/api/admin/athlete/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 删除运动员
 * @param id 运动员ID
 */
export function deleteAthlete(id: number) {
  return fetchApi<AthleteResponse>(`/api/admin/athlete/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 获取运动员健康数据列表
 * @param athleteId 运动员ID
 * @param params 分页参数
 */
export function getAthleteHealthList(athleteId: number, params: PageParam) {
  return fetchApi<PageResponse<AthleteHealth>>(`/api/admin/athlete/${athleteId}/health/list`, {
    method: 'GET',
    params,
  })
}

/**
 * 获取运动员健康数据详情
 * @param athleteId 运动员ID
 * @param id 健康数据ID
 */
export function getAthleteHealthDetail(athleteId: number, id: number) {
  return fetchApi<AthleteHealth>(`/api/admin/athlete/${athleteId}/health/${id}`, {
    method: 'GET',
  })
}

/**
 * 添加运动员健康数据
 * @param athleteId 运动员ID
 * @param data 健康数据
 */
export function addAthleteHealth(athleteId: number, data: Omit<AthleteHealth, 'id' | 'athleteId' | 'createTime' | 'updateTime'>) {
  return fetchApi<AthleteHealth>(`/api/admin/athlete/${athleteId}/health`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 更新运动员健康数据
 * @param athleteId 运动员ID
 * @param id 健康数据ID
 * @param data 健康数据
 */
export function updateAthleteHealth(athleteId: number, id: number, data: Partial<AthleteHealth>) {
  return fetchApi<AthleteHealth>(`/api/admin/athlete/${athleteId}/health/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 删除运动员健康数据
 * @param athleteId 运动员ID
 * @param id 健康数据ID
 */
export function deleteAthleteHealth(athleteId: number, id: number) {
  return fetchApi(`/api/admin/athlete/${athleteId}/health/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 审核运动员健康数据
 * @param athleteId 运动员ID
 * @param id 健康数据ID
 * @param status 审核状态 1:通过 2:拒绝
 * @param remark 审核备注
 */
export function reviewAthleteHealth(athleteId: number, id: number, status: number, remark?: string) {
  return fetchApi(`/api/admin/athlete/${athleteId}/health/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ status, remark }),
  })
}

// 运动员成绩接口
export interface AthleteResult {
  id: number
  athleteId: number
  eventId: number
  eventName: string
  startTime: string
  finishTime: string
  totalTime: string
  rank: number
  result: string
  status: 0 | 1 | 2
  checkpoints: string[]
  remark: string
  createTime: string
  updateTime: string
}

// 赛事接口
export interface Event {
  id: number
  name: string
  startDate: string
  endDate: string
  location: string
  status: number
}

/**
 * 创建运动员成绩
 * @param data 成绩信息
 */
export function createAthleteResult(data: Omit<AthleteResult, 'id' | 'createTime' | 'updateTime'>) {
  return fetchApi<AthleteResult>('/api/admin/athlete/result', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 获取运动员成绩列表
 * @param athleteId 运动员ID
 * @param params 分页参数
 */
export function getAthleteResults(athleteId: number, params: PageParam) {
  return fetchApi<PageResponse<AthleteResult>>(`/api/admin/athlete/${athleteId}/results`, {
    method: 'GET',
    params,
  })
}

/**
 * 获取赛事列表
 */
export function getEventList() {
  return fetchApi<Event[]>('/api/admin/events', {
    method: 'GET',
  })
}

/**
 * 更新运动员成绩
 * @param id 成绩ID
 * @param data 成绩信息
 */
export function updateAthleteResult(id: number, data: Partial<AthleteResult>) {
  return fetchApi<AthleteResult>(`/api/admin/athlete/result/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export interface Race {
  id: number
  name: string
  description: string
  startTime: string
  endTime: string
  registrationStart: string
  registrationEnd: string
  location: string
  status: number
  capacity: number
  currentParticipants: number
  type: number
  distance: number
  fee: number
  coverImage: string
  rules: string
  createTime: string
  updateTime: string
}

export interface RaceResponse {
  code: number
  message: string
  data: Race[]
}

// 获取运动员参赛赛事列表
export const getAthleteRaces = (athleteId: number) => {
  return fetchApi<RaceResponse>(`/api/admin/race/athlete/${athleteId}/races`, {
    method: 'GET',
  })
}

/**
 * 更新运动员认证状态
 * @param athleteId 运动员ID
 * @param status 认证状态 0:未认证 1:待审核 2:已认证
 */
export function updateAthleteStatus(athleteId: number, status: number) {
  return fetchApi<AthleteResponse>(`/api/admin/athlete/${athleteId}/athlete-status`, {
    method: 'PUT',
    params: { status },
  })
}
