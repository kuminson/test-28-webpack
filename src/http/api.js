import action from './axios'
import {CancelHttp} from './utils'

const cancelHttp = new CancelHttp()


export default {
  testBaidu (data, config) { const http = action.commonPost('/api/json/data', data, config); http.mySourceKey = cancelHttp.add('testBaidu', http.mySource); return http }
}
