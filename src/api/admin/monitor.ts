import { fetchApi } from '../fetch'
import type { PageParam, PageResponse } from './types'

// 实时监控数据接口
export interface MonitorData {
  id: number
  raceId: number
  eventId: number
  athleteId: number
  deviceId: string
  deviceType: number // 1:手环 2:GPS 3:摄像头
  latitude?: number
  longitude?: number
  heartRate?: number
  speed?: number
  temperature?: number
  batteryLevel?: number
  timestamp: string
  createTime: string
}
export interface MonitorDataResponse {
  code: number
  message: string
  data: MonitorData[]
}
// 异常事件接口
export interface AbnormalEvent {
  id: number
  raceId: number
  eventId: number
  athleteId: number
  deviceId: string
  eventType: number // 1:心率异常 2:离线 3:偏离路线 4:电量不足 5:其他
  eventLevel: number // 1:提醒 2:警告 3:严重
  eventStatus: number // 0:未处理 1:处理中 2:已处理
  description: string
  handleResult?: string
  createTime: string
  updateTime: string
}

// 设备状态接口
export interface DeviceStatus {
  id: number
  deviceId: string
  deviceType: number
  status: number // 0:离线 1:在线 2:故障
  batteryLevel: number
  lastHeartbeatTime: string
  createTime: string
  updateTime: string
}

/**
 * 获取实时监控数据
 * @param raceId 比赛ID
 * @param eventId 项目ID
 */
export function getMonitorData(raceId: number, eventId?: number) {
  return fetchApi<MonitorData[]>('/api/admin/monitor/data', {
    method: 'GET',
    params: { raceId, eventId },
  })
}

/**
 * 获取异常事件列表
 * @param params 分页参数
 */
export function getAbnormalEventList(params: PageParam) {
  return fetchApi<PageResponse<AbnormalEvent>>('/api/admin/monitor/event/list', {
    method: 'GET',
    params,
  })
}

/**
 * 获取异常事件详情
 * @param id 事件ID
 */
export function getAbnormalEventDetail(id: number) {
  return fetchApi<AbnormalEvent>(`/api/admin/monitor/event/${id}`, {
    method: 'GET',
  })
}

/**
 * 处理异常事件
 * @param id 事件ID
 * @param status 处理状态 1:处理中 2:已处理
 * @param handleResult 处理结果
 */
export function handleAbnormalEvent(id: number, status: number, handleResult: string) {
  return fetchApi(`/api/admin/monitor/event/${id}/handle`, {
    method: 'POST',
    body: JSON.stringify({ status, handleResult }),
  })
}

/**
 * 获取设备状态列表
 * @param params 分页参数
 */
export function getDeviceStatusList(params: PageParam) {
  return fetchApi<PageResponse<DeviceStatus>>('/api/admin/monitor/device/list', {
    method: 'GET',
    params,
  })
}

/**
 * 获取设备状态详情
 * @param deviceId 设备ID
 */
export function getDeviceStatusDetail(deviceId: string) {
  return fetchApi<DeviceStatus>(`/api/admin/monitor/device/${deviceId}`, {
    method: 'GET',
  })
}

/**
 * 更新设备状态
 * @param deviceId 设备ID
 * @param status 设备状态 0:离线 1:在线 2:故障
 */
export function updateDeviceStatus(deviceId: string, status: number) {
  return fetchApi(`/api/admin/monitor/device/${deviceId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

/**
 * 获取实时统计数据
 * @param raceId 比赛ID
 */
export function getStatisticsData(raceId: number) {
  return fetchApi<{
    totalAthletes: number
    onlineDevices: number
    abnormalEvents: number
    averageHeartRate: number
    averageSpeed: number
  }>(`/api/admin/monitor/statistics/${raceId}`, {
    method: 'GET',
  })
} 