<template>
  <Panel title="学生管理">
  <div slot="header">
    
    <el-input
      v-model="keyword"
      prefix-icon="el-icon-search"
      placeholder="学号">
      <template #append>
        <el-button type="primary" size="small"
                   @click="getStudentList" >过滤
        </el-button>
        <el-button type="primary" size="small"
                   @click="resetSearch" >重置
        </el-button>
      </template>
    </el-input>
    
  </div>
  <el-button type="primary" size="small"
                   @click="createStudent" icon="el-icon-plus">Create
  </el-button>
  <el-button type="primary" size="small"
                   @click="importStudent" icon="el-icon-plus">Import
  </el-button>
  <el-table
    v-loading="loading"
    element-loading-text="loading"
    ref="table"
    :data="studentList"
    @row-dblclick="handleDblclick"
    style="width: 100%">
      <el-table-column
        width="50"
        prop="id"
        label="ID">
      </el-table-column>
      <el-table-column
             
        label="学号"
        prop="sid">        
      </el-table-column>

      <el-table-column
              
        label="姓名"
        prop="name">        
      </el-table-column>



      <el-table-column
        width="200"        
        label="学院"
        prop="sub_college">
      </el-table-column>
      <el-table-column
        width="200"        
        label="专业"
        prop="profession">
      </el-table-column>

      <el-table-column
              
        label="班级"
        prop="s_class">
      </el-table-column>

      <el-table-column
            
      label="是否启用">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.enable"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="updateStudent(scope.row)">
          </el-switch>
        </template>
      </el-table-column>

      <el-table-column
          width="250"  
          label="操作">
          <template slot-scope="{row}">
            <el-button size="mini" @click="rowEdit(row)">
              <i  class="el-icon-edit"></i> 
            </el-button>
            <el-button size="mini" @click="rowDelete(row)">
              <i  class="el-icon-delete"></i>
            </el-button>
            <el-button size="mini" @click="rowResetPassword(row)">
              <i  class="el-icon-setting"></i>重置密码
            </el-button>
            
          </template>
        </el-table-column>
    </el-table>
    <el-pagination
          class="page"
          background
          layout="total, sizes,prev, pager, next"
          @current-change="currentChange"
          @size-change="handleSizeChange"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total">
    </el-pagination>

    <el-dialog :visible.sync="studentDetailInfoShow" v-if="studentDetailInfoShow">
      <StudentDetailInfoDialog :student="studentInfo"  @close="studentDetailInfoShow=false">

      </StudentDetailInfoDialog>
    </el-dialog>


    <el-dialog :visible.sync="studentImportShow" v-if="studentImportShow">
      <a href="/public/download/template/学生信息导入模板.xlsx">学生信息导入模板</a>
      <el-upload
        class="upload-student"
        drag
        action="/api/admin/student/import"
        :show-file-list="true"
        :on-success="uploadSucceeded"
        accept=".xlsx"
        :auto-upload="false"
        name="file"
        ref="upload"
        >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        
      </el-upload>
          <el-button class="ml-3" type="success" @click="submitUpload">
              上传到服务器
          </el-button>
          <el-button class="ml-3" type="danger" @click="studentImportShow=false">
                  关闭
          </el-button>
      </el-dialog>

  </Panel>

  
</template>

<script>
import api from '../../../api.js'
import utils from '@/utils/utils.js'
import StudentDetailInfoDialog from './StudentDetailInfoDialog.vue'

export default {
  name: 'StudentList',
  components: {
    StudentDetailInfoDialog
  },
  data () {
    return {
      pageSize: 10,
      total: 0,
      studentList: [],
      keyword: '',
      loading: false,
      currentPage: 1,
      routeName: '',

      studentInfo:{},
      studentDetailInfoShow: false,
      studentImportShow:false,
    }
  },
  mounted () {
    this.routeName = this.$route.name    
    this.getStudentList(this.currentPage)
  },
  methods: {
    createStudent () {      
        this.$router.push({name: 'student-create'});      
    },

    // 切换页码回调
    currentChange (page) {
      this.currentPage = page
      this.getStudentList(page)
    },
    handleSizeChange(size) {
      this.pageSize = size;
      this.getStudentList(1);
    },
    getStudentList (page = 1) {
      this.loading = true;      
      let params= {page_idx:page, nums_per_page: this.pageSize,keyword:this.keyword};
      api["getStudentList"](params).then(res => {
        if (res.data.error ==null) {
          //console.log(res.data.data)
          this.studentList = res.data.data.data
          this.total = res.data.data.total
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
    resetSearch(){
      this.keyword = '';
      this.getStudentList(1);
    },
    rowEdit (row) {
      //this.$router.push({name: 'exam-edit', params: {examId: row.id}})
      api["getStudentInfo"]({id:row.id}).then(res => {
        if (res.data.error == null) {
          const studentData = res.data.data;

          this.studentInfo = studentData;          
          this.studentDetailInfoShow = true;
        } else {
          this.$message.error('考试信息获取失败')
        }
      }).catch(err => {
        this.$message.error('考试信息获取过程中出现错误：' + err.message)
      })
    },
    studentInfoClose () {
      this.studentDetailInfoShow = false;
      this.studentInfo = {};
      this.getStudentList();
    },
    rowDelete (row) {
      this.$confirm('是否删除该学生？', '提示', {
        type: 'warning'
      }).then(() => {
        //console.log(row)
        api["deleteStudent"]({id:row.id}).then(res => {
          if (res.data.error == null) {
            this.$message.success('学生删除成功')
            this.getStudentList(this.currentPage)
          } else {
            this.$message.error('学生删除失败')
          }
        }).catch(err => {
          this.$message.error('学生删除过程中出现错误：' + err.message)
        })
      }).catch(() => {})
    },
    rowResetPassword(row){
      api["resetStudentPassword"](row).then(res => {
        if (res.data.error == null) {
          this.$message.success('学生密码重置成功')
        } else {
          this.$message.error('学生密码重置失败')
        }
      }).catch(err => {
        this.$message.error('学生密码重置过程中出现错误：' + err.message)
      })
    },
    currentChange (page) {
      this.currentPage = page
      this.getStudentList(page)
    },
    updateStudent (row) {
      api["updateStudent"](row).then(res => {
        if (res.data.error == null) {
          this.$message.success('学生更新成功')
        } else {
          this.$message.error('学生更新失败')
        }
      }).catch(err => {
        this.$message.error('学生更新过程中出现错误：' + err.message)
      })
    },
  
  importStudent () {
    this.studentImportShow = true;
  },
  submitUpload(){
    //这里要显示loading
    this.$message.success("等待上传导入结束，不要关闭页面...")
    this.$refs.upload.submit();
  },
  uploadSucceeded (response, file, fileList) {
    if (response.error == null) {
      const url=response.data.url;
      //下载返回的url中的文件
      this.studentImportShow = false;
      utils.downloadFile(url)
      this.$message.success(response.data.message)
    } else {
      this.$message.error('文件上传失败：' + response.data)
    }
  },  

  },
  
}
  
</script>

<style scoped >
</style>