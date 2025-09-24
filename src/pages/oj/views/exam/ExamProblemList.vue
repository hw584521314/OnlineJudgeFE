<template>
  <div>
    <Panel class="content">
      <div slot="title">题目列表</div>
      
        
        <Table
              :data="problems"
              :columns="TableColumns"
              
              @on-row-click="goExamProblem"
              no-data-text="$t('m.No_Problems')"></Table>
      
    </Panel>
  </div>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'
  import {ProblemMixin} from '@oj/components/mixins'

  export default {
    name: 'ExamProblemList',
    mixins: [ProblemMixin],
    data () {
      return {
        
        TableColumns: [
          
          {
            title: "题目名称",
            render: (h, params) => {
              return h('span',
                {
                  style: {
                    color: '#57a3f3',
                    cursor: 'pointer'
                  },
                },
                  params.row.title)
              }
          },
          {
            title: "考试分值",
            key: 'score'
          }
        ]
      }
    },
    mounted () {
      this.getExamProblems()
    },
    methods: {

      getExamProblems () {
        this.$store.dispatch('getExamProblems').then(res => {
        //   if (this.isAuthenticated) {
        //     if (this.contestRuleType === 'ACM') {
        //       this.addStatusColumn(this.ACMTableColumns, res.data.data)
        //     } else if (this.OIContestRealTimePermission) {
        //       this.addStatusColumn(this.ACMTableColumns, res.data.data)
        //     }
        //   }
        //console.log(this.problems)
        //console.log(this.$store.state.exam.examDetailID)
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
        problems: state => state.exam.examProblems,
        
      }),
      ...mapGetters([])
    }
  }
</script>

<style scoped >
.content {
  padding: 20px;
}

</style>
