import CryptoJS from 'crypto-js'
export default function encryptString(password: string) {
  const p = CryptoJS.SHA256(password).toString()
  //   console.log('p', password, p)
  return p
}

// 示例用法
