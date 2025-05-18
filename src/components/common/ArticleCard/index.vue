<script setup lang='ts'>
import { computed, onUnmounted, ref } from 'vue'
import { NModal, NTabPane, NTabs } from 'naive-ui'
import loginPassword from './loginPassword.vue'
import loginPhone from './loginPhone.vue'
import register from './register.vue'
import resetPassword from './resetPassword.vue'

import { useAuthStore } from '@/store'

interface Props {
    visible: boolean
}

interface Emit {
    (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const authStore = useAuthStore()

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

const active = ref('loginPassword')

const show = computed({
    get() {
        return props.visible
    },
    set(visible: boolean) {
        emit('update:visible', visible)
    },
})
// 监听全局事件，弹出登录窗口

// 关闭登录窗口
function closeLoginModal() {
    show.value = false
}
// 关闭登录窗口
const showLoginModal = () => {
    show.value = true
}
// 在组件销毁时移除事件监听
onUnmounted(() => {

})
// 暴露函数给外部使用
defineExpose({
    showLoginModal,
})
</script>

<template>
    <NModal v-model:show="show" :auto-focus="false" preset="card"
        style="width: 95%; max-width: 640px;border-radius: 8px;">
        <div>
            <NTabs v-model:value="active" type="line" animated>
                <NTabPane name="loginPassword" tab="loginPassword">
                    <template #tab>
                        <!-- <SvgIcon class="text-lg" icon="ri:file-user-line" /> -->
                        <span class="ml-2">密码登录</span>
                    </template>
                    <div class="min-h-[100px]">
                        <loginPassword @close-modal="show = false" />
                    </div>
                </NTabPane>
                <NTabPane v-if="isChatGPTAPI" name="loginPhone" tab="loginPhone">
                    <template #tab>
                        <!-- <span class="ml-2">{{ $t('setting.advanced') }}</span> -->
                        <span class="ml-2">手机验证码登录</span>
                    </template>
                    <div class="min-h-[100px]">
                        <!-- <Advanced /> -->
                        <loginPhone @close-modal="show = false" />
                    </div>
                </NTabPane>

                <NTabPane name="register" tab="register">
                    <template #tab>
                        <span class="ml-2">注册</span>
                    </template>
                    <register @close-modal="show = false" />
                </NTabPane>
                <NTabPane name="reset" tab="reset">
                    <template #tab>
                        <span class="ml-2">重设密码</span>
                    </template>
                    <resetPassword @close-modal="show = false" />
                </NTabPane>
            </NTabs>
        </div>
    </NModal>
</template>
