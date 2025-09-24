<template>
    <div>        
        <Panel title="试卷详情">
            <el-form class="form" :model="exam_detail" label-width="120px" label-position="left" size="small">
                <el-form-item label="试卷名称">
                    <el-col :span="11">
                        <el-input
                        v-model="exam_detail.name"                        
                        placeholder="名称">
                        </el-input>
                    </el-col>
                    
                </el-form-item>
                <el-form-item label="试卷描述">
                    <el-col :span="11">
                        <el-input
                        v-model="exam_detail.desc"
                        type="textarea"
                        placeholder="描述">
                        </el-input>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <el-switch
                    v-model="exam_detail.enable"
                    active-text="启用"
                    inactive-text="禁用">
                    </el-switch>
                </el-form-item>
            </el-form>
            <button type="primary" size="small"
               @click="pop_dialog" icon="el-icon-add">
                添加题目
            </button>
            <el-table :data="exam_detail.problems">
                <el-table-column
                    width="100"
                    label="题目ID">
                    <template slot-scope="{row}">
                        {{row.problem._id}}                       
                    </template>
                </el-table-column>
                <el-table-column
                    width="100"
                    label="题目标题">
                    <template slot-scope="{row}">
                        {{row.problem.title}}
                    </template>
                </el-table-column>
                <el-table-column
                    width="200"
                    label="题目分值">
                    <template slot-scope="{row}">
                        <el-input v-model="row.score"
                            type="number"
                            placeholder="0">
                        </el-input>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template slot-scope="{row}">
                        <el-button size="mini" @click="rowDelete(row)">
                            <i class="el-icon-delete"></i> 删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-button type="primary" size="small"
               @click="updateExamDetail" icon="el-icon-check">
                更新
            </el-button>
            <el-button type="primary" size="small"
               @click="backward" icon="el-icon-close">
                返回
            </el-button>
        </Panel>
        

        <el-dialog  :visible.sync="problemListShow">
            <div class="search">
                <el-input
                    v-model="keyword"
                    prefix-icon="el-icon-search"
                    placeholder="Keywords">
                    <template #append>
                      <el-button type="primary" size="small" @click="getProblemList">过滤</el-button>
                      <el-button type="primary" size="small" @click="resetSearch">重置</el-button>
                    </template>
                </el-input>
                
            </div>
            <el-table :data="problemList">
                <el-table-column width="100"
                    label="题目ID">
                    <template slot-scope="{row}">
                        {{row._id}}
                    </template>                    
                </el-table-column>
                <el-table-column
                    width="100"
                    label="题目标题">
                    <template slot-scope="{row}">
                        {{row.title}}
                    </template>
                </el-table-column>
                
                <el-table-column>
                    <template slot-scope="{row}">
                        <el-button :disabled="row.selected" size="mini" @click="addProblem(row)" >
                            <i class="el-icon-plus"></i> 添加
                        </el-button>
                        <el-button :disabled="!row.selected" size="mini" @click="removeProblem(row)" >
                            <i class="el-icon-delete"></i> 移除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination v-if="total > 0" class="page" background layout="total, prev, pager, next" :current-page="page" :page-size="limit" :total="total" @current-change="currentChange"></el-pagination>
        </el-dialog>
        
    </div>
</template>


<script>

import api from '../../api.js'
//用于Exam的 info or edit
export default {
  name: 'ExamDetail',
  
  data () {
    return{
        routeName: '',
        keyword: '',
        exam_detail:{},

        problemListShow: false,
        problemList: [],//所有题目
        
        page: 1,
        limit: 10,
        total: 0,
    }
  },
  mounted () {
    this.routeName = this.$route.name
    let exam_detail_id = this.$route.params.exam_detail_id
    this.getExamDetail(exam_detail_id)
  },
  methods: {
    getExamDetail (id) { 
        api["getExamDetail"]({id:id}).then(res => {
            if (res.data.error == null) {
                this.exam_detail = res.data.data;
            } else {
                this.$message.error('获取试卷详情失败')
            }
        }).catch(err => {
            this.$message.error('获取试卷详情过程中出现错误：' + err.message)
        })
    },
    updateExamDetail () {
    //将exam_detail提交给后端
      api["updateExamDetail"](this.exam_detail).then(res => {
        if (res.data.error == null) {
          this.$message.success('试卷更新成功')
        } else {
          this.$message.error('试卷更新失败')
        }
      }).catch(err => {
        this.$message.error('试卷更新过程中出现错误：' + err.message)
      })
    },
    getProblemList (page=1) {
        return api["getProblemList"]({offset: (page-1)*this.limit, limit: this.limit,keyword:this.keyword}).then(res => {
            if (res.data.error == null) {
              this.problemList = res.data.data.results;
              this.total = res.data.data.total;
              //将problemList中出现在this.problems中的题目设置其属性selected为true
              for (let problem of this.problemList) {
                //problem.selected = false;
                this.$set(problem, 'selected', false);
                for (let p of this.exam_detail.problems) {
                  if (problem._id == p.problem._id) {
                    //problem.selected = true;
                    this.$set(problem, 'selected', true);
                    break;
                  }
                }
              }
              this.total = res.data.data.total;
              return res;
                
            } else {                
                throw new Error('获取题目列表失败')
            }
        }).catch(err => {
            throw err;
        })
    },
    pop_dialog () {
      //弹出对话框，从题目列表中选择题目
      this.getProblemList().then(res => {
        //console.log(this.exam_detail);
        if (res.data.error == null) {
          
          this.problemListShow = true;
        } else {
          this.$message.error('获取题目列表失败')
        }
      }).catch(err => {
        this.$message.error('获取题目列表过程中出现错误：' + err.message)
      })
      
    },
    backward () {
      this.$router.back();
    },
    resetSearch () {
      this.keyword = ''
      this.getProblemList()
    },
    currentChange(page) {
      this.page = page
      this.getProblemList(page)
    },
    addProblem (problem) {
      //添加题目到试卷
      this.exam_detail.problems.push({problem: problem, score: 0});
      this.$set(problem, 'selected', true);
      //problem.selected = true;
    },
    removeProblem (problem) {
      //从试卷中移除题目
      for (let i = 0; i < this.exam_detail.problems.length; i++) {
        if (this.exam_detail.problems[i].problem.id == problem.id) {
          this.exam_detail.problems.splice(i, 1);
          break;
        }
      }
      this.$set(problem, 'selected', false);
      //problem.selected = false;
    },
    rowDelete (row) {
      //从试卷中移除题目
      for (let i = 0; i < this.exam_detail.problems.length; i++) {
        if (this.exam_detail.problems[i].problem._id == row.problem._id) {
          this.exam_detail.problems.splice(i, 1);
          break;
        }
      }
    }
  }
}

</script>


<style scoped>
.form{
    margin: 0 0 20px 0;
}
</style>