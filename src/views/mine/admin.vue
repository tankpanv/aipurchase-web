<script lang="ts">
import { computed, defineComponent, inject, onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'
import { NAvatar, NButton, NButtonGroup, NCard, NCarousel, NDescriptions, NDescriptionsItem, NGrid, NGridItem, NH3, NIcon, NImage, NNumberAnimation, NScrollbar, NSpace, NStatistic, NTabPane, NTable, NTabs, NText, NTimeline, NTimelineItem, NTooltip, useMessage } from 'naive-ui'
import { ArrowForward } from '@vicons/ionicons5'
import Pay from './pay.vue'
import headImg from '@/assets/avatar.jpg'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useEnvStore, useUserStore } from '@/store'
import defaultAvatar from '@/assets/avatar.jpg'
import Setting from '@/components/common/Setting/index.vue'
import AdminSetting from '@/components/common/AdminSetting/index.vue'
import { SvgIcon } from '@/components/common'

export default defineComponent({
  components: {
    ArrowForward,
    NGrid,
    NGridItem,
    NCard,
    NImage,
    NSpace,
    NTable,
    NButtonGroup,
    NDescriptionsItem,
    NDescriptions,
    NNumberAnimation,
    NIcon,
    NCarousel,
    NButton,
    NStatistic,

    NAvatar,
    NScrollbar,
    NTimeline,
    NTimelineItem,
    NText,
    NH3,
    NTabPane,
    NTabs,
    AdminSetting,
    Setting,
    SvgIcon,
    NTooltip,
    UseMessage: useMessage,
    Pay,

  },
  setup() {
    const router = useRouter()
    const eventBus = inject('eventBus')
    const userStore = useUserStore()
    const userInfo = computed(() => userStore.userInfo)
    const envStore = useEnvStore()
    const envInfo = computed(() => envStore.envInfo)
    onMounted(() => {
      // 入口处判断是否登录，否则弹窗让登录
      if (!userInfo.value.isLogin)
        eventBus.showLogin()
      else
        GetWuserInfo()
    })
    // 监听 userInfo.isLogin 的变化
    const showPay = ref(false)
    // const User = defineAsyncComponent(() => import('@/components/common/User/index.vue'))
    const { isMobile } = useBasicLayout()
    const ms = useMessage()
    const showDev = ref(false)
    let clickCount = 0
    let clickTimer = null
    const handleDoubleClick = () => {
      clickCount++
      console.log('clickCount:', clickCount)
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0
        }, 2000) // 设置延迟时间，单位为毫秒
      }
      else if (clickCount >= 2) {
        clearTimeout(clickTimer)
        clickCount = 0
        showDev.value = true // 在连续双击时设置 showDev 为 true
      }
    }
    function showLoginForm() {
      eventBus.showLogin()
    }
    const st = ref({ show: false, showImg: false, menu: [], active: 'chat' })
    const loginItem = ref({ show: false, showImg: false, menu: [], active: 'chat' })
    const adminSettingShow = ref({ show: false, showImg: false, menu: [], active: 'chat' })

    async function GetWuserInfo() {
      // try {
      //   // 调用 uploadAuthFilesPost 方法
      //   // 调用 wuserRegisterPost 函数
      //   UserApiInstance.wuserUidGetGet(userInfo.value.uid, {
      //     validateStatus(status) {
      //       // 返回 true 时，promise 将会 resolve；返回 false，则 promise 将会 reject
      //       // 这里允许所有的响应状态码，这样您就可以在之后自行处理
      //       return true // 或者您可以指定允许的状态码范围，例如： return status >= 200 && status < 500;
      //     },
      //   }).then((response) => {
      //     // 调用返回的函数

      //     // 读取 UserapiRegisterWUserResp 返回结果
      //     const userResp = response.data
      //     if (response.status === 200) {
      //       if (!userResp.w_user) {
      //         if (userResp.w_user)
      //           userStore.updateWUserInfo(userResp.w_user)

      //         ms.success('成功')
      //       }
      //     }
      //     else {
      //       ms.error(`失败 ${userResp.msg}`)
      //     }

      //     // 处理返回的请求参
      //   }).catch((error) => {
      //     console.error(error)
      //     ms.error(`异常 ${error}`)
      //   })
      // }
      // catch (error) {
      //   // 处理错误
      //   console.error(error)
      //   ms.error(`异常 ${error}`)
      // }
      // finally {

      // }
    }

    return {

      headImg,
      handleClick() {
        numberAnimationInstRef.value?.play()
      },

      active: ref(false),

      userInfo,
      envInfo,
      loginItem,
      adminSettingShow,
      defaultAvatar,
      // navigateToEditorPage,
      activeTab: 'chap1',
      st,
      showLoginForm,
      isMobile,
      envStore,
      handleDoubleClick,
      showDev,
      showPay,
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'chap2')
        this.$store.dispatch('homeStore/setMyData', { act: 'gallery' })
    },
    'userInfo.isLogin': function (newValue, oldValue) {
      if (newValue !== oldValue) {
        // 当 userInfo.isLogin 变化时执行页面刷新操作
        location.reload()
      }
    },
  },
})
</script>

<template>
  <NGrid cols="24" y-gap="12" x-gap="12" item-responsive responsive="screen">
    <NGridItem span="24 m:24 l:24">
      <NCard>
        <NButton type="primary" @click="adminSettingShow.show = true">
          奖金池设置
        </NButton>
      </NCard>
    </NGridItem>
    <!-- <NGridItem span="24 m:24 l:10">
      <NCard
        :segmented="{ content: true, footer: true }" header-style="padding:10px;font-size:14px"
        footer-style="padding:10px" content-style="padding:10px; 0px"
      >
        <div>vip 等级 {{ userInfo.vip_level !== null && userInfo.vip_level !== undefined ? userInfo.vip_level : 0 }}</div>
        <div>金币数量: {{ userInfo.coins !== null && userInfo.coins !== undefined ? userInfo.coins : 0 }}</div>
        <NButton @click="showPay = true">
          充值
        </NButton>
      </NCard>
    </NGridItem> -->
    <!-- <NGridItem span="24 m:24 l:10">
      <NCard
        :segmented="{ content: true, footer: true }" header-style="padding:10px;font-size:14px"
        footer-style="padding:10px" content-style="padding:10px;"
      >
        <template #header>
          信息
        </template>
        <NTable size="small" bordered :single-line="false">
          <tbody>
            <tr>
              <td />
              <td>token使用</td>
              <td>对话量</td>
              <td>绘画量</td>
            </tr>
            <tr>
              <td>今天使用</td>
              <td>100</td>
              <td>10</td>
              <td>1</td>
            </tr>
            <tr>
              <td>本周使用</td>
              <td>200</td>
              <td>30</td>
              <td>10</td>
            </tr>
            <tr>
              <td>本月使用</td>
              <td>1000</td>
              <td>300</td>
              <td>100</td>
            </tr>
            <tr>
              <td colspan="4">
                <NSpace align="center" justify="space-between">
                  <span>开始使用吧</span>
                  <NButtonGroup>
                    <NButton type="primary" @click="navigateToEditorPage">
                      聊天
                    </NButton>
                  </NButtonGroup>
                </NSpace>
              </td>
            </tr>
          </tbody>
        </NTable>
      </NCard>
    </NGridItem> -->
    <NGridItem span="24 m:24 l:24">
      <NCard
        :segmented="{ content: true, footer: true }" header-style="padding:10px;font-size:14px"
        footer-style="padding:10px" content-style="padding:10px; 0px"
      >
        <template #header>
          <NText style="text-align: center">
            我的
          </NText>
        </template>
        <!-- <NH3 style="text-align: center">
         我的
        </NH3> -->
        <NTabs v-model="activeTab" type="line" animated>
          <NTabPane name="chap1" tab="我的文章">
            <div style="height: 80vh;">
             
            </div>
          </NTabPane>
        </NTabs>
      </NCard>
    </NGridItem>
  </NGrid>
  <Setting v-if="st.show" v-model:visible="st.show" />
  <AdminSetting v-if="adminSettingShow.show" v-model:visible="adminSettingShow.show" />
  <Pay v-if="showPay" v-model:visible="showPay" />
</template>

<style lang="less" scoped>
.home-head {
  display: flex;
  align-items: center;
  height: 100%;

  .title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 5px;
  }

  .des {}
}

.icon {
  text-align: center;
  background-color: var(--n-border-color);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  justify-content: center;
  width: 80px;
  height: 60px;
  border-radius: 10px;
  cursor: pointer;
}

.carousel-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.custom-arrow {
  display: flex;
  position: absolute;
  bottom: 25px;
  right: 10px;
}

.custom-arrow button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 12px;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border-width: 0;
  border-radius: 8px;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-arrow button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-arrow button:active {
  transform: scale(0.95);
  transform-origin: center;
}

.custom-dots {
  display: flex;
  margin: 0;
  padding: 0;
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.custom-dots li {
  display: inline-block;
  width: 12px;
  height: 4px;
  margin: 0 3px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.4);
  transition: width 0.3s, background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-dots li.is-active {
  width: 40px;
  background: #fff;
}
</style>
