<template>
  <div>
    <Panel>
      <div slot="title">我的分数：<span class="my-score">{{ total_score }}</span> </div>

      <div slot="extra">
        更新时间:{{ update_time }}
      </div>
      <Table 
             :data="submissions"
             :columns="TableColumns"
             @on-row-click="goExamProblem"
             no-data-text="还未有任何提交"></Table>
    </Panel>
  </div>
</template>


<script>
  import api from '@oj/api'
  import {mapState, mapGetters} from 'vuex'
  import {ProblemMixin} from '@oj/components/mixins'

  export default {
    name: 'ExamResult',
    mixins: [ProblemMixin],
    data () {
      return {
        submissions:[],
        total_score:0,
        update_time:"",
        TableColumns: [
          {
            title: 'id',
            key: 'problem_id',
            width: 50
          },
          {
            title: "题目名称",
            render: (h, params) => {
              return h('span',
                {
                  style: {
                    color: '#57a3f3',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      if(this.examID)
                      {
                        this.$router.push(
                          {
                            name: 'exam-problem-details',
                            params: {problemID: params.row.problem_id, examID: this.examID}
                          })
                      } 
                      else {
                        this.$router.push({name: 'problem-details', params: {problemID: params.row.problem}})
                      }
                    }
                  }
                },
                params.row.name)
            }
          },
          {
            title: "题目满分",
            key: 'problem_score'
          },
          {
            title: "提交最高分",
            key: 'max_score'
          },
          {
            title: "试卷配置分",
            key: 'exam_config_score'
          },
          {
            title: "提交后折算分",
            key: 'sub_score'
          }
        ]
      }
    },
    mounted () {
      if(!this.examID)
    {
        let examID = this.$route.params.examID;
        //this.$store.dispatch('getExam');
    }
      
      
      this.getMyScore()
    },
    methods: {
      getMyScore()
      {
        //获取当前用户的分数
        api.getMyScore(this.examID,this.examDetailID).then(res => {
          if(res.data.data.answers==null)
          {
              this.submissions=[]
              this.total_score=0;
              this.update_time="";
              return;
          }
          this.submissions = res.data.data.answers
          
          this.total_score=res.data.data.total_score;
          this.update_time=res.data.data.update_time;
        }).catch(err => {
          this.$Message.error(err.data.data);
        })
      },
      goExamProblem (row) {
        this.$router.push({
          name: 'exam-problem-details',
          params: {
            examID: this.$route.params.examID,
            problemID: row.id
          }
        })
      }
    },
    computed: {
      ...mapState({
        examID: state => state.exam.exam.id,
        examDetailID: state => state.exam.examDetailID
      }),
      ...mapGetters([])
    }
  }
</script>

<style scoped lang="less">
.my-score {
    
    color:red
}
</style>