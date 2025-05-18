<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NInput,
  NSpace,
  NSpin,
  NText,
  useMessage,
} from 'naive-ui'
import {
  type Message as ApiMessage,
  getChatMessages,
  getChatResult,
  sendChatMessage,
} from '@/api/chat'

interface Message {
  type: 'assistant' | 'user'
  content: string
  status?: 'sending' | 'success' | 'error'
}

const message = useMessage()
const messages = ref<Message[]>([
  {
    type: 'assistant',
    content: '您好，我是财务报销智能助手，请问有什么可以帮助您的?',
    status: 'success',
  },
])

// 会话ID用于连续对话
const conversationId = ref<string | undefined>(undefined)
const userInput = ref('')
const sending = ref(false)
const messagesRef = ref<HTMLElement | null>(null)

// 新增参数存储chat_id
const chatId = ref<string | undefined>(undefined)

// 转换为API消息格式
function convertToApiMessages(): ApiMessage[] {
  return messages.value
    .filter(msg => msg.status === 'success') // 只发送成功的消息
    .map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content,
      content_type: 'text',
    }))
}

// 滚动到最新消息
function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value)
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

// 改进后的轮询聊天结果函数
async function pollChatResult(taskId: string, maxAttempts = 20, interval = 1000) {
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      // 先通过任务查询接口获取chat_id
      const taskResponse = await getChatResult(taskId)

      // 从返回结果中更新chat_id和conversation_id
      if (taskResponse.data?.result?.chat_id)
        chatId.value = taskResponse.data.result.chat_id

      if (taskResponse.data?.result?.conversation_id)
        conversationId.value = taskResponse.data.result.conversation_id

      // 如果有conversation_id和chat_id，优先使用messages接口获取结果
      if (conversationId.value && chatId.value) {
        try {
          console.log('尝试获取消息历史：', chatId.value, conversationId.value)
          const messagesResponse = await getChatMessages(chatId.value, conversationId.value)
          const messages = messagesResponse?.data?.messages

          if (messages && messages.length > 0) {
            // 找到最新的assistant消息
            const assistantMessages = messages.filter(msg => msg.role === 'assistant')
            if (assistantMessages.length > 0)
              return assistantMessages[0].content
          }
        }
        catch (messagesError) {
          console.error('获取消息历史失败:', messagesError)
          // 如果获取消息失败，继续使用任务查询接口，不影响主流程
        }
      }

      // 如果messages接口没有返回有效结果，从任务查询结果中获取回复
      if (taskResponse.data?.result?.reply)
        return taskResponse.data.result.reply

      if (taskResponse.data?.task_info?.extra?.api_response?.reply)
        return taskResponse.data.task_info.extra.api_response.reply

      // 如果状态不是进行中，则结束轮询
      const status = taskResponse.data?.result?.status || taskResponse.data?.task_info?.status
      if (status && status !== 'in_progress')
        return taskResponse.data?.task_info?.result || '对话已完成，但未收到回复'

      // 等待下一次轮询
      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    }
    catch (error) {
      console.error('轮询失败:', error)
      return '获取回复失败'
    }
  }

  return '回复超时，请稍后再试'
}

async function handleSend() {
  const input = userInput.value.trim()
  if (!input || sending.value)
    return

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: input,
    status: 'success',
  })
  scrollToBottom()

  // 添加助手消息占位
  messages.value.push({
    type: 'assistant',
    content: '正在思考...',
    status: 'sending',
  })
  scrollToBottom()

  sending.value = true
  userInput.value = ''

  try {
    // 获取格式化的对话历史
    const apiMessages = convertToApiMessages()

    // 发送请求，包含完整历史记录
    const response = await sendChatMessage(apiMessages, {
      conversation_id: conversationId.value,
      query: apiMessages[apiMessages.length - 2]?.content,
      custom_variables: {},
    })

    // 更新会话ID以便继续对话
    if (response.data?.conversation_id)
      conversationId.value = response.data.conversation_id
    else if (response.data?.result?.conversation_id)
      conversationId.value = response.data.result.conversation_id

    // 更新聊天ID
    if (response.data?.result?.chat_id)
      chatId.value = response.data.result.chat_id

    // 获取任务ID用于轮询
    const taskId = response.data?.task_id

    // 尝试获取回复内容
    let replyContent = ''

    // 如果已有回复，直接使用
    if (response.data?.reply) {
      replyContent = response.data.reply
    }
    else if (response.data?.result?.reply) {
      replyContent = response.data.result.reply
    }
    else if (response.data?.task_info?.result) {
      replyContent = response.data.task_info.result
    }
    else if (taskId) {
      // 如果回复为空且状态为in_progress，进行轮询
      replyContent = await pollChatResult(taskId)
    }
    else {
      replyContent = '没有收到有效回复，请稍后再试'
    }

    // 更新助手消息
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.type === 'assistant') {
      lastMessage.content = replyContent || '没有收到有效回复，请稍后再试'
      lastMessage.status = 'success'
    }
    scrollToBottom()

    // 打印调试日志
    console.log('对话参数：', {
      conversationId: conversationId.value,
      chatId: chatId.value,
      taskId: response.data?.task_id,
    })
  }
  catch (error) {
    // 处理错误
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.type === 'assistant') {
      lastMessage.content = '抱歉，我遇到了一些问题，请稍后再试'
      lastMessage.status = 'error'
    }
    message.error('对话请求失败')
    scrollToBottom()
  }
  finally {
    sending.value = false
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <NCard title="财务报销智能体" class="ai-assistant">
    <div class="chat-container">
      <div ref="messagesRef" class="messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message" :class="[msg.type, msg.status]"
        >
          <NSpin v-if="msg.status === 'sending'" size="small" />
          <NText :type="msg.status === 'error' ? 'error' : undefined">
            {{ msg.content }}
          </NText>
        </div>
      </div>
      <div class="input-area">
        <NSpace vertical>
          <NInput
            v-model:value="userInput"
            type="textarea"
            placeholder="请输入您的问题..."
            :rows="3"
            :disabled="sending"
            @keyup.enter.prevent="handleSend"
          />
          <NButton
            type="primary"
            block
            :loading="sending"
            :disabled="!userInput.trim()"
            @click="handleSend"
          >
            发送
          </NButton>
        </NSpace>
      </div>
    </div>
  </NCard>
</template>

<style scoped>
.ai-assistant {
  margin-top: 20px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 8px 12px;
  border-radius: 6px;
  max-width: 80%;
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-word;
}

.message.assistant {
  background-color: #f3f3f3;
  align-self: flex-start;
}

.message.user {
  background-color: #4B9EFF;
  color: white;
  align-self: flex-end;
}

.message.sending {
  opacity: 0.7;
}

.message.error {
  background-color: #fff2f0;
}

.input-area {
  padding: 10px;
  border-top: 1px solid #eee;
}
</style>
