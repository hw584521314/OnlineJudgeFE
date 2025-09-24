import moment from 'moment'
import types from '../types'
import api from '@oj/api'
import { EXAM_STATUS, USER_TYPE } from '@/utils/constants'

const state = {
  now: moment(),
  examAccess: false,
  
  exam: {},
  examDetailID: 0,
  examProblems: [],
  examSubMenuVisible: true,
}

const getters = {
  // exam 是否加载完成
  examLoaded: (state) => {
    return !!state.exam.status
  },
  examStatus: (state, getters) => {
    if (!getters.examLoaded) return EXAM_STATUS.NOT_START
    let startTime = moment(state.exam.start_time)
    let endTime = moment(state.exam.end_time)


    if (state.exam.status==0) {
      return EXAM_STATUS.NOT_START
    } else if (state.exam.status==2) {
      return EXAM_STATUS.ENDED
    } else {
      return EXAM_STATUS.UNDERWAY
    }
  },
 
  examProblemSubmitDisabled: (state, getters, _, rootGetters) => {
    if (getters.examStatus === EXAM_STATUS.ENDED ) {
      return true
    } else if (getters.examStatus === EXAM_STATUS.NOT_START) {
      return true
    }
    return false
  },

  examStartTime: (state) => {
    return moment(state.exam.start_time)
  },
  examEndTime: (state) => {
    return moment(state.exam.end_time)
  },
  // countdown: (state, getters) => {
  //   if (getters.contestStatus === CONTEST_STATUS.NOT_START) {
  //     let duration = moment.duration(getters.contestStartTime.diff(state.now, 'seconds'), 'seconds')
  //     // time is too long
  //     if (duration.weeks() > 0) {
  //       return 'Start At ' + duration.humanize()
  //     }
  //     let texts = [Math.floor(duration.asHours()), duration.minutes(), duration.seconds()]
  //     return '-' + texts.join(':')
  //   } else if (getters.contestStatus === CONTEST_STATUS.UNDERWAY) {
  //     let duration = moment.duration(getters.contestEndTime.diff(state.now, 'seconds'), 'seconds')
  //     let texts = [Math.floor(duration.asHours()), duration.minutes(), duration.seconds()]
  //     return '-' + texts.join(':')
  //   } else {
  //     return 'Ended'
  //   }
  // }
}

const mutations = {
  [types.CHANGE_EXAM] (state, payload) {
    state.exam = payload.exam
  },
  [types.CHANGE_EXAM_PROBLEMS] (state, payload) {
    //[{"problem":problem,score:20},{}] 这里需要对problem对象展开
    state.examProblems = payload.examProblems.map(item => {
      return { ...item.problem, score: item.score }
    })
    //state.examProblems = payload.examProblems
  },
  [types.CHANGE_EXAM_DETAIL_ID] (state, payload) {
    state.examDetailID = payload.examDetailID
  },
  [types.EXAM_SUBMENU_VISIBLE] (state, payload) {
    state.examSubMenuVisible=payload.visible
  },
  [types.EXAM_ACCESS] (state, payload) {
    state.examAccess = payload.access
  },
  [types.CLEAR_EXAM] (state) {
    state.exam = {created_by: {}}
    state.examProblems = []
    state.examAccess = false
    state.examItemVisible = {
      menu: true,
      chart: true,
      realName: false
    }

  },
  [types.NOW] (state, payload) {
    state.now = payload.now
  },

}

const actions = {
  getExam ({commit, rootState, dispatch}) {
    return new Promise((resolve, reject) => {
      api.getExam({id:rootState.route.params.examID}).then((res) => {
        resolve(res)
        //console.log(res.data.data)
        let exam = res.data.data.data
        let server_time=res.data.data.server_time
        commit(types.CHANGE_EXAM, {exam: exam})
        commit(types.NOW, {now: moment(server_time)})
        // if (exam.contest_type === CONTEST_TYPE.PRIVATE) {
        //   dispatch('getEXAMAccess')
        // }
      }, err => {
        reject(err)
      })
    })
  },
  getExamProblems ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getExamProblemList({id:rootState.route.params.examID}).then(res => {        
        commit(types.CHANGE_EXAM_DETAIL_ID, {examDetailID: res.data.data.id})
        commit(types.CHANGE_EXAM_PROBLEMS, {examProblems: res.data.data.problems})
        resolve(res)
      }, () => {
        commit(types.CHANGE_EXAM_DETAIL_ID, {examDetailID: null})
        commit(types.CHANGE_EXAM_PROBLEMS, {examProblems: []})
      })
    })
  },
  getExamAccess ({commit, rootState}) {
    return new Promise((resolve, reject) => {
      api.getExamAccess(rootState.route.params.examID).then(res => {
        commit(types.EXAM_ACCESS, {access: res.data.data.access})
        resolve(res)
      }).catch()
    })
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
