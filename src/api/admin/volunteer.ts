import { fetchApi } from '../fetch'

// 志愿者接口
export interface Volunteer {
  id: number
  // 基本信息
  nickname?: string
  real_name?: string
  gender?: number
  birthday?: string
  phone?: string
  id_card?: string
  avatar_url?: string
  height?: number
  weight?: number

  // 认证相关状态
  is_volunteer?: boolean
  volunteer_status?: number
  is_athlete?: boolean
  athlete_status?: number | boolean

  // 其他信息
  openid?: string
  has_chronic_disease?: boolean
  disease_desc?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string

  // 地区信息
  country?: string
  province?: string
  city?: string

  // 时间信息
  create_time?: string
  update_time?: string
  last_login?: string
}

export interface VolunteerResponse {
  code: number
  message: string
  data: Volunteer
}

// 志愿者任务接口
export interface VolunteerTask {
  id: number
  name: string
  location: string
  startTime: string
  endTime: string
  description: string
  taskStatus: number
  createTime: string
  raceId: number
}

// 分页查询参数接口
export interface PageParam {
  [key: string]: string | number | undefined
  page: number
  size: number
  keyword?: string
  status?: number
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

// 志愿者评分接口
export interface VolunteerRating {
  id: number
  volunteer_id: number
  rater_id: number
  rater_name: string
  score: number
  comment: string
  created_at: string
}

export interface VolunteerRatingResponse {
  code: number
  message: string
  data: {
    list: VolunteerRating[]
    total: number
  }
}

// 志愿者评分请求接口
export interface RateVolunteerRequest {
  volunteer_id: number
  event_id: number
  rating: number
  comments: string
}

// 志愿者评分响应接口
export interface RateVolunteerResponse {
  code: number
  message: string
  data: {
    id: number
    volunteer_id: number
    event_id: number
    rating: number
    comments: string
    created_at: string
  }
}

// 创建志愿者任务的请求接口
export interface CreateVolunteerTaskRequest {
  raceId: number
  name: string
  description: string
  startTime: string
  endTime: string
  location: string
  requiredNumber: number
  status: number
}

// 创建志愿者任务的响应接口
export interface CreateVolunteerTaskResponse {
  code: number
  message: string
  data: number
}

// 志愿者任务详情接口
export interface VolunteerTaskDetail {
  id: number
  raceId?: number
  race_id?: number
  name: string
  description: string
  startTime?: string
  start_time?: string
  endTime?: string
  end_time?: string
  location: string
  requiredNumber?: number
  required_number?: number
  status: number
  createTime?: string
  create_time?: string
  updateTime?: string
  update_time?: string
  raceName?: string
  race_name?: string
  current_number?: number
}

// 志愿者任务详情响应
export interface VolunteerTaskDetailResponse {
  code: number
  message: string
  data: VolunteerTaskDetail
}

// 志愿者申请信息
export interface VolunteerApplication {
  application_id: number
  task_id: number
  user_id: number
  username: string
  volunteer_name: string
  phone: string
  skills: string
  service_hours: number
  status: number
  create_time: string
}

// 志愿者申请列表响应
export interface VolunteerApplicationsResponse {
  code: number
  message: string
  data: VolunteerApplication[]
}

// 更新志愿者任务请求
export interface UpdateVolunteerTaskRequest {
  id: number
  raceId: number
  name: string
  description: string
  startTime: string
  endTime: string
  location: string
  requiredNumber: number
  status: number
}

/**
 * 获取志愿者列表
 * @param params 分页参数
 */
export function getVolunteerList(params: PageParam) {
  return fetchApi<PageResponse<Volunteer>>('/api/admin/volunteer/list', {
    method: 'GET',
    params,
  })
}

/**
 * 获取志愿者详情
 * @param id 志愿者ID
 */
export function getVolunteerDetail(id: number) {
  return fetchApi<VolunteerResponse>(`/api/admin/volunteer/${id}`, {
    method: 'GET',
  })
}

/**
 * 添加志愿者
 * @param data 志愿者信息
 */
export function addVolunteer(data: Omit<Volunteer, 'id' | 'createTime' | 'updateTime'>) {
  return fetchApi<VolunteerResponse>('/api/admin/volunteer', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 更新志愿者信息
 * @param id 志愿者ID
 * @param data 志愿者信息
 */
export function updateVolunteer(id: number, data: Partial<Volunteer>) {
  return fetchApi<VolunteerResponse>(`/api/admin/volunteer/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 删除志愿者
 * @param id 志愿者ID
 */
export function deleteVolunteer(id: number) {
  return fetchApi<VolunteerResponse>(`/api/admin/volunteer/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 审核志愿者
 * @param id 志愿者ID
 * @param status 审核状态 1:通过 2:拒绝
 * @param remark 审核备注
 */
export function reviewVolunteer(id: number, status: number, remark?: string) {
  return fetchApi<VolunteerResponse>(`/api/admin/volunteer/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ status, remark }),
  })
}

/**
 * 获取志愿者任务列表
 * @param volunteerId 志愿者ID
 * @param params 分页参数
 */
export function getVolunteerTaskList(volunteerId: number, params: PageParam) {
  return fetchApi<PageResponse<VolunteerTask>>(`/api/admin/volunteer/wx-user/${volunteerId}/tasks`, {
    method: 'GET',
    params,
  })
}

/**
 * 分配任务给志愿者
 * @param volunteerId 志愿者ID
 * @param data 任务信息
 */
export function assignTask(volunteerId: number, data: Omit<VolunteerTask, 'id' | 'volunteerId' | 'taskStatus' | 'createTime' | 'updateTime'>) {
  return fetchApi<VolunteerTask>(`/api/admin/volunteer/${volunteerId}/task`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 更新任务状态
 * @param volunteerId 志愿者ID
 * @param taskId 任务ID
 * @param status 任务状态 0:未开始 1:进行中 2:已完成 3:已取消
 */
export function updateTaskStatus(volunteerId: number, taskId: number, status: number) {
  return fetchApi(`/api/admin/volunteer/${volunteerId}/task/${taskId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

/**
 * 取消任务
 * @param volunteerId 志愿者ID
 * @param taskId 任务ID
 */
export function cancelTask(volunteerId: number, taskId: number) {
  return fetchApi(`/api/admin/volunteer/${volunteerId}/task/${taskId}/cancel`, {
    method: 'POST',
  })
}

// 获取志愿者评分列表
export const getVolunteerRatings = async (volunteerId: number, params: PageParam): Promise<VolunteerRatingResponse> => {
  return fetchApi(`/admin/volunteers/${volunteerId}/ratings`, {
    method: 'GET',
    params: {
      page: params.page,
      size: params.size,
    },
  })
}

// 评分志愿者
export const rateVolunteer = async (data: RateVolunteerRequest): Promise<RateVolunteerResponse> => {
  return fetchApi('/admin/volunteers/rate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 创建志愿者任务
 * @param data 志愿者任务信息
 */
export function createVolunteerTask(data: CreateVolunteerTaskRequest) {
  return fetchApi<CreateVolunteerTaskResponse>('/api/admin/volunteer-task/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 获取志愿者任务详情
 * @param id 任务ID
 */
export function getVolunteerTaskDetail(id: number) {
  return fetchApi<VolunteerTaskDetailResponse>(`/api/admin/volunteer-task/${id}`, {
    method: 'GET',
  })
}

/**
 * 获取志愿者任务申请列表
 * @param taskId 任务ID
 * @param params 分页参数
 */
export function getVolunteerTaskApplications(taskId: number, params: { pageNum: number; pageSize: number }) {
  return fetchApi<VolunteerApplicationsResponse>(`/api/admin/volunteer-task/${taskId}/applications`, {
    method: 'GET',
    params,
  })
}

/**
 * 删除志愿者任务
 * @param id 任务ID
 */
export function deleteVolunteerTask(id: number) {
  return fetchApi<{ code: number; message: string }>(`/api/admin/volunteer-task/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 更新志愿者任务状态
 * @param id 任务ID
 * @param status 状态值 0：关闭 1：开放 2：已完成
 */
export function updateVolunteerTaskStatus(id: number, status: number) {
  return fetchApi<{ code: number; message: string }>(`/api/admin/volunteer-task/${id}/status`, {
    method: 'PUT',
    params: { status },
  })
}

/**
 * 更新志愿者任务信息
 * @param data 任务信息
 */
export function updateVolunteerTask(data: UpdateVolunteerTaskRequest) {
  return fetchApi<{ code: number; message: string }>('/api/admin/volunteer-task/update', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * 获取志愿者任务列表
 * @param params 查询参数
 */
export function getAdminVolunteerTaskList(params: { pageNum: number; pageSize: number; status?: number; keyword?: string }) {
  return fetchApi<PageResponse<VolunteerTaskDetail>>('/api/admin/volunteer-task/list', {
    method: 'GET',
    params,
  })
}

/**
 * 更新志愿者任务申请状态
 * @param userId 用户ID
 * @param taskId 任务ID
 * @param status 申请状态 1:申请中 2:已通过 3:已拒绝
 */
export function updateTaskApplyStatus(userId: number, taskId: number, status: number) {
  return fetchApi<{ code: number; message: string; data: boolean }>(`/api/admin/volunteer/task/${taskId}/user/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

/**
 * 更新志愿者认证状态
 * @param userId 用户ID
 * @param status 认证状态 0: 未认证, 1: 待审核, 2: 已认证
 * @returns 响应结果
 */
export function updateVolunteerStatus(userId: number, status: number) {
  return fetchApi<{ code: number; message: string; data: any }>(`/api/admin/volunteer/wx-user/${userId}/status`, {
    method: 'PUT',
    params: { status },
  })
}

/**
 * 获取任务的志愿者列表
 * @param taskId 任务ID
 * @param params 查询参数
 * @returns 志愿者列表
 */
export function getTaskVolunteers(taskId: number, params: { page: number; size: number }) {
  return fetchApi<{
    code: number
    message: string
    data: TaskVolunteerInfo[]
  }>(`/api/admin/volunteer-task/${taskId}/volunteers`, {
    method: 'GET',
    params,
  })
}

// 任务志愿者信息
export interface TaskVolunteerInfo {
  wx_user_id: number
  openid: string
  nickname: string
  avatar_url: string
  gender: number
  phone: string
  real_name: string
  is_volunteer: number
  volunteer_status: number
  birthday: string
  height: number
  weight: number
  apply_status: number
  apply_time: string
  application_id: number
}
