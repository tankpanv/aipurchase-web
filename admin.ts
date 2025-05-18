import { baseServerUrl, getAuthHeaders } from './server'

// ---------- 赛事管理接口 ----------

// 赛事信息接口
export interface Event {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  location: string
  status: 'draft' | 'published' | 'completed' | 'cancelled'
  registration_start: string
  registration_end: string
  max_participants: number
  current_participants: number
  created_at: string
  updated_at: string
}

// 赛事日程接口
export interface EventSchedule {
  id: number
  event_id: number
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  type: string // 如：开幕式、补给站、颁奖仪式等
}

// 获取赛事列表
export const getEventList = async (params: { page: number; per_page: number; status?: string; query?: string }) => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined)
      queryParams.append(key, value.toString())
  })
  
  const response = await fetch(`${baseServerUrl}/api/admin/events?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取赛事列表失败')
    
  return await response.json()
}

// 获取赛事详情
export const getEventDetail = async (id: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/events/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取赛事详情失败')
    
  return await response.json()
}

// 创建赛事
export const createEvent = async (data: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_participants'>) => {
  const response = await fetch(`${baseServerUrl}/api/admin/events`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('创建赛事失败')
    
  return await response.json()
}

// 更新赛事
export const updateEvent = async (id: number, data: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>) => {
  const response = await fetch(`${baseServerUrl}/api/admin/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('更新赛事失败')
    
  return await response.json()
}

// 删除赛事
export const deleteEvent = async (id: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('删除赛事失败')
    
  return await response.json()
}

// 获取赛事日程
export const getEventSchedules = async (eventId: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/events/${eventId}/schedules`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取赛事日程失败')
    
  return await response.json()
}

// 创建赛事日程
export const createEventSchedule = async (eventId: number, data: Omit<EventSchedule, 'id'>) => {
  const response = await fetch(`${baseServerUrl}/api/admin/events/${eventId}/schedules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('创建赛事日程失败')
    
  return await response.json()
}

// 更新赛事日程
export const updateEventSchedule = async (eventId: number, scheduleId: number, data: Partial<Omit<EventSchedule, 'id'>>) => {
  const response = await fetch(`${baseServerUrl}/api/admin/events/${eventId}/schedules/${scheduleId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('更新赛事日程失败')
    
  return await response.json()
}

// 删除赛事日程
export const deleteEventSchedule = async (eventId: number, scheduleId: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/events/${eventId}/schedules/${scheduleId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('删除赛事日程失败')
    
  return await response.json()
}

// ---------- 运动员管理接口 ----------

// 运动员信息接口
export interface Athlete {
  id: number
  user_id: number
  name: string
  gender: 'male' | 'female' | 'other'
  birth_date: string
  contact_phone: string
  email: string
  emergency_contact: string
  emergency_phone: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

// 运动员健康数据接口
export interface AthleteHealth {
  id: number
  athlete_id: number
  height: number
  weight: number
  blood_type: string
  health_condition: string
  allergies: string
  medical_history: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

// 运动员成绩接口
export interface AthleteResult {
  id: number
  event_id: number
  athlete_id: number
  start_time: string
  finish_time: string
  total_time: string
  rank: number
  status: 'completed' | 'dnf' | 'disqualified'
  checkpoints: Array<{
    checkpoint_id: number
    time: string
  }>
}

// 获取运动员列表
export const getAthleteList = async (params: { page: number; per_page: number; status?: string; query?: string; event_id?: number }) => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined)
      queryParams.append(key, value.toString())
  })
  
  const response = await fetch(`${baseServerUrl}/api/admin/athletes?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取运动员列表失败')
    
  return await response.json()
}

// 获取运动员详情
export const getAthleteDetail = async (id: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/athletes/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取运动员详情失败')
    
  return await response.json()
}

// 更新运动员状态
export const updateAthleteStatus = async (id: number, status: 'approved' | 'rejected', reason?: string) => {
  const response = await fetch(`${baseServerUrl}/api/admin/athletes/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, reason })
  })
  
  if (!response.ok)
    throw new Error('更新运动员状态失败')
    
  return await response.json()
}

// 获取运动员健康数据
export const getAthleteHealth = async (athleteId: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/athletes/${athleteId}/health`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取运动员健康数据失败')
    
  return await response.json()
}

// 审核运动员健康数据
export const reviewAthleteHealth = async (athleteId: number, status: 'approved' | 'rejected', reason?: string) => {
  const response = await fetch(`${baseServerUrl}/api/admin/athletes/${athleteId}/health/review`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, reason })
  })
  
  if (!response.ok)
    throw new Error('审核运动员健康数据失败')
    
  return await response.json()
}

// 获取运动员成绩列表
export const getAthleteResults = async (athleteId: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/athletes/${athleteId}/results`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取运动员成绩列表失败')
    
  return await response.json()
}

// 添加运动员成绩
export const createAthleteResult = async (data: Omit<AthleteResult, 'id'>) => {
  const response = await fetch(`${baseServerUrl}/api/admin/results`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('添加运动员成绩失败')
    
  return await response.json()
}

// 更新运动员成绩
export const updateAthleteResult = async (id: number, data: Partial<Omit<AthleteResult, 'id'>>) => {
  const response = await fetch(`${baseServerUrl}/api/admin/results/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('更新运动员成绩失败')
    
  return await response.json()
}

// ---------- 志愿者管理接口 ----------

// 志愿者信息接口
export interface Volunteer {
  id: number
  user_id: number
  name: string
  gender: 'male' | 'female' | 'other'
  birth_date: string
  contact_phone: string
  email: string
  emergency_contact: string
  emergency_phone: string
  experience: string
  availability: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

// 志愿者管理相关接口
export interface VolunteerData {
  id: number
  name: string
  gender: string
  age: number
  phone: string
  email: string
  address: string
  emergency_contact: string
  emergency_phone: string
  status: string // pending, approved, rejected
  skills: string[]
  languages: string[]
  experience: string
  availability: string[]
  event_preferences: number[]
  avatar?: string
  register_time: string
  last_login: string
  reject_reason?: string
}

// 获取志愿者列表
export const getVolunteerList = async (params: { page: number; per_page: number; status?: string; query?: string; event_id?: number }) => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined)
      queryParams.append(key, value.toString())
  })
  
  const response = await fetch(`${baseServerUrl}/api/admin/volunteers?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取志愿者列表失败')
    
  return await response.json()
}

// 获取志愿者详情
export const getVolunteerDetail = async (id: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteers/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取志愿者详情失败')
    
  return await response.json()
}

// 更新志愿者状态
export const updateVolunteerStatus = async (id: number, status: 'approved' | 'rejected', reason?: string) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteers/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, reason })
  })
  
  if (!response.ok)
    throw new Error('更新志愿者状态失败')
    
  return await response.json()
}

// 审核志愿者申请
export const approveVolunteer = async (id: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteers/${id}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('审核志愿者申请失败')
    
  return await response.json()
}

// 拒绝志愿者申请
export const rejectVolunteer = async (id: number, reason: string) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteers/${id}/reject`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  })
  
  if (!response.ok)
    throw new Error('拒绝志愿者申请失败')
    
  return await response.json()
}

// 获取志愿者任务列表
export const getVolunteerTasks = async (id: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteers/${id}/tasks`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取志愿者任务列表失败')
    
  return await response.json()
}

// 分配志愿者任务
export const assignVolunteerTask = async (data: {
  volunteer_id: number
  event_id: number
  task_name: string
  task_description: string
  start_time: number
  end_time: number
  location: string
  priority: string // low, medium, high
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteer-tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('分配志愿者任务失败')
    
  return await response.json()
}

// 更新志愿者任务
export const updateVolunteerTask = async (id: number, data: {
  task_name?: string
  task_description?: string
  start_time?: number
  end_time?: number
  location?: string
  priority?: string
  status?: string // pending, in_progress, completed, cancelled
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteer-tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('更新志愿者任务失败')
    
  return await response.json()
}

// 取消志愿者任务
export const cancelVolunteerTask = async (id: number, reason: string) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteer-tasks/${id}/cancel`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  })
  
  if (!response.ok)
    throw new Error('取消志愿者任务失败')
    
  return await response.json()
}

// 完成志愿者任务
export const completeVolunteerTask = async (id: number, remarks: string) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteer-tasks/${id}/complete`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ remarks })
  })
  
  if (!response.ok)
    throw new Error('完成志愿者任务失败')
    
  return await response.json()
}

// 获取志愿者评价
export const getVolunteerRatings = async (id: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteers/${id}/ratings`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取志愿者评价失败')
    
  return await response.json()
}

// 添加志愿者评价
export const rateVolunteer = async (data: {
  volunteer_id: number
  event_id: number
  rating: number // 1-5
  comments: string
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/volunteer-ratings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('添加志愿者评价失败')
    
  return await response.json()
}

// ---------- 设备管理接口 ----------

// 设备信息接口
export interface Device {
  id: number
  serial_number: string
  type: 'gps_watch' | 'timing_chip' | 'heart_rate_monitor' | 'other'
  name: string
  status: 'available' | 'assigned' | 'maintenance' | 'lost'
  last_maintenance: string | null
  assigned_to: number | null
  battery_level: number | null
  notes: string
  created_at: string
  updated_at: string
}

// 设备数据接口
export interface DeviceData {
  id: number
  serial_number: string
  type: string // 'gps', 'heart_rate', 'chip', etc.
  name: string
  status: string // 'active', 'inactive', 'maintenance', 'lost'
  battery_level: number
  firmware_version: string
  last_update: string
  last_location?: {
    latitude: number
    longitude: number
    timestamp: string
  }
  assigned_to?: {
    athlete_id: number
    athlete_name: string
    assigned_at: string
  }
  maintenance_history: {
    id: number
    type: string
    description: string
    date: string
    technician: string
  }[]
  issue_reports: {
    id: number
    issue_type: string
    description: string
    reported_at: string
    reported_by: string
    status: string // 'open', 'in_progress', 'resolved', 'closed'
    resolved_at?: string
    resolution?: string
  }[]
  created_at: string
  updated_at: string
}

// 获取设备列表
export const getDevices = async (params: {
  page: number
  per_page: number
  status?: string
  type?: string
  search?: string
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/devices?${new URLSearchParams({
    page: params.page.toString(),
    per_page: params.per_page.toString(),
    ...(params.status ? { status: params.status } : {}),
    ...(params.type ? { type: params.type } : {}),
    ...(params.search ? { search: params.search } : {})
  })}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取设备列表失败')
    
  return await response.json()
}

// 获取设备详情
export const getDeviceDetail = async (id: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/devices/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取设备详情失败')
    
  return await response.json()
}

// 创建新设备
export const createDevice = async (data: {
  serial_number: string
  type: string
  name: string
  firmware_version: string
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/devices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('创建设备失败')
    
  return await response.json()
}

// 更新设备信息
export const updateDevice = async (id: number, data: {
  name?: string
  status?: string
  firmware_version?: string
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/devices/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('更新设备信息失败')
    
  return await response.json()
}

// 分配设备给运动员
export const assignDevice = async (id: number, athleteId: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/devices/${id}/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ athlete_id: athleteId })
  })
  
  if (!response.ok)
    throw new Error('分配设备失败')
    
  return await response.json()
}

// 取消设备分配
export const unassignDevice = async (id: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/devices/${id}/unassign`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('取消设备分配失败')
    
  return await response.json()
}

// 报告设备问题
export const reportDeviceIssue = async (data: {
  device_id: number
  issue_type: string
  description: string
  reported_by: string
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/device-issues`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('报告设备问题失败')
    
  return await response.json()
}

// 解决设备问题
export const resolveDeviceIssue = async (id: number, data: {
  resolution: string
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/device-issues/${id}/resolve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('解决设备问题失败')
    
  return await response.json()
}

// 添加设备维护记录
export const addDeviceMaintenance = async (data: {
  device_id: number
  type: string
  description: string
  technician: string
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/device-maintenance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('添加维护记录失败')
    
  return await response.json()
}

// 获取可用运动员列表（用于分配设备）
export const getAthletes = async (params: {
  page: number
  per_page: number
  status?: string
  name?: string
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/athletes?${new URLSearchParams({
    page: params.page.toString(),
    per_page: params.per_page.toString(),
    ...(params.status ? { status: params.status } : {}),
    ...(params.name ? { name: params.name } : {})
  })}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取运动员列表失败')
    
  return await response.json()
}

// ---------- 系统管理接口 ----------

// 用户管理接口
export interface User {
  id: number
  username: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'athlete' | 'volunteer'
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// 获取用户列表
export const getUserList = async (params: { page: number; per_page: number; role?: string; status?: string; query?: string }) => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined)
      queryParams.append(key, value.toString())
  })
  
  const response = await fetch(`${baseServerUrl}/api/admin/users?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取用户列表失败')
    
  return await response.json()
}

// 创建用户
export const createUser = async (data: {
  username: string
  password: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'athlete' | 'volunteer'
}) => {
  const response = await fetch(`${baseServerUrl}/api/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('创建用户失败')
    
  return await response.json()
}

// 更新用户
export const updateUser = async (id: number, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) => {
  const response = await fetch(`${baseServerUrl}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('更新用户失败')
    
  return await response.json()
}

// 修改用户密码
export const changeUserPassword = async (id: number, password: string) => {
  const response = await fetch(`${baseServerUrl}/api/admin/users/${id}/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password })
  })
  
  if (!response.ok)
    throw new Error('修改用户密码失败')
    
  return await response.json()
}

// 获取系统日志
export interface SystemLog {
  id: number
  user_id: number
  username: string
  action: string
  resource: string
  resource_id: number | null
  ip_address: string
  created_at: string
}

// 获取系统日志列表
export const getSystemLogs = async (params: { page: number; per_page: number; user_id?: number; action?: string; start_date?: string; end_date?: string }) => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined)
      queryParams.append(key, value.toString())
  })
  
  const response = await fetch(`${baseServerUrl}/api/admin/logs?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取系统日志失败')
    
  return await response.json()
}

// ---------- 数据统计接口 ----------

// 获取赛事统计数据
export const getEventStatistics = async (eventId: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/statistics/events/${eventId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取赛事统计数据失败')
    
  return await response.json()
}

// 获取运动员位置数据（实时监控）
export const getAthleteLocations = async (eventId: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/monitoring/events/${eventId}/locations`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取运动员位置数据失败')
    
  return await response.json()
}

// 获取运动员心率数据（实时监控）
export const getAthleteHeartRates = async (eventId: number) => {
  const response = await fetch(`${baseServerUrl}/api/admin/monitoring/events/${eventId}/heart-rates`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取运动员心率数据失败')
    
  return await response.json()
}

// ---------- 系统配置接口 ----------

// 系统配置数据接口
export interface SystemConfigData {
  id?: number
  configKey: string
  configValue: string
  description?: string
  updatedAt?: string
  createdAt?: string
}

// 获取系统配置列表
export const getSystemConfigs = async () => {
  const response = await fetch(`${baseServerUrl}/api/admin/system/configs`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok)
    throw new Error('获取系统配置失败')
    
  return await response.json()
}

// 更新系统配置
export const updateSystemConfig = async (id: number, data: SystemConfigData) => {
  const response = await fetch(`${baseServerUrl}/api/admin/system/configs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  
  if (!response.ok)
    throw new Error('更新系统配置失败')
    
  return await response.json()
} 