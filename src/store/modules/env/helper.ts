const LOCAL_NAME = 'envStorage'

export interface EnvInfo {
  env: string
  // 根据fingerprintjs2 生成的id

  app_id: string
  version_code: string
  env_debug_log: string
  log_event_level: string
  is_use_sse: Boolean
}

export interface EnvState {

  envInfo: EnvInfo
}

export function defaultSetting(): EnvState {
  return {

    envInfo: {
      env: 'prod',

      Idfa: '',
      platform: '',
      user_agent: '',
      client_agent: '',
      app_id: '',
      log_event_level: '',
      is_use_sse: true,
    },
  }
}

export function getLocalState(): EnvState {
  return { ...defaultSetting() }
}
