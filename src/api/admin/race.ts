import { fetchApi } from '../fetch'

// 比赛基本信息接口
export interface Race {
  id: number
  name: string
  description: string
  startTime: string
  endTime: string
  location: string
  status: number // 0:未开始 1:报名中 2:进行中 3:已结束
  capacity: number
  type: number // 1:马拉松 2:半程马拉松 3:迷你马拉松
  distance: number | null
  currentParticipants: number
  fee: number | null
  registrationStart: string
  registrationEnd: string
  coverImage: string | null
  rules: string | null
  gisData: string | null
  creatorId: number
  startCoordinate: { lat: number | null; lng: number | null }
  endCoordinate: { lat: number | null; lng: number | null }
  createTime: string
  updateTime: string
}

// 通用响应接口
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 比赛详情响应接口
export interface RaceEventResponse extends ApiResponse<Race> {}

// 比赛项目响应接口
export interface RaceEventDetailResponse extends ApiResponse<RaceEvent> {}

// 比赛项目接口
export interface RaceEvent {
  id: number
  raceId: number
  name: string
  description: string
  startTime: string
  endTime: string
  maxParticipants: number
  currentParticipants: number
  status: number
  createTime: string
  updateTime: string
}

// 分页参数接口
export interface PageParam {
  pageNum: number
  pageSize: number
}

// 分页响应接口
export interface PageResponse<T> extends ApiResponse<{
  pageNum: number
  pageSize: number
  totalPage: number
  total: number
  list: T[]
}> {}

// 比赛统计接口
export interface RaceStatistics {
  id: number
  name: string
  startDate: string
  endDate: string
  location: string
  status: 'draft' | 'published' | 'completed' | 'cancelled'
  participantCount: number
  volunteerCount: number
  registrationTimeline: Array<{
    date: string
    count: number
  }>
  genderDistribution: {
    male: number | null
    female: number | null
    other: number | null
  }
  ageDistribution: Array<{
    range: string
    count: number
  }>
  completionStats: {
    completed: number | null
    dnf: number | null
    disqualified: number | null
  }
  deviceUsage: Array<{
    type: string
    count: number
  }>
  topRunners: Array<{
    rank: number
    name: string
    gender: 'male' | 'female' | 'other'
    age: number
    finishTime: string
    averagePace: string
    maxHeartRate: number
    averageHeartRate: number
  }>
}

export interface RaceStatisticsResponse {
  code: number
  message: string
  data: RaceStatistics
}

// 运动员位置信息接口
export interface AthleteLocation {
  id: number
  name: string
  latitude: number
  longitude: number
  timestamp: string
  speed: number
  distance: number
  heart_rate: number
  status: string // running, walking, stopped
}

export interface AthleteLocationResponse {
  code: number
  message: string
  data: AthleteLocation[]
}

// 赛事报名统计信息接口
export interface RaceRegistrationStats {
  total: number
  registered: number
  confirmed: number
  cancelled: number
}

// 运动员信息接口
export interface RaceParticipant {
  userId: number
  username: string
  realName: string | null
  phone: string | null
  age: number | null
  gender: string | null
  score: number | null
  status: number
  registrationTime: string
  updateTime: string
}

export interface RaceParticipantsResponse {
  code: number
  message: string
  data: RaceParticipant[]
}

/**
 * 获取比赛列表
 * @param params 分页参数
 */
export function getRaceList(params: { pageNum: number; pageSize: number }) {
  return fetchApi<PageResponse<Race>>('/api/admin/race/list', {
    method: 'GET',
    params: {
      pageNum: params.pageNum.toString(),
      pageSize: params.pageSize.toString(),
    },
  })
}

/**
 * 获取比赛详情
 * @param id 比赛ID
 */
export function getRaceDetail(id: number) {
  return fetchApi<RaceEventResponse>(`/api/admin/race/${id}`, {
    method: 'GET',
  })
}

/**
 * 创建比赛
 * @param data 比赛信息
 */
export function createRace(data: Omit<Race, 'id' | 'currentParticipants' | 'createTime' | 'updateTime'>) {
  return fetchApi<Race>('/api/admin/race/create', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      source: 0, // 管理员创建
    }),
  })
}

/**
 * 更新比赛信息
 * @param id 比赛ID
 * @param data 比赛信息
 */
export function updateRace(id: number, data: Partial<Race>) {
  return fetchApi<Race>(`/api/admin/race/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 删除比赛
 * @param id 比赛ID
 */
export function deleteRace(id: number) {
  return fetchApi(`/api/admin/race/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 获取比赛项目列表
 * @param raceId 比赛ID
 * @param params 分页参数
 */
export function getRaceEventList(raceId: number, params: { pageNum: number; pageSize: number }) {
  return fetchApi<PageResponse<RaceEvent>>(`/api/admin/race/${raceId}/event/list`, {
    method: 'GET',
    params: {
      pageNum: params.pageNum.toString(),
      pageSize: params.pageSize.toString(),
    },
  })
}

/**
 * 获取比赛项目详情
 * @param raceId 比赛ID
 * @param id 项目ID
 */
export function getRaceEventDetail(raceId: number, id: number) {
  return fetchApi<RaceEventDetailResponse>(`/api/admin/race/${raceId}/event/${id}`, {
    method: 'GET',
  })
}

/**
 * 创建比赛项目
 * @param raceId 比赛ID
 * @param data 项目信息
 */
export function createRaceEvent(raceId: number, data: Omit<RaceEvent, 'id' | 'raceId' | 'currentParticipants' | 'createTime' | 'updateTime'>) {
  return fetchApi<RaceEvent>(`/api/admin/race/${raceId}/event`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 更新比赛项目
 * @param raceId 比赛ID
 * @param id 项目ID
 * @param data 项目信息
 */
export function updateRaceEvent(raceId: number, id: number, data: Partial<RaceEvent>) {
  return fetchApi<RaceEvent>(`/api/admin/race/${raceId}/event/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 删除比赛项目
 * @param raceId 比赛ID
 * @param id 项目ID
 */
export function deleteRaceEvent(raceId: number, id: number) {
  return fetchApi(`/api/admin/race/${raceId}/event/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 更新比赛状态
 * @param id 比赛ID
 * @param status 状态 0:未开始 1:报名中 2:进行中 3:已结束
 */
export function updateRaceStatus(id: number, status: number) {
  return fetchApi(`/api/admin/race/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

/**
 * 更新比赛项目状态
 * @param raceId 比赛ID
 * @param id 项目ID
 * @param status 状态 0:未开始 1:报名中 2:进行中 3:已结束
 */
export function updateRaceEventStatus(raceId: number, id: number, status: number) {
  return fetchApi(`/api/admin/race/${raceId}/event/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

/**
 * 获取赛事统计数据
 * @param raceId 赛事ID
 * @returns 赛事统计数据
 */
export function getRaceStatistics(raceId: number): Promise<RaceStatisticsResponse> {
  return fetchApi<RaceStatisticsResponse>(`/api/admin/race/${raceId}/statistics`, {
    method: 'GET',
  }).then((response) => {
    console.log('getRaceStatistics response:', response)
    return response
  })
}

/**
 * 获取比赛运动员位置信息
 * @param raceId 比赛ID
 */
export function getRaceAthleteLocations(raceId: number) {
  return fetchApi<AthleteLocationResponse>(`/api/admin/race/${raceId}/athletes`, {
    method: 'GET',
  })
}

/**
 * 获取赛事报名统计信息
 * @param raceId 赛事ID
 */
export function getRaceRegistrationStats(raceId: number) {
  return fetchApi<RaceRegistrationStats>(`/api/admin/race/${raceId}/registration-stats`, {
    method: 'GET',
  })
}

/**
 * 获取比赛参与运动员列表
 * @param raceId 比赛ID
 * @param params 分页参数
 */
export function getRaceParticipants(raceId: number, params: { pageNum: number; pageSize: number }) {
  return fetchApi<RaceParticipantsResponse>(`/api/admin/race/${raceId}/participants`, {
    method: 'GET',
    params: {
      pageNum: params.pageNum.toString(),
      pageSize: params.pageSize.toString(),
    },
  })
}
