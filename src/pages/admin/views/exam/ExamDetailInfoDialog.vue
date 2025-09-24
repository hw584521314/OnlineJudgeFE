<template>
<Panel >
      <!--绑定试卷-->
      <div>
        当前绑定试卷信息：
        <el-form :model="examDetail" inline v-show="examDetail.id!=null" label-width="80px" size="small">
          <el-form-item label="试卷ID" >
            
              <el-input v-model="examDetail.id" disabled></el-input>
            
          </el-form-item>
          <el-form-item label="试卷名称">
            
              <el-input v-model="examDetail.name" disabled></el-input>
            
          </el-form-item>
          <el-form-item label="">
            
              <el-button type="primary"  @click="unBindExamDetail(examDetail)">解绑定</el-button>
            
          </el-form-item>
        </el-form>
        
      </div>
      <div class="search">
                <el-input
                    v-model="keyword"
                    prefix-icon="el-icon-search"
                    placeholder="Keywords">
                    <template #append>                      
                      <el-button type="primary" size="small" @click="getExamDetailList">过滤</el-button>
                      <el-button type="primary" size="small" @click="resetSearch">重置</el-button>
                    </template>
                </el-input>
                
            </div>
            <el-table :data="examDetailList"
            border
            >
                <el-table-column width="100"
                    label="试卷ID">
                    <template slot-scope="{row}">
                        {{row.id}}
                    </template>                    
                </el-table-column>
                <el-table-column
                    width="100"
                    label="试卷名称">
                    <template slot-scope="{row}">
                        {{row.name}}
                    </template>
                </el-table-column>
                <el-table-column
                    width="200"
                    label="试卷描述">
                    <template slot-scope="{row}">
                        {{row.desc}}
                    </template>
                </el-table-column>
                <el-table-column
                    width="100"
                    label="详情">
                    <template slot-scope="{row}">
                        <el-button size="mini" @click="rowDetail(row)">
                            <i class="el-icon-edit"></i> 查看
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="{row}">
                        <el-button :disabled="row.selected" size="mini" @click="bindExamDetail(row)" >
                            <i class="el-icon-plus"></i> 绑定试卷
                        </el-button>                        
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                class="page"
                layout="total,prev, pager, next"
                @current-change="currentChange"
                :page-size="limit"
                
                :total="total">
            </el-pagination>
            <el-button type="primary" size="small"
                @click="updateExamDetailOfExam" icon="el-icon-check">
                更新
            </el-button>
            <el-button type="primary" size="small"
                @click="closeDialog" icon="el-icon-close">
                关闭
            </el-button>
        </Panel>
</template>

<script>
import { page } from 'vue-analytics';
import api from '../../api.js'
import utils from '@/utils/utils.js'

export default {
  name: "ExamDetailInfoDialog",
  props: {
    examInfo: {
      type: Object,
      default: () => ({})
    },
    category: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
    keyword: "",
    page: 1,
    limit: 10,
    total: 0,


    examDetail: {},    
    examDetailList: [],
    Loading: false
    };
  },
  mounted() {
    this.getExamDetail();
    this.getExamDetailList();
  },
  methods: {
    getExamDetail() {
       let params={id:this.examInfo.id,category:this.category}
      api["getExamDetailOfExam"](params).then(res => {
        if (res.data.error == null) {
          this.examDetail = res.data.data;
        } else {
          this.$message.error('获取试卷信息失败')
        }
      }).catch(err => {
        this.$message.error('获取试卷信息过程中出现错误：' + err.message)
      })
    },
    getExamDetailList() {
        let params = {
          page_idx: this.page,
          nums_per_page: this.limit,
          keyword: this.keyword,
          enable:true //这里只筛选出enable为true的结果
        };
      api["getExamDetailList"](params).then(res => {
        if (res.data.error == null) {
          this.examDetailList = res.data.data.data;
          this.total = res.data.data.total;
        } else {
          this.$message.error('获取试卷列表失败')
        }
      }).catch(err => {
        this.$message.error('获取试卷列表过程中出现错误：' + err.message)
      })
    },
    unBindExamDetail(examDetail) {
      this.$confirm('是否解除绑定？', '提示', {
        type: 'warning'
      }).then(() => {
        this.examDetail = {};
      }).catch(() => {})
    },
    bindExamDetail (examDetail) {
      this.$confirm('是否绑定试卷？', '提示', {
        type: 'warning'
      }).then(() => {
        this.examDetail = examDetail;
      }).catch(() => {})
    },
    rowDetail (row) {
      //打开新的标签页查看
      
      //this.$router.push({name: 'exam-detail-edit', params: {exam_detail_id: row.id}});
      const routeData = this.$router.resolve({name: 'exam-detail-edit', params: {exam_detail_id: row.id}});
      let routeUrl = `${window.location.origin}${routeData.href}`;
      //http://localhost:8888/admin/exam/exam_detail_edit
      window.open(routeData.href, '_blank');
    },
    resetSearch() {
      this.keyword = "";
      this.getExamDetailList();
    },
    updateExamDetailOfExam(){
      this.$confirm('是否更新试卷？', '提示', {
        type: 'warning'
      }).then(() => {
        let data={exam_id:this.examInfo.id,exam_detail_id:this.examDetail.id,category:this.category}
        api["updateExamDetailOfExam"](data).then(res => {
          if (res.data.error == null) {
            this.$message.success('更新试卷成功')
            //this.getExamList(this.currentPage)
          } else {
            this.$message.error('更新试卷失败')
          }
        }).catch(err => {
          this.$message.error('更新试卷过程中出现错误：' + err.message)
        })
      }).catch(() => {})
    },
    closeDialog() {
      this.$emit('close');
    },
    currentChange(page) {
      this.page = page;
      this.getExamDetailList();
    },
  }
};
</script>

<style scoped>
</style>