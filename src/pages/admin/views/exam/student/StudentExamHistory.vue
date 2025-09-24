<template> 
  <div>
    <!-- 该页面显示用户所有的历史考试列表 -->
    <Panel title="考试历史">
      <div slot="header">    
        <div></div>
      </div>
    <el-table  :data="exam_list">
        <el-table-column
        width="80"
        prop="id"
        label="成绩ID">
      </el-table-column>
      <el-table-column
        width="200"
        prop="exam_title"
        label="考试名称">
      </el-table-column>
        <el-table-column
            width="180"
            
            label="开始时间">
            <template slot-scope="scope">
                {{ scope.row.start_time  }}
            </template>
        </el-table-column>
        <el-table-column
            width="180"
            
            label="结束时间">
            <template slot-scope="scope">
                {{ scope.row.end_time  }}
            </template>
        </el-table-column>
        <el-table-column
            width="180"
            
            label="最后提交时间">
            <template slot-scope="scope">
                {{ scope.row.update_time }}
            </template>
        </el-table-column>
        <el-table-column                       
            label="分数">
            <template slot-scope="scope">
                {{ scope.row.total_score }}
            </template>
        </el-table-column>
    </el-table>
        
    <el-pagination
          class="page"
          background
          layout="total, sizes,prev, pager, next"
          @current-change="currentChange"
          @size-change="handleSizeChange"
          :page-size="limit"
          :page-sizes="[10, 20, 50]"
          :total="total">
    </el-pagination>

    </Panel>
  </div>
  
</template>
<script>

import api from '../../../api.js'


export default {
  name: 'StudentExamHistory',

  data () {
    return {
        exam_list: [],
        student_id: 0,
        page: 1,
        limit: 10,
        total: 0,
    }
  },
  methods: {
    getUserExamResultList () {
      api.getStudentExamResultList(  {
          student_id: this.student_id,
          page: this.page,
          limit: this.limit,
        }
      ).then((res) => {
        this.exam_list = res.data.data.data;
        this.total = res.data.data.total
      })
    },
    handleSizeChange (val) {
      this.limit = val
      this.getUserExamResultList()
    },
    currentChange (page) {
      this.page = page
      this.getUserExamResultList()
    }
  },
  mounted () {
    this.student_id = this.$route.params.studentId
    this.getUserExamResultList()
  },

}
</script>


<style scoped>
</style>