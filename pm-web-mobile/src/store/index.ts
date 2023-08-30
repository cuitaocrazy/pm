import { createStore } from 'vuex';

export default createStore({
  state: {
    status: [],
    industries: [],
    regions: [],
    currentUser: {}
  },
  getters: {},
  mutations: {
    setCurrentUser (state, value) {
      state.currentUser = value
    },
    setInintState (state, value) {
      state.status = value.status
      localStorage.setItem('status', JSON.stringify(value.status))
      state.regions = value.regions
      localStorage.setItem('regions', JSON.stringify(value.regions))
      state.industries = value.industries
      localStorage.setItem('industries', JSON.stringify(value.industries))
    }
  },
  actions: {},
  modules: {},
});
