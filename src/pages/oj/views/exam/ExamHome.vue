<template>
  <Row type="flex">
    <Col :span="24">
    <Panel id="contest-card" shadow>
      <div slot="title">最近考试列表</div>
      
      <p id="no-contest" v-if="exams.length == 0">没有考试</p>
      <ol id="contest-list">
        <li v-for="exam in exams" :key="exam.title">
          <Row type="flex" justify="space-between" align="middle">
            <img class="trophy" src="../../../../assets/Cup.png"/>
            <Col :span="18" class="contest-main">
            <p class="title">
              <a class="entry" @click.stop="goExam(exam)">
                {{exam.title}}
              </a>
            </p>
            <ul class="detail">
              <li>
                <Icon type="calendar" color="#3091f2"></Icon>
                {{exam.start_time  }}
              </li>
              <li>
                <Icon type="calendar" color="#3091f2"></Icon>
                {{exam.end_time  }}
              </li>
              <li>
                <Icon type="android-time" color="#3091f2"></Icon>
                {{getDuration(exam.start_time, exam.end_time)}}
              </li>
              
            </ul>
            </Col>
            <Col :span="4" style="text-align: center">
            <Button v-if="exam.status==0" type="warning" disabled>还未开始</Button>
            <Button v-else-if="exam.status==1" type="primary" @click="goExam(exam)">进入考试</Button>
            <Button v-else type="warning" disabled>已结束</Button>
            </Col>
          </Row>
        </li>
      </ol>
    </Panel>
    <Pagination :total="total" :page-size.sync="limit" @on-change="getExamList" :current.sync="page" :show-sizer="true" @on-page-size-change="getExamList"></Pagination>
    </Col>
  </Row>

</template>

<script>
  import api from '@oj/api'
  import { mapGetters } from 'vuex'
  import utils from '@/utils/utils'
  import Pagination from '@/pages/oj/components/Pagination'
  import time from '@/utils/time'
import { Button } from 'element-ui'
 

  const limit = 10

  export default {
    name: 'exam-home',
    components: {
      Pagination
    },
    data () {
      return {
        page: 1,
        query: {
          status: '',
          keyword: '',
          rule_type: ''
        },
        limit: limit,
        total: 0,
        rows: '',
        exams: [],

//      for password modal use
        cur_exam_id: ''
      }
    },
    mounted () {      
      this.getExamList()      
      },
    
    methods: {

      getExamList (page = 1) {
        const params=this.query;
        params.page=page;
        params.limit=this.limit;
        
        api.getExamList(params).then((res) => {
          this.exams = res.data.data.data
          this.total = res.data.data.total;
          //console.log(this.exams);
          //console.log(this.total)
        })
      },
      
      goExam (exam) {
        this.cur_exam_id = exam.id
        if (!this.isAuthenticated) {
          this.$error(this.$i18n.t('m.Please_login_first'))
          this.$store.dispatch('changeModalStatus', {visible: true})
        } else {
          this.$router.push({name: 'exam-detail', params: {examID: exam.id}})
        }
      },

      getDuration (startTime, endTime) {
        return time.duration(startTime, endTime)
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'user'])
    },


  }
</script>
<style lang="less" scoped>
  #contest-card {
    #keyword {
      width: 80%;
      margin-right: 30px;
    }
    #no-contest {
      text-align: center;
      font-size: 16px;
      padding: 20px;
    }
    #contest-list {
      > li {
        padding: 20px;
        border-bottom: 1px solid rgba(187, 187, 187, 0.5);
        list-style: none;

        .trophy {
          height: 40px;
          margin-left: 10px;
          margin-right: -20px;
        }
        .contest-main {
          .title {
            font-size: 18px;
            a.entry {
              color: #495060;
              &:hover {
                color: #2d8cf0;
                border-bottom: 1px solid #2d8cf0;
              }
            }
          }
          li {
            display: inline-block;
            padding: 10px 0 0 10px;
            &:first-child {
              padding: 10px 0 0 0;
            }
          }
        }
      }
    }
  }
</style>
