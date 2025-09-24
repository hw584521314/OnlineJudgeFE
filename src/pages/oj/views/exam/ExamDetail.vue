<template>
<div class="flex-container" >
    <div id="contest-main">
      <!--children-->
      <transition name="fadeInUp">
        <router-view></router-view>
      </transition>
      <!--children end-->
      <div >
        <template v-if="route_name==='exam-detail'">
          <div id="contest-desc">
            <Panel :padding="20" shadow>
              <div slot="title"> 
              考试公告               
              </div>
              
              <div v-html="exam.desc" class="markdown-body"></div>
              <div>
                

              </div>
            </Panel>
            
          </div>
        </template>
      </div>

    </div>
    <div  id="contest-menu" >
      
    <VerticalMenu @on-click="handleRoute">
          
        <VerticalMenu-item 
                           :route="{name: 'exam-problem-list', params: {examID: examID}}">
          <Icon type="ios-photos"></Icon>
          题目列表
        </VerticalMenu-item>

        <VerticalMenu-item 
                           :route="{name: 'exam-submission-list'}">
          <Icon type="navicon-round"></Icon>
          提交历史
        </VerticalMenu-item>
        <VerticalMenu-item v-if="myScoreVisible" :route="{name: 'exam-result', params: {examID: examID}}">
            <Icon type="home"></Icon>
            我的分数
        </VerticalMenu-item>

    </VerticalMenu>
    </div>
</div>
</template>

<script> 
  import {mapState, mapGetters} from 'vuex'
  import time from '@/utils/time'
  import api from '@oj/api'
  import moment from 'moment'
  import types from '@/store/types'
  
  export default {
    name: 'ExamDetail',
    components: {},
    data () {
      return {
        route_name:"",
        examID:0,
        submissions:[]
      }
    },
    mounted () {
      this.examID = this.$route.params.examID
      this.route_name = this.$route.name
      //this.$store.commit(types.EXAM_SUBMENU_VISIBLE,{visible:true})
      this.$store.dispatch('getExam').then(res => {
        
      }).catch(err => {
        this.$router.replace({name: 'exam-home'})
        this.$Message.error(err.data.data);
        
      })
    },
    computed: {
      myScoreVisible() { 
        return this.$route.name !=="exam-detail"
      },
      ...mapState({        
        exam: state => state.exam.exam,        
        now: state => state.now,
        //examSubMenuVisible:state=>state.exam.examSubMenuVisible,
      }),
      ...mapGetters(
        [ ]
      ),
    },
    methods: { 
      handleRoute (route) {
        this.$router.push(route)
      },
      
    },
    watch: {
      '$route' (newVal) {
        this.route_name = newVal.name
        this.examID = newVal.params.examID

      }
    },
}
</script>


<style scoped lang="less">
  pre {
    display: inline-block;
  }

  #countdown {
    font-size: 16px;
  }

  .flex-container {
    #contest-main {
      flex: 1 1;
      width: 0;
      #contest-desc {
        flex: auto;
      }
    }
    #contest-menu {
      flex: none;
      width: 210px;
      margin-left: 20px;
    }
    .contest-password {
      margin-top: 20px;
      margin-bottom: -10px;
      &-input {
        width: 200px;
        margin-right: 10px;
      }
    }
  }
</style>
