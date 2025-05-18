import { fetchApi } from '../fetch'
import type { PageResponse } from './types'

export interface DeviceData {
  id: number
  serialNumber: string
  type: string
  status: 'available' | 'assigned' | 'maintenance' | 'broken' | 'lost'
  batteryLevel?: number
  lastMaintenance: string
  assignedTo?: number
}

export interface DeviceIssue {
  id: number
  deviceId: number
  description: string
  status: 'pending' | 'resolved'
  reportedAt: string
  resolvedAt?: string
}

export interface DeviceListResponse {
  code: number
  message: string
  data: {
    pageNum: number
    pageSize: number
    totalPage: number
    total: number
    list: DeviceData[]
  }
}

export interface DeviceIssueResponse extends PageResponse {
  list: DeviceIssue[]
}

export function getDevices(params: {
  pageNum: number
  pageSize: number
  type?: string
  status?: string
}): Promise<DeviceListResponse> {
  return fetchApi('/admin/devices', { params })
}

export function getDeviceById(id: number): Promise<{ data: DeviceData }> {
  return fetchApi(`/admin/devices/${id}`)
}

export function createDevice(data: Omit<DeviceData, 'id'>): Promise<void> {
  return fetchApi('/admin/devices', {
    method: 'POST',
    data
  })
}

export function updateDevice(id: number, data: Partial<DeviceData>): Promise<void> {
  return fetchApi(`/admin/devices/${id}`, {
    method: 'PUT',
    data
  })
}

export function assignDevice(deviceId: number, athleteId: number): Promise<void> {
  return fetchApi(`/admin/devices/${deviceId}/assign`, {
    method: 'POST',
    data: { athleteId }
  })
}

export function reportDeviceIssue(deviceId: number, description: string): Promise<void> {
  return fetchApi(`/admin/devices/${deviceId}/issues`, {
    method: 'POST',
    data: { description }
  })
} 