import { fetchApi } from './fetch'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  content_type: 'text'
}

export interface ChatResponse {
  code: number
  message: string
  data: {
    conversation_id?: string
    task_id: string
    reply?: string
    result?: {
      status: string
      reply?: string
      conversation_id?: string
      chat_id?: string
      [key: string]: any
    }
    task_info: {
      task_id: string
      status: string
      result: string
      extra?: {
        api_response?: {
          status?: string
          reply?: string
        }
      }
    }
  }
}

// 获取聊天结果
export async function getChatResult(taskId: string) {
  return fetchApi<ChatResponse>(`/api/tasks/${taskId}`, {
    method: 'GET',
  })
}

// 发送聊天消息
export async function sendChatMessage(
  messages: Message[],
  options?: {
    query?: string
    conversation_id?: string
    custom_variables?: Record<string, any>
  },
) {
  const { query, conversation_id, custom_variables } = options || {}

  // 准备请求数据
  const requestData: any = {
    additional_messages: messages,
  }

  // 可选字段添加
  if (query)
    requestData.query = query

  if (conversation_id)
    requestData.conversation_id = conversation_id

  if (custom_variables)
    requestData.custom_variables = custom_variables

  const response = await fetchApi<ChatResponse>('/api/tasks/chat', {
    method: 'POST',
    body: JSON.stringify(requestData),
  })

  return response
}

// 新增：获取聊天消息历史接口定义
export interface ChatMessagesResponse {
  code: number
  message: string
  data: {
    chat_id: string
    conversation_id: string
    messages: Array<{
      id: string
      role: 'assistant' | 'user'
      content: string
      content_type: string
    }>
    message_count: number
    full_result?: any
  }
}

// 新增：获取聊天消息历史
export async function getChatMessages(chatId: string, conversationId: string) {
  // 确保参数非空
  if (!chatId || !conversationId)
    throw new Error('缺少必要参数：chat_id 和 conversation_id')

  return fetchApi<ChatMessagesResponse>('/api/tasks/chat/messages', {
    method: 'GET',
    params: {
      chat_id: chatId,
      conversation_id: conversationId,
    },
  })
}
