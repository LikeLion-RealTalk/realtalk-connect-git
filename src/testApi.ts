// src/testApi.ts
import apiClient from './lib/apiClient'

async function testApiCall() {
  try {
    // const response = await apiClient.get('/actuator/health')

    // JSONPlaceholder 테스트 엔드포인트
    const response = await apiClient.get("/todos/1");
    console.log('✅ API 호출 성공:', response.data)
  } catch (error) {
    console.error('❌ API 호출 실패:', error)
  }
}

testApiCall()
