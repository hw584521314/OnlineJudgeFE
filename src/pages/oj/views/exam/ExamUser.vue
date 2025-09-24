<template> 
  <div>
    <!-- 该页面显示用户所有的历史考试列表 -->
    
    <Panel>
        <div slot="title">参加的考试</div>

    <Table stripe :disabled-hover="true" :columns="columns" :data="exam_list"></Table>
        <Pagination :total="total" :page-size="limit" @on-change="changeRoute" :current.sync="page"></Pagination>
    </Panel>
  </div>
</template>
<script>

import api from '../../api.js'
import utils from '@/utils/utils.js'
  import Pagination from '@/pages/oj/components/Pagination'

export default {
  name: 'ExamUser',
  components: {
    Pagination
  },
  data () {
    return {
        exam_list: [],
        columns: [
                {
                    title: '成绩ID',
                    key: 'id',
                    width: 80,
                    render: (h, params) => {
                        return h('span', params.row.id)
                        }
                    },
                {
                    title: '考试名称',
                    key: 'exam_title',
                    render: (h, params) => {
                        return h('span', params.row.exam_title)
                        }
                    },
                {
                    title: '开始时间',
                    key: 'start_time',
                    render: (h, params) => {
                        return h('span', params.row.start_time)
                    }
                },
                {
                    title: '结束时间',
                    key: 'end_time',
                    render: (h, params) => {
                        return h('span', params.row.end_time)
                    }
                },
                {
                    title: '最后提交时间',
                    key: 'update_time',
                    render: (h, params) => {
                        return h('span', params.row.update_time)
                    }
                },
                {
                    title: '我的分数',
                    key: 'total_score',
                    render: (h, params) => {
                        const score = params.row.total_score;
                        const color = score >= 60 ? 'green' : 'red';
                        return h('span', {
                            style: {
                                color: color
                            }
                        }, score);
                    }
                }
                ],
        page: 1,
        limit: 10,
        total: 0,
    }
  },
  methods: {
    getUserExamResultList () {
      api.getUserExamResultList(  {
          page: this.page,
          limit: this.limit,
        }
      ).then((res) => {
        this.exam_list = res.data.data.data;
        this.total = res.data.data.total
      })
    },
    changeRoute (page) {
      this.page = page
      this.getUserExamResultList()
    }
  },
  mounted () {
    this.getUserExamResultList()
  },

}
</script>
<style scoped>
</style>