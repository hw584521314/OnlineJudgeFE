<template>
  <Panel :title="this.$i18n.t('m.Exam_List')">
  <div slot="header">
    <el-input
      v-model="keyword"
      prefix-icon="el-icon-search"
      placeholder="Keywords">
      <template #append>
        <el-button type="primary" size="small" @click="getExamList">搜索</el-button>
        <el-button type="primary" size="small" @click="resetSearch">重置</el-button>
      </template>
    </el-input>
  </div>
  <el-button type="primary" size="small"
                   @click="createExam" icon="el-icon-plus">Create
  </el-button>
  <el-table
    border
    v-loading="loading"
    element-loading-text="loading"
    ref="table"
    :data="examList"
    @row-dblclick="handleDblclick"
    style="width: 100%">
      <el-table-column
        width="50"
        prop="id"
        label="ID">
      </el-table-column>
      <el-table-column
        width="160"        
        label="开始时间">
        <template slot-scope="{row}">
          {{row.start_time | localtime }}
        </template>
      </el-table-column>
      <el-table-column
        width="160"
        label="结束时间">
        <template slot-scope="{row}">
          {{row.end_time | localtime }}
        </template>
      </el-table-column>
      <el-table-column
      width="250"
      prop="title"
      
      label="考试名称">
      </el-table-column>
      <el-table-column
      width="80"
      
      label="是否启用">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.enable"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="updateExam(scope.row)">
          </el-switch>

        </template>
      </el-table-column>
      <el-table-column
      width="80"
      prop="create_user.username"
      label="创建人">
      </el-table-column>
      <el-table-column
          fixed="right"
          min-width="220"
          label="操作">
          <template slot-scope="{row}">
            <el-button size="mini" @click="rowEdit(row)">
              <i  class="el-icon-edit"></i> 编辑
            </el-button>
            <el-button size="mini" @click="rowDelete(row)">
              <i  class="el-icon-delete"></i>删除
            </el-button>
            <el-button size="mini" @click="rowConfig(row,'A')">
              <i  class="el-icon-setting"></i>A卷绑定
            </el-button>
            <el-button size="mini" @click="rowConfig(row,'B')">
              <i  class="el-icon-setting"></i>B卷绑定
            </el-button>
            <el-button size="mini" @click="rowExport(row)">
              <i  class="el-icon-download"></i>导出成绩
            </el-button>
          </template>
        </el-table-column>
    </el-table>
    <el-pagination
          class="page"
          background
          layout="total, sizes,prev, pager, next"
          @current-change="currentChange"
          @size-change="pageSize = $event; getExamList(1)"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total">
    </el-pagination>
    <el-dialog :visible.sync="examInfoShow" v-if="examInfoShow">
      <Exam :exam="examInfo" @close="examInfoClose">

      </Exam>
    </el-dialog>
    <el-dialog :visible.sync="examDetailInfoShow" v-if="examDetailInfoShow">
      <ExamDetailInfoDialog :examInfo="examInfo" :category="category" @close="examDetailInfoShow=false">

      </ExamDetailInfoDialog>
    </el-dialog>
  </Panel>

  
</template>

<script>
import api from '../../api.js'
import utils from '@/utils/utils.js'
import Exam from './Exam.vue'
import ExamDetailInfoDialog from './ExamDetailInfoDialog.vue'
export default {
  name: 'ExamList',
  components: {
    Exam,
    ExamDetailInfoDialog
  },
  data () {
    return {
      pageSize: 10,
      total: 0,
      examList: [],
      keyword: '',
      loading: false,
      currentPage: 1,
      routeName: '',

      examInfo:{},
      category: '',
      examInfoShow: false,

      examDetailInfoShow: false,
    }
  },
  mounted () {
    this.routeName = this.$route.name    
    this.getExamList(this.currentPage)
  },
  methods: {
    createExam () {      
        this.$router.push({name: 'exam-create'});      
    },
    // 切换页码回调
    currentChange (page) {
      this.currentPage = page
      this.getExamList(page)
    },
    resetSearch() {
            this.keyword = "";
            this.getExamDetailList(1);
        },
    getExamList (page = 1) {
      this.loading = true;      
      let params= {page_idx:page, nums_per_page: this.pageSize,keyword:this.keyword};
      api["getExamList"](params).then(res => {
        if (res.data.error ==null) {
          //console.log(res.data)
          this.examList = res.data.data
          this.total = res.data.data.length
        } else {
          utils.showError(res.data.data)
        }
        this.loading = false
      }).catch(err => {
        utils.showError(err)
        this.loading = false
      })
    },
    handleDblclick (row) {
      row.isEditing = true
    },
    rowEdit (row) {
      //this.$router.push({name: 'exam-edit', params: {examId: row.id}})
      api["getExamInfo"]({id:row.id}).then(res => {
        if (res.data.error == null) {
          const examData = res.data.data;
          // Remove timezone offset before binding
          examData.start_time = examData.start_time.slice(0, 16);
          examData.end_time = examData.end_time.slice(0, 16);
          this.examInfo = examData;          
          this.examInfoShow = true;
        } else {
          this.$message.error('考试信息获取失败')
        }
      }).catch(err => {
        this.$message.error('考试信息获取过程中出现错误：' + err.message)
      })
    },
    examInfoClose () {
      this.examInfoShow = false;
      this.examInfo = {};
      this.getExamList();
    },
    rowDelete (row) {
      this.$confirm('是否删除该考试？', '提示', {
        type: 'warning'
      }).then(() => {
        console.log(row)
        api["deleteExam"]({id:row.id}).then(res => {
          if (res.data.error == null) {
            this.$message.success('考试删除成功')
            this.getExamList(this.currentPage)
          } else {
            this.$message.error('考试删除失败')
          }
        }).catch(err => {
          this.$message.error('考试删除过程中出现错误：' + err.message)
        })
      }).catch(() => {})
    },
    rowConfig (row,category) {
      //以Dialog方式打开ExamDetailInfoDialog组件，并传入row数据，以获取对应试卷信息页面
      this.examInfo = row;
      this.category = category;
      this.examDetailInfoShow = true;
    },
    rowExport(row){
      //导出成绩
      api["exportExamResult"]({exam_id:row.id}).then(res => {
        const url=res.data.data.url;
      //下载返回的url中的文件      
      utils.downloadFile(url)
      this.$message.success(res.data.data.message)
        
      }).catch(err => {
        this.$message.error('导出过程中出现错误：' + err.message)
      })
    },
    currentChange (page) {
      this.currentPage = page
      this.getExamList(page)
    },
    updateExam (row) {
      api["updateExam"](row).then(res => {
        if (res.data.error == null) {
          this.$message.success('考试更新成功')
        } else {
          this.$message.error('考试更新失败')
        }
      }).catch(err => {
        this.$message.error('考试更新过程中出现错误：' + err.message)
      })
    },
    
  }
}
  
</script>

<style scoped >
</style>