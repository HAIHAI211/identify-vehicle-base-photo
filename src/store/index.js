import Vue from 'vue'
import Vuex from 'vuex'
import api from '../api'
import {save, read} from '../utils/storage'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    tempPreviewImgSrc: '',
    accessToken: '',
    expiresIn: 0
  },
  mutations: {
    SET_TEMP_PREVIEW_IMG_SRC: (state, payload) => {
      state.tempPreviewImgSrc = payload
      console.log('state.tempPreviewImgSrc', state.tempPreviewImgSrc)
    },
    SET_ACCESS_TOKEN: (state, payload) => {
      state.accessToken = payload
    },
    SET_EXPIRES_IN: (state, payload) => {
      state.expiresIn = payload
    }
  },
  actions: {
    async getToken ({ commit }) {
      const ei = read('SET_EXPIRES_IN')
      const at = read('SET_ACCESS_TOKEN')
      const nowSeconds = Date.now() / 1000
      if (ei && at && nowSeconds < ei) { // 如果ei和at有值，并且还在有效期之内
        console.log('storage的token有值且未失效', at)
        commit('SET_ACCESS_TOKEN', at)
        commit('SET_EXPIRES_IN', ei)
        return at
      }
      const data = await api.getToken()
      console.log('token data', data)
      const expiresIn = data.expires_in + nowSeconds
      const accessToken = data.access_token
      commit('SET_ACCESS_TOKEN', accessToken)
      save('SET_ACCESS_TOKEN', accessToken)
      commit('SET_EXPIRES_IN', expiresIn)
      save('SET_EXPIRES_IN', expiresIn)
      console.log('请求百度api获取token', accessToken)
      return accessToken
    }
  }
})

export default store
